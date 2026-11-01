import type { IncomingMessage, ServerResponse } from "node:http";
import { randomInt } from "node:crypto";
import { head, put } from "@vercel/blob";

// Shared Boosts. Hilal uploads { version, shared: { type: "boost", ... } } and
// gets back a public /boost/{id} link. Documents live in Vercel Blob, which
// needs BLOB_READ_WRITE_TOKEN; without it sharing answers 503.

// Vercel functions reject request bodies over 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;
const ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const ID_RE = /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/;

type Json = Record<string, unknown>;

function send(res: ServerResponse, status: number, body: Json) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", status == 200 ? "public, max-age=300" : "no-store");
  res.end(JSON.stringify(body));
}

function newId() {
  const group = () =>
    Array.from({ length: 4 }, () => ID_ALPHABET[randomInt(ID_ALPHABET.length)]).join("");
  return [group(), group(), group(), group()].join("-");
}

function isDomain(value: unknown) {
  return typeof value == "string" && /^[a-z0-9.-]{1,253}$/i.test(value) && value.includes(".");
}

function isImageDataUrl(value: unknown) {
  return value === undefined || (typeof value == "string" && /^data:image\/(png|jpeg|webp);base64,/.test(value));
}

// Keeps only the fields Hilal reads, so the blob store cannot be used to host
// arbitrary JSON.
function validate(doc: any): Json | null {
  const shared = doc?.shared;
  if (
    !shared ||
    shared.type != "boost" ||
    typeof shared.name != "string" ||
    !isDomain(shared.domain) ||
    !shared.boostData ||
    typeof shared.boostData != "object" ||
    Array.isArray(shared.boostData) ||
    (shared.author !== undefined && typeof shared.author != "string") ||
    !isImageDataUrl(shared.icon) ||
    !isImageDataUrl(shared.preview)
  ) {
    return null;
  }
  const signature = shared.signature;
  const cleanSignature =
    signature &&
    typeof signature.viewBox == "string" &&
    Array.isArray(signature.paths) &&
    signature.paths.every((p: unknown) => typeof p == "string")
      ? { viewBox: signature.viewBox, paths: signature.paths }
      : undefined;
  return {
    version: typeof doc.version == "string" ? doc.version : "1",
    shared: {
      type: "boost",
      name: shared.name.slice(0, MAX_NAME_LENGTH),
      domain: shared.domain.toLowerCase(),
      boostData: shared.boostData,
      ...(shared.author ? { author: shared.author.slice(0, MAX_NAME_LENGTH) } : {}),
      ...(shared.icon ? { icon: shared.icon } : {}),
      ...(shared.preview ? { preview: shared.preview } : {}),
      ...(cleanSignature ? { signature: cleanSignature } : {}),
    },
  };
}

async function readBody(req: IncomingMessage): Promise<string | null> {
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return send(res, 503, { error: "Boost sharing is not set up on this server" });
  }
  const url = new URL(req.url ?? "/", "http://localhost");

  if (req.method == "GET") {
    const id = (url.searchParams.get("id") ?? "").toUpperCase();
    if (!ID_RE.test(id)) {
      return send(res, 404, { error: "not found" });
    }
    try {
      const blob = await head(`boosts/${id}.json`);
      const stored = await (await fetch(blob.url)).json();
      return send(res, 200, stored);
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
    const id = newId();
    const name = url.searchParams.get("name")?.slice(0, MAX_NAME_LENGTH) || null;
    const stored = { id, name, createdAt: new Date().toISOString(), data: doc };
    await put(`boosts/${id}.json`, JSON.stringify(stored), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return send(res, 201, { id, webUrl: `/boost/${id}` });
  }

  res.setHeader("Allow", "GET, POST");
  return send(res, 405, { error: "method not allowed" });
}
