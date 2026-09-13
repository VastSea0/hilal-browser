import type { IncomingMessage, ServerResponse } from "node:http";

interface TelemetryPayload {
  event?: string;
  installation_id?: string;
  app_version?: string;
  build_number?: number;
  os_version?: number;
  device_arch?: string;
  locale?: string;
  metrics?: {
    ublock_enabled?: boolean;
    search_engine?: string;
    theme_mode?: string;
    tabs_range?: string;
    privacy_level?: number;
  };
}

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIRESTORE_COLLECTION = "hilal-browser";
const STATS_COLLECTION = "hilal-browser-stats";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Health check on GET — stats are strictly private
  if (req.method === "GET") {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const adminKey = parsedUrl.searchParams.get("key") || req.headers["x-telemetry-admin-key"];
    const configuredSecret = process.env.TELEMETRY_ADMIN_SECRET;

    // If correct admin secret provided, return real-time stats
    if (adminKey && adminKey === configuredSecret) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const summaryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${STATS_COLLECTION}/summary?key=${FIREBASE_API_KEY}`;
      const dailyUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${STATS_COLLECTION}/daily_${todayStr}?key=${FIREBASE_API_KEY}`;

      let summaryData: any = null;
      let dailyData: any = null;

      try {
        const [sRes, dRes] = await Promise.all([
          fetch(summaryUrl),
          fetch(dailyUrl),
        ]);
        if (sRes.ok) summaryData = await sRes.json();
        if (dRes.ok) dailyData = await dRes.json();
      } catch {
        // Fallback
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          status: "ok",
          service: "hilal-browser-telemetry",
          stats: {
            total_installs: Number(summaryData?.fields?.total_installs?.integerValue || 0),
            total_daily_pings: Number(summaryData?.fields?.total_pings?.integerValue || 0),
            today: {
              date: todayStr,
              new_installs: Number(dailyData?.fields?.installs?.integerValue || 0),
              active_users: Number(dailyData?.fields?.active_pings?.integerValue || 0),
            },
          },
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Default public response: zero metric exposure, only health status
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        status: "ok",
        service: "hilal-browser-telemetry",
      })
    );
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
    return;
  }

  try {
    // Read body
    const bodyText = await readBody(req, 32768); // 32KB max
    let payload: TelemetryPayload;

    try {
      payload = JSON.parse(bodyText);
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Invalid JSON payload" }));
      return;
    }

    const isFirstRun = payload.event === "first_run";
    const eventName = isFirstRun ? "first_run" : "daily_ping";

    // Validate anonymous installation ID (UUIDv4 format, alphanumeric + hyphens only)
    const rawId = typeof payload.installation_id === "string" ? payload.installation_id.trim() : "";
    const installationId = /^[a-zA-Z0-9-]{8,64}$/.test(rawId) ? rawId : "anonymous";

    // Zero-PII sanitization: ensure no URLs, personal info, or IPs are stored
    const sanitizedDocument = {
      fields: {
        event: { stringValue: eventName },
        installationId: { stringValue: installationId },
        appVersion: { stringValue: String(payload.app_version || "unknown").slice(0, 32) },
        buildNumber: { integerValue: String(Number(payload.build_number) || 0) },
        osVersion: { integerValue: String(Number(payload.os_version) || 0) },
        deviceArch: { stringValue: String(payload.device_arch || "unknown").slice(0, 32) },
        locale: { stringValue: String(payload.locale || "unknown").slice(0, 16) },
        receivedAt: { timestampValue: new Date().toISOString() },
        metrics: {
          mapValue: {
            fields: {
              ublockEnabled: { booleanValue: Boolean(payload.metrics?.ublock_enabled) },
              searchEngine: { stringValue: String(payload.metrics?.search_engine || "DuckDuckGo").slice(0, 64) },
              themeMode: { stringValue: String(payload.metrics?.theme_mode || "system").slice(0, 32) },
              tabsRange: { stringValue: String(payload.metrics?.tabs_range || "1").slice(0, 32) },
              privacyLevel: { integerValue: String(Number(payload.metrics?.privacy_level) || 0) },
            },
          },
        },
      },
    };

    // 1. Forward raw event to Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_COLLECTION}?key=${FIREBASE_API_KEY}`;
    const firestoreRes = await fetch(firestoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedDocument),
    });

    if (firestoreRes.ok) {
      // 2. Concurrently update aggregate counters (installs vs active pings)
      const todayStr = new Date().toISOString().slice(0, 10);
      const statField = isFirstRun ? "total_installs" : "total_pings";
      const dailyField = isFirstRun ? "installs" : "active_pings";

      const commitUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit?key=${FIREBASE_API_KEY}`;
      fetch(commitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writes: [
            {
              transform: {
                document: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${STATS_COLLECTION}/summary`,
                fieldTransforms: [
                  { fieldPath: statField, increment: { integerValue: 1 } },
                ],
              },
            },
            {
              transform: {
                document: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${STATS_COLLECTION}/daily_${todayStr}`,
                fieldTransforms: [
                  { fieldPath: dailyField, increment: { integerValue: 1 } },
                ],
              },
            },
          ],
        }),
      }).catch(() => {});

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ success: true, event: eventName }));
      return;
    }

    const firestoreData = await firestoreRes.json().catch(() => ({}));
    const isPermissionDenied = firestoreRes.status === 403;

    // Gracefully handle permission issues
    res.statusCode = isPermissionDenied ? 202 : 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        success: false,
        status: firestoreRes.status,
        warning: isPermissionDenied
          ? "Firestore rules need to permit create on /hilal-browser collection."
          : "Failed to forward telemetry to Firestore",
        details: firestoreData?.error?.message || "Unknown error",
      })
    );
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || "Unknown error",
      })
    );
  }
}

function readBody(req: IncomingMessage, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    let byteCount = 0;

    req.on("data", (chunk) => {
      byteCount += chunk.length;
      if (byteCount > maxBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      body += chunk.toString();
    });

    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
}
