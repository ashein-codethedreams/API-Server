import assert from "node:assert/strict"
import { test } from "node:test"
import { Hono } from "hono"
import { createRateLimiter } from "../../src/middleware/rate-limit.ts"

test("rate limiter rejects requests over the configured limit per client", async () => {
  const app = new Hono()
  app.use("*", createRateLimiter({
    limit: 2,
    windowMs: 60_000,
    key: (c) => c.req.header("x-test-client") ?? "anonymous",
  }))
  app.get("/", (c) => c.json({ ok: true }))

  const first = await app.request("/", { headers: { "x-test-client": "one" } })
  const second = await app.request("/", { headers: { "x-test-client": "one" } })
  const limited = await app.request("/", { headers: { "x-test-client": "one" } })
  const otherClient = await app.request("/", { headers: { "x-test-client": "two" } })

  assert.equal(first.status, 200)
  assert.equal(second.status, 200)
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get("retry-after"), "60")
  assert.deepEqual(await limited.json(), { error: "Too many requests" })
  assert.equal(otherClient.status, 200)
})
