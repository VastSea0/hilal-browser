import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchGithubReleases } from "../server/github.js";

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const releases = await fetchGithubReleases(12);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.end(
      JSON.stringify({
        source: "github",
        generatedAt: new Date().toISOString(),
        releases,
      })
    );
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        source: "error",
        generatedAt: new Date().toISOString(),
        releases: [],
      })
    );
  }
}
