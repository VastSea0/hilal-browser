import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchLatestAndroidApk } from "../server/github.js";

/** Redirects /android/latest.apk to the APK of the newest stable Android release. */
export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const latest = await fetchLatestAndroidApk();
    if (!latest) {
      res.statusCode = 404;
      res.setHeader("Cache-Control", "s-maxage=60");
      res.end("No Android release with an APK yet.");
      return;
    }
    res.statusCode = 302;
    res.setHeader("Location", latest.apk.browser_download_url);
    res.setHeader("X-Hilal-Release", latest.release.tag_name);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.end();
  } catch {
    res.statusCode = 302;
    res.setHeader("Location", "https://github.com/VastSea0/hilal-browser/releases");
    res.setHeader("Cache-Control", "no-store");
    res.end();
  }
}
