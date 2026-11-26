import type { IncomingMessage, ServerResponse } from "node:http";
import { createHash } from "node:crypto";
import { head, put } from "@vercel/blob";

// Shared Boosts. Hilal uploads { version, shared: { type: "boost", ... } } and
// gets back a public /boost/{id} link. Documents live in Vercel Blob, which
// needs BLOB_READ_WRITE_TOKEN; without it sharing answers 503.

// Real shares are a few hundred KB: a JPEG preview of the page measured
// 56-267 KB as a data URL at 2x and 3x pixel density, plus a favicon and
// some CSS. Anything above this is not a share Hilal makes.
export const MAX_BYTES = 1024 * 1024;
const MAX_NAME_LENGTH = 200;
const MAX_PREVIEW_LENGTH = 768 * 1024;
const MAX_ICON_LENGTH = 128 * 1024;
const MAX_CSS_LENGTH = 100 * 1024;
const MAX_SELECTORS = 200;
const MAX_SELECTOR_LENGTH = 1000;
const MAX_SIGNATURE_PATHS = 64;
const MAX_SIGNATURE_LENGTH = 64 * 1024;
const ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const ID_RE = /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/;

type Json = Record<string, unknown>;

// Fields of a boost's data as HilalBoostsManager.getEmptyBoostEntry() lists
// them. Other fields are dropped, so the store holds nothing Hilal ignores.
const NUMBER_FIELDS = [
  "dotAngleDeg",
  "dotDistance",
  "secondaryDotAngleDegDelta",
  "brightness",
  "saturation",
  "contrast",
  "sizeOverride",
];
const BOOLEAN_FIELDS = [
  "enableColorBoost",
  "smartInvert",
  "autoTheme",
  "tintBrowser",
  "nightOnly",
  "changeWasMade",
];
const POINT_FIELDS = ["dotPos", "secondaryDotPos"];
const STRING_FIELDS: Record<string, number> = {
  fontFamily: MAX_NAME_LENGTH,
  textCaseOverride: 16,
  customCSS: MAX_CSS_LENGTH,
};
const SELECTOR_FIELDS = ["zapSelectors", "focusSelectors"];

export interface BoostStore {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<unknown>;
  write(path: string, body: string): Promise<void>;
}

const blobStore: BoostStore = {
  async exists(path) {
    try {
      await head(path);
      return true;
    } catch (e) {
      return false;
    }
  },
  async read(path) {
    const blob = await head(path);
    return (await fetch(blob.url)).json();
  },
  async write(path, body) {
    await put(path, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
  },
};

function send(res: ServerResponse, status: number, body: Json) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", status == 200 ? "public, max-age=300" : "no-store");
  res.end(JSON.stringify(body));
}

// The id is taken from the content, so uploading the same share again
// points at the blob that is already there instead of making a new one.
function idFor(stored: Json) {
  const digest = createHash("sha256").update(JSON.stringify(stored)).digest();
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += ID_ALPHABET[digest[i] % ID_ALPHABET.length];
    if (i % 4 == 3 && i < 15) {
      id += "-";
    }
  }
  return id;
}

function isDomain(value: unknown) {
  return typeof value == "string" && /^[a-z0-9.-]{1,253}$/i.test(value) && value.includes(".");
}

function isImageDataUrl(value: unknown, maxLength: number) {
  return (
    value === undefined ||
    (typeof value == "string" &&
      value.length <= maxLength &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]*={0,2}$/.test(value))
  );
}

function isShortString(value: unknown, maxLength: number): value is string {
  return typeof value == "string" && value.length <= maxLength;
}

function cleanBoostData(data: unknown): Json | null {
  if (!data || typeof data != "object" || Array.isArray(data)) {
    return null;
  }
  const source = data as Json;
  const clean: Json = {};
  for (const field of NUMBER_FIELDS) {
    if (field in source) {
      if (typeof source[field] != "number" || !Number.isFinite(source[field])) {
        return null;
      }
      clean[field] = source[field];
    }
  }
  for (const field of BOOLEAN_FIELDS) {
    if (field in source) {
      if (typeof source[field] != "boolean") {
        return null;
      }
      clean[field] = source[field];
    }
  }
  for (const field of POINT_FIELDS) {
    if (field in source) {
      const point = source[field] as Json | null;
      if (
        !point ||
        typeof point != "object" ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
      ) {
        return null;
      }
      clean[field] = { x: point.x, y: point.y };
    }
  }
  for (const [field, maxLength] of Object.entries(STRING_FIELDS)) {
    if (field in source) {
      if (!isShortString(source[field], maxLength)) {
        return null;
      }
      clean[field] = source[field];
    }
  }
  if ("boostName" in source) {
    if (typeof source.boostName != "string") {
      return null;
    }
    clean.boostName = source.boostName.slice(0, MAX_NAME_LENGTH);
  }
  for (const field of SELECTOR_FIELDS) {
    if (field in source) {
      const list = source[field];
      if (
        !Array.isArray(list) ||
        list.length > MAX_SELECTORS ||
        !list.every(item => isShortString(item, MAX_SELECTOR_LENGTH))
      ) {
        return null;
      }
      clean[field] = list;
    }
  }
  return clean;
}

// A signature that is not plain path data is left out, not refused.
function cleanSignature(signature: unknown): Json | null {
  const s = signature as Json | null;
  if (
    !s ||
    typeof s != "object" ||
    !isShortString(s.viewBox, 100) ||
    !/^[\d\s.,-]*$/.test(s.viewBox) ||
    !Array.isArray(s.paths) ||
    s.paths.length > MAX_SIGNATURE_PATHS ||
    !s.paths.every((p: unknown) => typeof p == "string" && /^[MLHVCSQTAZmlhvcsqtaz\d\s.,eE+-]*$/.test(p)) ||
    s.paths.reduce((sum: number, p: string) => sum + p.length, 0) > MAX_SIGNATURE_LENGTH
  ) {
    return null;
  }
  return { viewBox: s.viewBox, paths: s.paths };
}

// Keeps only the fields Hilal reads and rejects anything of the wrong type or
// size, so the blob store cannot be used to host arbitrary data.
export function validate(doc: any): Json | null {
  const shared = doc?.shared;
  if (
    !shared ||
    typeof shared != "object" ||
    shared.type != "boost" ||
    typeof shared.name != "string" ||
    !isDomain(shared.domain) ||
    (shared.author !== undefined && typeof shared.author != "string") ||
    !isImageDataUrl(shared.icon, MAX_ICON_LENGTH) ||
    !isImageDataUrl(shared.preview, MAX_PREVIEW_LENGTH) ||
    (doc.version !== undefined && !isShortString(doc.version, 16))
  ) {
    return null;
  }
  const boostData = cleanBoostData(shared.boostData);
  const signature = cleanSignature(shared.signature);
  if (!boostData) {
    return null;
  }
  return {
    version: doc.version ?? "1",
    shared: {
      type: "boost",
      name: shared.name.slice(0, MAX_NAME_LENGTH),
      domain: shared.domain.toLowerCase(),
      boostData,
      ...(shared.author ? { author: shared.author.slice(0, MAX_NAME_LENGTH) } : {}),
      ...(shared.icon ? { icon: shared.icon } : {}),
      ...(shared.preview ? { preview: shared.preview } : {}),
      ...(signature ? { signature } : {}),
    },
  };
}

async function readBody(req: IncomingMessage): Promise<string | null> {
  const declared = Number(req.headers["content-length"]);
  if (declared > MAX_BYTES) {
    return null;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) {
      return null;
    }
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function createHandler(store: BoostStore) {
  return async function handler(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method == "GET") {
      const id = (url.searchParams.get("id") ?? "").toUpperCase();
      if (!ID_RE.test(id)) {
        return send(res, 404, { error: "not found" });
      }
      try {
        return send(res, 200, (await store.read(`boosts/${id}.json`)) as Json);
      } catch (e) {
        return send(res, 404, { error: "not found" });
      }
    }

    if (req.method == "POST") {
      const body = await readBody(req);
      if (body === null) {
        return send(res, 413, { error: "share is too large" });
      }
      let doc: Json | null = null;
      try {
        doc = validate(JSON.parse(body));
      } catch (e) {}
      if (!doc) {
        return send(res, 422, { error: "not a Boost share" });
      }
      const name = url.searchParams.get("name")?.slice(0, MAX_NAME_LENGTH) || null;
      const id = idFor({ name, data: doc });
      const path = `boosts/${id}.json`;
      if (!(await store.exists(path))) {
        const stored = { id, name, createdAt: new Date().toISOString(), data: doc };
        await store.write(path, JSON.stringify(stored));
      }
      return send(res, 201, { id, webUrl: `/boost/${id}` });
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "method not allowed" });
  };
}

const handleWithBlob = createHandler(blobStore);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return send(res, 503, { error: "Boost sharing is not set up on this server" });
  }
  return handleWithBlob(req, res);
}
