import assert from "node:assert/strict";
import { test } from "node:test";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler, { isAdminRequest } from "./telemetry.ts";

const request = (url: string, headers: Record<string, string> = {}) =>
  ({ method: "GET", url, headers }) as unknown as IncomingMessage;

test("the admin key is accepted only from the header", () => {
  assert.equal(isAdminRequest(request("/api/telemetry", { "x-telemetry-admin-key": "s3cret" }), "s3cret"), true);
  assert.equal(isAdminRequest(request("/api/telemetry?key=s3cret"), "s3cret"), false);
});

test("wrong, empty and differently sized keys are refused", () => {
  for (const key of ["s3cre", "s3cret!", "S3CRET", "", "x".repeat(10000)]) {
    assert.equal(isAdminRequest(request("/", { "x-telemetry-admin-key": key }), "s3cret"), false, key);
  }
});

test("no secret configured means no admin access", () => {
  assert.equal(isAdminRequest(request("/", { "x-telemetry-admin-key": "" }), undefined), false);
  assert.equal(isAdminRequest(request("/", { "x-telemetry-admin-key": "anything" }), ""), false);
});

test("a key in the query string gets only the public health answer", async () => {
  process.env.TELEMETRY_ADMIN_SECRET = "s3cret";
  let body = "";
  const res = {
    statusCode: 0,
    setHeader() {},
    end(text: string) {
      body = text;
    },
  } as unknown as ServerResponse;
  await handler(request("/api/telemetry?key=s3cret"), res);
  assert.deepEqual(JSON.parse(body), { status: "ok", service: "hilal-browser-telemetry" });
});
