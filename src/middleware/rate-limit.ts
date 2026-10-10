import { getConnInfo } from "@hono/node-server/conninfo"
import type { Context, Env, MiddlewareHandler } from "hono"

type RateLimitOptions<E extends Env> = {
  limit: number
  windowMs: number
  key?: (c: Context<E>) => string
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

export function createRateLimiter<E extends Env = Env>(
  options: RateLimitOptions<E>,
): MiddlewareHandler<E> {
  if (!Number.isInteger(options.limit) || options.limit < 1 || options.windowMs < 1) {
    throw new Error("Rate limit must have a positive integer limit and window")
  }

  const entries = new Map<string, RateLimitEntry>()
  const keyForRequest = options.key ?? ((c: Context<E>) => {
    if (!c.env || typeof c.env !== "object") return "unknown"
    const bindings = "server" in c.env && c.env.server ? c.env.server : c.env
    if (typeof bindings !== "object" || bindings === null || !("incoming" in bindings)) return "unknown"
    return getConnInfo(c).remote.address ?? "unknown"
  })

  return async (c, next) => {
    const now = Date.now()
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key)
    }

    const clientKey = keyForRequest(c)
    let entry = entries.get(clientKey)
    if (!entry) {
      if (entries.size >= 10_000) {
        const oldestKey = entries.keys().next().value
        if (oldestKey !== undefined) entries.delete(oldestKey)
      }
      entry = { count: 0, resetAt: now + options.windowMs }
      entries.set(clientKey, entry)
    }

    if (entry.count >= options.limit) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
      c.header("Retry-After", String(retryAfter))
      return c.json({ error: "Too many requests" }, 429)
    }

    entry.count += 1
    await next()
  }
}
