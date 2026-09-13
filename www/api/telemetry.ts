import type { IncomingMessage, ServerResponse } from "node:http";

interface TelemetryPayload {
  event?: string;
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

  // Health check on GET
  if (req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        status: "ok",
        service: "hilal-browser-telemetry",
        targetCollection: FIRESTORE_COLLECTION,
        timestamp: new Date().toISOString(),
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

    // Zero-PII sanitization: ensure no URLs, personal info, or IPs are stored
    const sanitizedDocument = {
      fields: {
        event: { stringValue: String(payload.event || "daily_ping").slice(0, 64) },
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

    // Forward to Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_COLLECTION}?key=${FIREBASE_API_KEY}`;
    const firestoreRes = await fetch(firestoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedDocument),
    });

    if (firestoreRes.ok) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ success: true }));
      return;
    }

    const firestoreData = await firestoreRes.json().catch(() => ({}));
    const isPermissionDenied = firestoreRes.status === 403;

    // Gracefully handle permission issues (e.g. while user is setting rules in Firebase Console)
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
