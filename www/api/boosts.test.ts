import assert from "node:assert/strict";
import { test } from "node:test";
import { PassThrough } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHandler, MAX_BYTES, type BoostStore } from "./boosts.ts";

function memoryStore() {
  const blobs = new Map<string, string>();
  const store: BoostStore & { blobs: Map<string, string>; writes: number } = {
    blobs,
    writes: 0,
    async exists(path) {
      return blobs.has(path);
    },
    async read(path) {
      if (!blobs.has(path)) {
        throw new Error("missing");
      }
      return JSON.parse(blobs.get(path)!);
    },
    async write(path, body) {
      store.writes++;
      blobs.set(path, body);
    },
  };
  return store;
}

async function call(
  store: BoostStore,
  method: string,
  url: string,
  body?: string
): Promise<{ status: number; json: any }> {
  const req = new PassThrough() as unknown as IncomingMessage & PassThrough;
  req.method = method;
  req.url = url;
  req.headers = body === undefined ? {} : { "content-length": String(Buffer.byteLength(body)) };
  req.end(body ?? "");
  let status = 0;
  let out = "";
  const res = {
    set statusCode(value: number) {
      status = value;
    },
    setHeader() {},
    end(text: string) {
      out = text;
    },
  } as unknown as ServerResponse;
  await createHandler(store)(req, res);
  return { status, json: JSON.parse(out) };
}

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function share(overrides: Record<string, unknown> = {}, boostData: Record<string, unknown> = {}) {
  return {
    version: "1",
    shared: {
      type: "boost",
      name: "Dark wiki",
      domain: "en.wikipedia.org",
      author: "Ege",
      icon: PNG,
      preview: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      signature: { viewBox: "0 0 300 80", paths: ["M10 20 L30.5 40 C1 2 3 4 5 6"] },
      boostData: {
        boostName: "Dark wiki",
        dotAngleDeg: 131.61,
        dotPos: { x: 0.76, y: 0.66 },
        enableColorBoost: true,
        fontFamily: "Inter, sans-serif",
        textCaseOverride: "none",
        zapSelectors: ["div.ad"],
        focusSelectors: [],
        customCSS: "body { color: red }",
        changeWasMade: true,
        ...boostData,
      },
      ...overrides,
    },
  };
}

test("a real share is stored and can be read back", async () => {
  const store = memoryStore();
  const created = await call(store, "POST", "/api/boosts?name=Ege", JSON.stringify(share()));
  assert.equal(created.status, 201);
  assert.match(created.json.id, /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  const read = await call(store, "GET", `/api/boosts?id=${created.json.id}`);
  assert.equal(read.status, 200);
  assert.equal(read.json.data.shared.boostData.customCSS, "body { color: red }");
  assert.deepEqual(read.json.data.shared.signature.paths, ["M10 20 L30.5 40 C1 2 3 4 5 6"]);
});

test("the same share uploaded again reuses its blob", async () => {
  const store = memoryStore();
  const first = await call(store, "POST", "/api/boosts?name=Ege", JSON.stringify(share()));
  const second = await call(store, "POST", "/api/boosts?name=Ege", JSON.stringify(share()));
  assert.equal(first.json.id, second.json.id);
  assert.equal(store.writes, 1);
  const other = await call(store, "POST", "/api/boosts?name=Ege", JSON.stringify(share({ name: "Other" })));
  assert.notEqual(other.json.id, first.json.id);
  assert.equal(store.writes, 2);
});

test("unknown fields are dropped", async () => {
  const store = memoryStore();
  const doc = share({ extra: "x".repeat(1000) }, { hosted: { anything: [1, 2, 3] } });
  const created = await call(store, "POST", "/api/boosts", JSON.stringify(doc));
  assert.equal(created.status, 201);
  const stored = JSON.parse([...store.blobs.values()][0]);
  assert.equal("extra" in stored.data.shared, false);
  assert.equal("hosted" in stored.data.shared.boostData, false);
});

test("an invalid signature is left out", async () => {
  const store = memoryStore();
  const doc = share({ signature: { viewBox: "0 0 1 1", paths: ["<script>"] } });
  const created = await call(store, "POST", "/api/boosts", JSON.stringify(doc));
  assert.equal(created.status, 201);
  const stored = JSON.parse([...store.blobs.values()][0]);
  assert.equal("signature" in stored.data.shared, false);
});

const rejected: Array<[string, unknown]> = [
  ["not JSON", "{"],
  ["wrong type", share({ type: "workspace" })],
  ["bad domain", share({ domain: "not a domain" })],
  ["non-image icon", share({ icon: "data:text/html;base64,PHNjcmlwdD4=" })],
  ["svg preview", share({ preview: "data:image/svg+xml;base64,PHN2Zz4=" })],
  ["oversized preview", share({ preview: "data:image/jpeg;base64," + "A".repeat(800 * 1024) })],
  ["boostData array", share({ boostData: [] })],
  ["number as string", share({}, { brightness: "0.5" })],
  ["NaN-like point", share({}, { dotPos: { x: "a", y: 1 } })],
  ["boolean as number", share({}, { nightOnly: 1 })],
  ["huge custom CSS", share({}, { customCSS: "a".repeat(101 * 1024) })],
  ["selector not a string", share({}, { zapSelectors: [{}] })],
  ["too many selectors", share({}, { zapSelectors: Array(201).fill("div") })],
];

for (const [name, doc] of rejected) {
  test(`rejects ${name}`, async () => {
    const store = memoryStore();
    const body = typeof doc == "string" ? doc : JSON.stringify(doc);
    const result = await call(store, "POST", "/api/boosts", body);
    assert.equal(result.status, 422, JSON.stringify(result.json));
    assert.equal(store.writes, 0);
  });
}

test("rejects bodies over the size limit", async () => {
  const store = memoryStore();
  const result = await call(store, "POST", "/api/boosts", "x".repeat(MAX_BYTES + 1));
  assert.equal(result.status, 413);
  assert.equal(store.writes, 0);
});

test("unknown ids are not found", async () => {
  const store = memoryStore();
  assert.equal((await call(store, "GET", "/api/boosts?id=AAAA-AAAA-AAAA-AAAA")).status, 404);
  assert.equal((await call(store, "GET", "/api/boosts?id=../x")).status, 404);
});
