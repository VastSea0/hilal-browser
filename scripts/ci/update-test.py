#!/usr/bin/env python3
"""Update an installed Hilal release to a new build through its own updater.

    python3 scripts/ci/update-test.py --old-dir old/firefox --mar new.complete.mar \
        --new-ini new/firefox/application.ini --out update-test

Serves an update.xml offering the MAR from a local server, points the old
install's update policy at it, lets the old browser download, verify and stage
the update, restarts it and checks that the new build is the one running. This
is what users of the previous release go through, so a broken signing key,
channel or updater shows up here before a release ships.
"""

import argparse
import configparser
import hashlib
import http.server
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

spec = importlib.util.spec_from_file_location("ui_smoke", Path(__file__).with_name("ui-smoke.py"))
ui_smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ui_smoke)
Marionette, MarionetteError, free_port = ui_smoke.Marionette, ui_smoke.MarionetteError, ui_smoke.free_port

CHECK_JS = """
const [resolve] = arguments;
const { AppUpdater } = ChromeUtils.importESModule("resource://gre/modules/AppUpdater.sys.mjs");
const S = AppUpdater.STATUS;
const names = Object.fromEntries(
  Object.entries(S).filter(([, v]) => typeof v == "number").map(([k, v]) => [v, k])
);
const seen = [];
const au = new AppUpdater();
au.addListener(status => {
  seen.push(names[status]);
  if (status == S.DOWNLOAD_AND_INSTALL) {
    au.allowUpdateDownload();
  } else if (S.isTerminalStatus(status)) {
    resolve({ status: names[status], seen });
  }
});
au.check();
"""

APP_JS = """
const { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");
return {
  buildID: Services.appinfo.appBuildID,
  version: Services.appinfo.version,
  display: AppConstants.MOZ_APP_VERSION_DISPLAY,
};
"""


def launch(binary, profile, log):
    env = dict(os.environ, MOZ_CRASHREPORTER_DISABLE="1", MOZ_DISABLE_AUTO_SAFE_MODE="1")
    cmd = [binary, "-no-remote", "-marionette", "-remote-allow-system-access", "-profile", str(profile)]
    print("Launching:", " ".join(cmd), flush=True)
    return subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT, env=env)


def session(port, timeout=120):
    m = Marionette(port, timeout=timeout)
    m.send("WebDriver:NewSession", {"capabilities": {}})
    m.send("WebDriver:SetTimeouts", {"script": 600000})
    m.context("chrome")
    return m


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--old-dir", required=True, help="install directory of the previous release")
    parser.add_argument("--mar", required=True, help="complete MAR of the new build")
    parser.add_argument("--new-ini", required=True, help="application.ini of the new build")
    parser.add_argument("--binary-name", default="firefox")
    parser.add_argument("--out", default="update-test")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    old_dir = Path(args.old_dir).resolve()
    binary = str(old_dir / args.binary_name)

    ini = configparser.ConfigParser()
    ini.read(args.new_ini)
    new_build = ini["App"]["BuildID"]
    new_version = ini["App"]["Version"]

    mar = Path(args.mar).resolve()
    data = mar.read_bytes()
    serve_dir = Path(tempfile.mkdtemp(prefix="hilal-updates-"))
    (serve_dir / "update.mar").write_bytes(data)
    port = free_port()
    base = f"http://127.0.0.1:{port}"
    (serve_dir / "update.xml").write_text(
        '<?xml version="1.0"?>\n<updates>\n'
        f'  <update type="minor" displayVersion="test" appVersion="{new_version}" '
        f'platformVersion="{new_version}" buildID="{new_build}" actions="showURL">\n'
        f'    <patch type="complete" URL="{base}/update.mar" hashFunction="sha512" '
        f'hashValue="{hashlib.sha512(data).hexdigest()}" size="{len(data)}"/>\n'
        "  </update>\n</updates>\n"
    )

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(serve_dir), **kw)

        def translate_path(self, path):
            # Firefox asks for /update.xml?force=1 and the like.
            return str(serve_dir / Path(path.split("?")[0]).name)

        def log_message(self, fmt, *a):
            print("server:", fmt % a, flush=True)

    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    policies_path = old_dir / "distribution" / "policies.json"
    policies = json.loads(policies_path.read_text())
    policies["policies"]["AppUpdateURL"] = f"{base}/update.xml"
    policies["policies"].pop("DisableAppUpdate", None)
    policies_path.write_text(json.dumps(policies, indent=2))

    profile = Path(tempfile.mkdtemp(prefix="hilal-update-"))
    mport = free_port()
    prefs = {
        "marionette.port": mport,
        # Marionette's recommended prefs turn updates off for automation.
        "remote.prefs.recommended": False,
        "app.update.disabledForTesting": False,
        "app.update.auto": True,
        "app.update.staging.enabled": True,
        "app.update.log": True,
        "browser.shell.checkDefaultBrowser": False,
        "hilal.welcome-screen.seen": True,
    }
    (profile / "user.js").write_text(
        "".join(f"user_pref({json.dumps(k)}, {json.dumps(v)});\n" for k, v in prefs.items())
    )

    report = {"new_build": new_build, "new_version": new_version}
    ok = False
    log = open(out / "browser.log", "w")
    try:
        proc = launch(binary, profile, log)
        m = session(mport)
        report["before"] = m.script(APP_JS)
        print("Running:", report["before"], flush=True)
        if report["before"]["buildID"] >= new_build:
            raise MarionetteError(f"old build {report['before']['buildID']} is not older than {new_build}")

        result = m.script(CHECK_JS, asynchronous=True)
        report["check"] = result
        print("Update check:", result, flush=True)
        if result["status"] != "READY_FOR_RESTART":
            raise MarionetteError(f"update did not get ready: {result}")

        try:
            m.send("Marionette:Quit", {"flags": ["eForceQuit"]})
        except MarionetteError:
            pass
        proc.wait(timeout=60)

        # The next start applies the staged update and relaunches the browser
        # with the same arguments, so Marionette comes back on the same port.
        proc = launch(binary, profile, log)
        m = session(mport, timeout=300)
        deadline = time.time() + 120
        after = m.script(APP_JS)
        while after["buildID"] != new_build and time.time() < deadline:
            time.sleep(2)
            try:
                m = session(mport, timeout=30)
                after = m.script(APP_JS)
            except MarionetteError:
                pass
        report["after"] = after
        print("After restart:", after, flush=True)
        ok = after["buildID"] == new_build
        try:
            m.send("Marionette:Quit", {"flags": ["eForceQuit"]})
        except MarionetteError:
            pass
    except Exception as e:  # noqa: BLE001 - report every failure the same way
        report["error"] = f"{type(e).__name__}: {e}"
        print("ERROR", report["error"], flush=True)
    finally:
        server.shutdown()
        subprocess.run(["pkill", "-f", str(profile)], check=False)
        for name in ("last-update.log", "updates/0/update.log", "updates/last-update.log"):
            for root in (old_dir, Path.home() / ".cache" / "mozilla"):
                for f in (root.rglob(Path(name).name) if root.is_dir() else []):
                    if f.is_file() and f.stat().st_size < 5_000_000:
                        (out / f"{f.parent.name}-{f.name}").write_bytes(f.read_bytes())
        report["ok"] = ok
        (out / "report.json").write_text(json.dumps(report, indent=2))
        print("PASS" if ok else "FAIL", "update from the previous release", flush=True)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
