#!/usr/bin/env node
// Render www/public/hikaye/index.html to an MP4, frame by frame, using a
// headless Chrome or Chromium over the DevTools protocol. No npm packages.
//
//   node scripts/story/render-video.mjs [--out file.mp4] [--fps 30] [--lang tr|en|off]
//   node scripts/story/render-video.mjs --stills 3,20,40 --out dir/
//
// Set CHROME to the browser binary if it is not found automatically.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const pageDir = join(root, "www/public/hikaye");
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const fps = Number(opt("--fps", "30"));
const stills = opt("--stills", null);
const out = resolve(opt("--out", stills ? "story-stills" : join(root, "obj-story/hilal-hikaye.mp4")));
const lang = opt("--lang", "tr");

const chrome = process.env.CHROME || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find(existsSync);
if (!chrome) throw new Error("Chrome not found; set CHROME");

const profile = mkdtempSync(join(tmpdir(), "hilal-story-"));
const proc = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--allow-file-access-from-files", "--hide-scrollbars", "--mute-audio", "about:blank"]);
const wsUrl = await new Promise((ok, fail) => {
  let buf = "";
  proc.stderr.on("data", d => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\S+)/);
    if (m) ok(m[1]);
  });
  proc.on("exit", c => fail(new Error(`chrome exited ${c}`)));
});

const ws = new WebSocket(wsUrl);
await new Promise(ok => ws.addEventListener("open", ok, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", e => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { ok, fail } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? fail(new Error(msg.error.message)) : ok(msg.result);
  }
});
const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
  const mid = ++id;
  pending.set(mid, { ok, fail });
  ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
});

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const page = (m, p) => send(m, p, sessionId);
const url = pathToFileURL(join(pageDir, "index.html")).href + `?export=1&lang=${lang}`;
await page("Page.navigate", { url });
const evaluate = async expr => {
  const r = await page("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "evaluate failed");
  return r.result.value;
};
for (let i = 0; i < 100; i++) {
  if (await evaluate("typeof window.renderAt === 'function' && document.fonts.status === 'loaded'")) break;
  await new Promise(r => setTimeout(r, 100));
}
const duration = await evaluate("window.STORY_DURATION");
const frame = async (t, type = "jpeg") => {
  const data = await evaluate(`renderAt(${t}); document.getElementById("c").toDataURL("image/${type}", 0.93)`);
  return Buffer.from(data.slice(data.indexOf(",") + 1), "base64");
};

try {
  if (stills) {
    mkdirSync(out, { recursive: true });
    for (const t of stills.split(",").map(Number)) {
      writeFileSync(join(out, `t${t.toFixed(2).padStart(6, "0")}.jpg`), await frame(t));
    }
    console.log(`stills in ${out}`);
  } else {
    mkdirSync(dirname(out), { recursive: true });
    const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg",
      "-i", "-", "-i", join(pageDir, "story.m4a"), "-c:v", "libx264", "-preset", "slow", "-crf", "19",
      "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", "-shortest", out], { stdio: ["pipe", "inherit", "inherit"] });
    const total = Math.ceil(duration * fps);
    for (let i = 0; i < total; i++) {
      const buf = await frame(i / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (i % (fps * 5) === 0) process.stdout.write(`\r${Math.round((i / total) * 100)}%`);
    }
    ff.stdin.end();
    await new Promise((ok, fail) => ff.on("exit", c => (c ? fail(new Error(`ffmpeg ${c}`)) : ok())));
    console.log(`\n${out}`);
  }
} finally {
  ws.close();
  const exited = new Promise(r => proc.once("exit", r));
  proc.kill();
  await exited;
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch {}
}
