#!/usr/bin/env python3
"""Launch a packaged Hilal build and check the browser chrome through Marionette.

Runs on Linux, macOS and Windows with only the Python standard library, so CI
can test release packages on real runners without a Firefox source tree.

    python3 scripts/ci/ui-smoke.py --binary path/to/hilal --out ui-smoke

Writes screenshots, report.json and summary.md into --out. Exits non-zero when
a check fails.
"""

import argparse
import base64
import json
import os
import platform
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path


class MarionetteError(Exception):
    pass


class Marionette:
    def __init__(self, port, timeout=90):
        deadline = time.time() + timeout
        last_error = None
        while time.time() < deadline:
            try:
                self.sock = socket.create_connection(("127.0.0.1", port), timeout=10)
                break
            except OSError as e:
                last_error = e
                time.sleep(0.5)
        else:
            raise MarionetteError(f"could not connect to Marionette: {last_error}")
        self.sock.settimeout(120)
        self.buf = b""
        self.msg_id = 0
        self._read()  # server hello

    def _read(self):
        while b":" not in self.buf:
            self._recv()
        length, self.buf = self.buf.split(b":", 1)
        length = int(length)
        while len(self.buf) < length:
            self._recv()
        data, self.buf = self.buf[:length], self.buf[length:]
        return json.loads(data)

    def _recv(self):
        chunk = self.sock.recv(1 << 20)
        if not chunk:
            raise MarionetteError("Marionette connection closed")
        self.buf += chunk

    def send(self, name, params=None):
        self.msg_id += 1
        data = json.dumps([0, self.msg_id, name, params or {}]).encode()
        self.sock.sendall(str(len(data)).encode() + b":" + data)
        while True:
            msg = self._read()
            if msg[0] == 1 and msg[1] == self.msg_id:
                break
        _, _, error, result = msg
        if error:
            raise MarionetteError(f"{name}: {error.get('error')}: {error.get('message')}")
        return result

    def script(self, source, args=None, asynchronous=False):
        command = "WebDriver:ExecuteAsyncScript" if asynchronous else "WebDriver:ExecuteScript"
        result = self.send(command, {"script": source, "args": args or []})
        return result.get("value") if isinstance(result, dict) else result

    def context(self, name):
        self.send("Marionette:SetContext", {"value": name})

    def screenshot(self, path):
        result = self.send("WebDriver:TakeScreenshot", {"full": False, "hash": False})
        Path(path).write_bytes(base64.b64decode(result["value"]))


USER_PREFS = {
    "browser.shell.checkDefaultBrowser": False,
    "browser.startup.homepage_override.mstone": "ignore",
    "browser.aboutwelcome.enabled": False,
    "datareporting.policy.dataSubmissionEnabled": False,
    "app.update.disabledForTesting": True,
    "browser.sessionstore.resume_from_crash": False,
    "toolkit.startup.max_resumed_crashes": -1,
    "dom.disable_open_during_load": False,
}

# Collects the state of the Hilal shell; runs in the chrome window.
STATE_JS = r"""
const doc = document;
const rect = el => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    x: Math.round(r.x), y: Math.round(r.y),
    w: Math.round(r.width), h: Math.round(r.height),
    display: cs.display, visibility: cs.visibility,
  };
};
const buttons = {};
for (const cls of ["titlebar-min", "titlebar-max", "titlebar-restore", "titlebar-close"]) {
  const el = doc.querySelector("#hilal-traffic-lights-spacer ." + cls) ||
             doc.querySelector("#hilal-welcome-overlay ." + cls);
  buttons[cls] = rect(el);
}
const root = doc.documentElement;
return {
  platform: AppConstants.platform,
  version: AppConstants.MOZ_APP_VERSION_DISPLAY,
  customtitlebar: root.hasAttribute("customtitlebar"),
  sizemode: root.getAttribute("sizemode"),
  tabMode: root.getAttribute("data-tab-mode"),
  window: { w: window.innerWidth, h: window.innerHeight },
  shell: !!window.gHilalShell,
  shellErrors: window.gHilalShell?.startupErrors || [],
  headerShell: rect(doc.getElementById("hilal-header-shell")),
  // Firefox's own chrome; with the shell running neither may take up room.
  nativeNavBar: rect(doc.getElementById("nav-bar")),
  nativeSidebar: rect(doc.querySelector("sidebar-main")),
  locale: Services.locale.appLocaleAsBCP47,
  topbar: rect(doc.getElementById("hilal-topbar")),
  urlbar: rect(doc.querySelector("#hilal-header-shell input, #hilal-url-input")),
  welcome: !!doc.getElementById("hilal-welcome-overlay"),
  buttonBox: rect(doc.querySelector("#hilal-welcome-overlay .titlebar-buttonbox-container") ||
                  doc.querySelector("#hilal-traffic-lights-spacer .titlebar-buttonbox-container")),
  buttons,
  tabs: gBrowser.tabs.length,
  selectedURL: gBrowser.selectedBrowser.currentURI.spec,
};
"""

# Errors logged from chrome code since startup, Hilal files first.
ERRORS_JS = r"""
const out = [];
for (const m of Services.console.getMessageArray() || []) {
  let e;
  try { e = m.QueryInterface(Ci.nsIScriptError); } catch (_) { continue; }
  if (e.flags & Ci.nsIScriptError.warningFlag) continue;
  if (!e.sourceName || !/^(chrome|resource):/.test(e.sourceName)) continue;
  out.push({ source: e.sourceName, line: e.lineNumber, message: e.errorMessage });
}
return out;
"""


ADDONS_JS = r"""
const resolve = arguments[arguments.length - 1];
const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
AddonManager.getAllAddons().then(
  list => resolve(list.map(a => ({ id: a.id, type: a.type, active: a.isActive }))),
  e => resolve([{ id: "error", type: String(e), active: false }])
);
"""

POLICIES_JS = r"""
const active = Services.policies.getActivePolicies() || {};
const status = { 0: "inactive", 1: "active", 2: "failed" }[Services.policies.status] || String(Services.policies.status);
const key = Services.urlFormatter.formatURL("%GOOGLE_SAFEBROWSING_API_KEY%");
return {
  status,
  names: Object.keys(active),
  updateURL: active.AppUpdateURL ? String(active.AppUpdateURL.spec || active.AppUpdateURL) : null,
  updatesDisabled: !!active.DisableAppUpdate || !Services.policies.isAllowed("appUpdate"),
  safebrowsingKey: !!key && !key.includes("no-google-safebrowsing-api-key") && !key.startsWith("%"),
};
"""


def wait_for(m, js, timeout=60, interval=0.5):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if m.script(js):
            return True
        time.sleep(interval)
    return False


def os_screenshot(path):
    """Grab the whole screen, which includes popups Marionette cannot draw."""
    try:
        if sys.platform.startswith("linux") and shutil.which("import"):
            subprocess.run(["import", "-window", "root", str(path)], check=True, timeout=30)
            return True
        if sys.platform == "win32":
            ps = (
                "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;"
                "$b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds;"
                "$i=New-Object System.Drawing.Bitmap $b.Width,$b.Height;"
                "$g=[System.Drawing.Graphics]::FromImage($i);"
                "$g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size);"
                f"$i.Save('{path}')"
            )
            subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True, timeout=30)
            return True
    except (OSError, subprocess.SubprocessError) as e:
        print("screen capture failed:", e, flush=True)
    return False


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--binary", required=True)
    parser.add_argument("--out", default="ui-smoke")
    parser.add_argument("--timeout", type=int, default=120)
    parser.add_argument("--pref", action="append", default=[], metavar="NAME=JSON",
                        help="extra pref for the test profile, e.g. browser.tabs.inTitlebar=1")
    parser.add_argument("--expect-updates", choices=["hilal", "disabled", "any"], default="hilal",
                        help="hilal: updates come from Hilal's server; disabled: Flatpak and other package managers")
    parser.add_argument("--locale", help="app locale to run in, e.g. tr")
    parser.add_argument("--no-restart", action="store_true", help="skip the restart check")
    parser.add_argument("--require-safebrowsing", action="store_true",
                        help="fail when the build has no Google Safe Browsing key")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    profile = Path(tempfile.mkdtemp(prefix="hilal-smoke-"))
    port = free_port()
    prefs = dict(USER_PREFS, **{"marionette.port": port})
    if args.locale:
        prefs["intl.locale.requested"] = args.locale
    for item in args.pref:
        name, value = item.split("=", 1)
        prefs[name] = json.loads(value)
    (profile / "user.js").write_text(
        "".join(f"user_pref({json.dumps(k)}, {json.dumps(v)});\n" for k, v in prefs.items())
    )

    log = open(out / "browser.log", "w")
    env = dict(os.environ, MOZ_CRASHREPORTER_DISABLE="1", MOZ_DISABLE_AUTO_SAFE_MODE="1")
    cmd = [args.binary, "-no-remote", "-marionette", "-remote-allow-system-access",
           "-purgecaches", "-profile", str(profile)]
    print("Launching:", " ".join(cmd), flush=True)
    proc = subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT, env=env)

    checks = []
    report = {"host": platform.platform(), "checks": checks}

    def check(name, ok, detail=None, known_issue=None):
        """known_issue: a tracked bug; the check is reported but does not fail the run."""
        status = "PASS" if ok else ("WARN" if known_issue else "FAIL")
        checks.append({"name": name, "ok": bool(ok), "status": status, "detail": detail,
                       "known_issue": known_issue})
        print(f"{status} {name}" + (f": {known_issue or detail}" if detail and not ok else ""), flush=True)

    try:
        m = Marionette(port, timeout=args.timeout)
        m.send("WebDriver:NewSession", {"capabilities": {"alwaysMatch": {"acceptInsecureCerts": True}}})
        m.send("WebDriver:SetTimeouts", {"script": 60000})
        m.context("chrome")

        check("browser window opened", wait_for(m, "return typeof gBrowser != 'undefined' && !!gBrowser.selectedBrowser", 60))
        check("Hilal shell started", wait_for(m, "return !!document.getElementById('hilal-header-shell')", 60))
        time.sleep(2)

        state = m.script(STATE_JS)
        report["first_run"] = state
        m.screenshot(out / "01-first-run.png")
        check("welcome screen shown on first run", state["welcome"])

        is_mac = state["platform"] == "macosx"

        def check_window_buttons(label, s):
            b = s["buttons"]
            if not s["customtitlebar"]:
                check(f"{label}: system titlebar in use, no own window buttons", b["titlebar-close"] is None or b["titlebar-close"]["display"] == "none" or b["titlebar-close"]["w"] == 0)
                return
            if is_mac:
                box = s["buttonBox"]
                check(f"{label}: macOS traffic lights have room", box and box["w"] > 0 and box["display"] != "none", box)
                return
            maxish = b["titlebar-restore"] if s["sizemode"] == "maximized" else b["titlebar-max"]
            for name, r in (("minimize", b["titlebar-min"]), ("maximize/restore", maxish), ("close", b["titlebar-close"])):
                visible = r and r["w"] > 0 and r["h"] > 0 and r["display"] != "none" and r["visibility"] == "visible"
                inside = visible and 0 <= r["x"] and r["x"] + r["w"] <= s["window"]["w"] + 1 and r["y"] < 80
                check(f"{label}: {name} button visible", visible, r)
                check(f"{label}: {name} button inside the top of the window", inside, r)

        check_window_buttons("welcome", state)
        if args.locale:
            check(f"running in {args.locale}", state["locale"] == args.locale, state["locale"])

        def check_shell(label, s):
            """The Hilal shell is what users see, not Firefox's own chrome."""
            hs, nav, side = s["headerShell"], s["nativeNavBar"], s["nativeSidebar"]
            check(f"{label}: Hilal top bar shown", bool(hs and hs["w"] > 200 and hs["h"] > 0 and hs["display"] != "none"), hs)
            hidden = lambda r: not r or r["w"] == 0 or r["h"] == 0 or r["display"] == "none" or r["visibility"] != "visible"
            check(f"{label}: Firefox's own toolbar hidden", hidden(nav), nav)
            check(f"{label}: Firefox's own sidebar hidden", hidden(side), side)
            check(f"{label}: shell started without errors", not s["shellErrors"], s["shellErrors"])

        # Go through the welcome screen the way a user does: Start, then Next
        # on every step and Finish, keeping the default choices.
        for step in range(6):
            if not m.script("return !!document.getElementById('hilal-welcome-overlay')"):
                break
            m.screenshot(out / f"01-welcome-{step}.png")
            m.script("document.querySelector('#hilal-welcome-overlay .hw-primary')?.click()")
            time.sleep(1)
        check("welcome screen finishes", wait_for(m, "return !document.getElementById('hilal-welcome-overlay')", 15))
        time.sleep(2)
        state = m.script(STATE_JS)
        report["after_welcome"] = state
        m.screenshot(out / "01-after-welcome.png")
        check_shell("after welcome", state)

        for mode in ("vertical", "dual", "horizontal"):
            m.script("gHilalShell.setTabMode(arguments[0], false)", [mode])
            time.sleep(1)
            s = m.script(STATE_JS)
            report[f"mode_{mode}"] = s
            m.screenshot(out / f"02-mode-{mode}.png")
            check(f"{mode} tabs: top bar laid out", s["topbar"] and s["topbar"]["w"] > 200 and s["topbar"]["h"] > 0, s["topbar"])
            check_window_buttons(f"{mode} tabs", s)
        m.script("gHilalShell.setTabMode(arguments[0], false)", ["vertical"])

        # Load a page in the content process.
        page = "data:text/html;charset=utf-8,<title>Hilal smoke</title><h1 style='font:48px sans-serif'>Hilal smoke page</h1>"
        m.script("gBrowser.selectedBrowser.loadURI(Services.io.newURI(arguments[0]), {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()})", [page])
        check("page loads in a tab", wait_for(m, "return gBrowser.selectedBrowser.contentTitle == 'Hilal smoke'", 30))
        time.sleep(1)
        m.screenshot(out / "03-page.png")

        before = m.script("return gBrowser.tabs.length")
        m.script("gHilalShell.openNewTab()")
        check("new tab opens", wait_for(m, f"return gBrowser.tabs.length == {before + 1}", 10))
        time.sleep(2)
        m.screenshot(out / "04-new-tab.png")
        check("new tab page loads", "newtab" in m.script("return gBrowser.selectedBrowser.currentURI.spec") or "hilal" in m.script("return gBrowser.selectedBrowser.currentURI.spec"),
              m.script("return gBrowser.selectedBrowser.currentURI.spec"))

        m.script("gBrowser.removeTab(gBrowser.selectedTab)")
        check("tab closes", wait_for(m, f"return gBrowser.tabs.length == {before}", 10))

        # Release-critical pieces that only show up in a running browser.
        addons = None
        deadline = time.time() + 30
        while time.time() < deadline:
            addons = m.script(ADDONS_JS, asynchronous=True)
            if any(a["id"] == "uBlock0@raymondhill.net" and a["active"] for a in addons):
                break
            time.sleep(1)
        report["addons"] = addons
        check("bundled uBlock Origin is installed and active",
              any(a["id"] == "uBlock0@raymondhill.net" and a["active"] for a in addons), addons)
        locales = m.script("return Services.locale.availableLocales")
        report["locales"] = locales
        check("Turkish is built in", "tr" in locales, locales)

        policies = m.script(POLICIES_JS)
        report["policies"] = policies
        check("enterprise policies loaded without errors", policies["status"] == "active", policies)
        if args.expect_updates == "hilal":
            check("updates point at the Hilal update server",
                  "hilal-browser.vercel.app/update/" in (policies["updateURL"] or ""), policies)
        elif args.expect_updates == "disabled":
            check("built-in updater is disabled", policies["updatesDisabled"], policies)

        report["safebrowsing_key"] = policies["safebrowsingKey"]
        if args.require_safebrowsing:
            check("Safe Browsing has an API key", policies["safebrowsingKey"], policies)

        rfp = {}
        for level in ("extreme", "standard"):
            m.script(f"Services.prefs.setStringPref('hilal.privacy.level', '{level}')")
            wait_for(m, f"return Services.prefs.getBoolPref('privacy.resistFingerprinting') == {str(level == 'extreme').lower()}", 10)
            rfp[level] = m.script("return Services.prefs.getBoolPref('privacy.resistFingerprinting')")
        report["resist_fingerprinting"] = rfp
        check("Extreme privacy turns fingerprinting resistance on", rfp["extreme"] is True, rfp)
        check("Standard privacy leaves it off", rfp["standard"] is False, rfp)

        # Automatic colors, against a local page that declares a theme color.
        import http.server, threading
        page_dir = Path(tempfile.mkdtemp(prefix="hilal-site-"))
        (page_dir / "index.html").write_text(
            "<!doctype html><meta name='theme-color' content='#e8590c'>"
            "<title>Hilal colors</title><body style='background:#fff'><h1>Colors</h1>"
        )
        handler = lambda *a, **kw: http.server.SimpleHTTPRequestHandler(*a, directory=str(page_dir), **kw)
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        site = f"http://127.0.0.1:{server.server_address[1]}/"
        m.script("""
          Services.prefs.setStringPref('hilal.boosts.auto.mode', 'all');
          Services.prefs.setBoolPref('hilal.theme.followSite', true);
        """)
        m.script("gBrowser.selectedBrowser.loadURI(Services.io.newURI(arguments[0]), {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()})", [site])
        check("local page loads", wait_for(m, "return gBrowser.selectedBrowser.contentTitle == 'Hilal colors'", 30))
        check("automatic boost recolors an unboosted site",
              wait_for(m, "return gBrowser.selectedBrowser.browsingContext.hilalBoostsData != 0", 10))
        check("browser takes the site's theme color",
              wait_for(m, "return MaterialYouTheme._siteColor == '#e8590c'", 10),
              m.script("return MaterialYouTheme._siteColor"))
        time.sleep(1)
        m.screenshot(out / "05-site-colors.png")
        m.script("""
          Services.prefs.setStringPref('hilal.boosts.auto.mode', 'off');
          Services.prefs.setBoolPref('hilal.theme.followSite', false);
        """)
        check("turning automatic boosts off restores the site",
              wait_for(m, "return gBrowser.selectedBrowser.browsingContext.hilalBoostsData == 0", 10))
        server.shutdown()

        # Hilal's own website learns the browser's accent; needs the network.
        m.script("gBrowser.selectedBrowser.loadURI(Services.io.newURI('https://hilal-browser.vercel.app/'), {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()})")
        if wait_for(m, "return gBrowser.selectedBrowser.currentURI.host == 'hilal-browser.vercel.app' && !gBrowser.selectedBrowser.webProgress.isLoadingDocument", 30):
            # Marionette's content context stays on the tab the session
            # started with; switch to the tab showing the site.
            chrome_handle = m.send("WebDriver:GetWindowHandle")
            chrome_handle = chrome_handle.get("value", chrome_handle) if isinstance(chrome_handle, dict) else chrome_handle
            m.context("content")
            handles = m.send("WebDriver:GetWindowHandles")
            handles = handles.get("value", handles) if isinstance(handles, dict) else handles
            for handle in reversed(handles):
                m.send("WebDriver:SwitchToWindow", {"handle": handle})
                if "hilal-browser.vercel.app" in m.script("return location.host"):
                    break
            marked = wait_for(m, "return !!document.documentElement.getAttribute('data-hilal-accent')", 15)
            attrs = m.script("return [document.documentElement.getAttribute('data-hilal-browser'), document.documentElement.getAttribute('data-hilal-accent')]")
            m.context("chrome")
            m.send("WebDriver:SwitchToWindow", {"handle": chrome_handle})
            check("Hilal's website gets the browser's accent", marked, attrs)
            time.sleep(2)
            m.screenshot(out / "05-hilal-website.png")
        else:
            print("SKIP Hilal's website did not load (no network?)", flush=True)

        # Material surfaces drawn by Firefox's own components, for review.
        m.script("gHilalShell.openAppMenu(document.getElementById('PanelUI-menu-button'))")
        check("Hilal menu opens", wait_for(m, "return document.querySelectorAll('#hilal-app-menu .ham-row').length > 10", 10))
        time.sleep(1)
        m.screenshot(out / "06-app-menu.png")
        labels = m.script("return [...document.querySelectorAll('#hilal-app-menu .ham-label')].map(e => e.textContent)")
        check("Hilal menu items are labelled", all(labels), labels)
        m.script("document.getElementById('hilal-app-menu')?.remove()")

        m.script("gHilalWorkspaces._showCreateDialog()")
        check("workspace dialog opens", wait_for(m, "return !!document.getElementById('hilal-ws-dialog')", 10))
        # Fluent fills in the text asynchronously.
        wait_for(m, "return !!document.querySelector('#hilal-ws-dialog h3')?.textContent", 5)
        time.sleep(0.5)
        m.screenshot(out / "07-workspace-dialog.png")
        dialog = m.script("""
          const d = document.getElementById('hilal-ws-dialog');
          return {
            title: d.querySelector('h3').textContent,
            buttons: [...d.querySelectorAll('moz-button')].map(b => b.label),
          };
        """)
        report["workspace_dialog"] = dialog
        translated = all(dialog["buttons"]) and dialog["title"] not in ("", "hilal-ws-dialog-new-title")
        if args.locale == "tr":
            translated = translated and dialog["title"].lower() != "new workspace" and "Create" not in dialog["buttons"]
        check("workspace dialog is translated", translated, dialog)
        m.script("document.getElementById('hilal-ws-dialog-overlay')?.remove()")

        before_handles = m.send("WebDriver:GetWindowHandles")
        before_handles = before_handles.get("value", before_handles) if isinstance(before_handles, dict) else before_handles
        main_handle = m.send("WebDriver:GetWindowHandle")
        main_handle = main_handle.get("value", main_handle) if isinstance(main_handle, dict) else main_handle
        m.script("openAboutDialog()")
        about = None
        deadline = time.time() + 15
        while time.time() < deadline and not about:
            handles = m.send("WebDriver:GetWindowHandles")
            handles = handles.get("value", handles) if isinstance(handles, dict) else handles
            new = [h for h in handles if h not in before_handles]
            about = new[0] if new else None
            time.sleep(0.5)
        check("About dialog opens", bool(about))
        if about:
            m.send("WebDriver:SwitchToWindow", {"handle": about})
            time.sleep(2)
            m.screenshot(out / "08-about.png")
            m.script("window.close()")
            m.send("WebDriver:SwitchToWindow", {"handle": main_handle})

        # Errors from the first run; the restarted process has its own console.
        errors = m.script(ERRORS_JS)

        # Users start the browser again with the same profile; the shell has to
        # come back then too.
        if not args.no_restart:
            try:
                m.send("Marionette:Quit", {"flags": ["eRestart", "eAttemptQuit"]})
            except MarionetteError:
                pass
            m = Marionette(port, timeout=args.timeout)
            m.send("WebDriver:NewSession", {"capabilities": {"alwaysMatch": {"acceptInsecureCerts": True}}})
            m.send("WebDriver:SetTimeouts", {"script": 60000})
            m.context("chrome")
            check("browser restarts", wait_for(m, "return typeof gBrowser != 'undefined' && !!gBrowser.selectedBrowser", 60))
            wait_for(m, "return !!document.getElementById('hilal-header-shell')", 30)
            time.sleep(3)
            state = m.script(STATE_JS)
            report["after_restart"] = state
            m.screenshot(out / "05-after-restart.png")
            check("no welcome screen after restart", not state["welcome"])
            check_shell("after restart", state)
            errors += m.script(ERRORS_JS)

        report["chrome_errors"] = errors
        hilal_errors = [e for e in errors if "hilal" in e["source"].lower()]
        check("no errors from Hilal chrome code", not hilal_errors, hilal_errors[:10])

        try:
            m.send("Marionette:Quit", {"flags": ["eForceQuit"]})
        except MarionetteError:
            pass
    except Exception as e:
        check("smoke run finished", False, f"{type(e).__name__}: {e}")
    finally:
        try:
            proc.wait(timeout=30)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
        log.close()
        shutil.rmtree(profile, ignore_errors=True)

    (out / "report.json").write_text(json.dumps(report, indent=2))
    failed = [c for c in checks if c["status"] == "FAIL"]
    lines = [f"## Hilal UI smoke ({report['host']})", ""]
    lines += [f"- {c['status']} {c['name']}" + (f" ({c['known_issue']})" if c['status'] == 'WARN' else "") for c in checks]
    if failed:
        lines += ["", "### Failures", ""]
        lines += [f"- {c['name']}: `{json.dumps(c['detail'])}`" for c in failed]
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print(f"{len(checks) - len(failed)}/{len(checks)} checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
