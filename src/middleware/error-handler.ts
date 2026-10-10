import type { ErrorHandler } from "hono"
import type { AppEnv } from "./auth.ts"

function getErrorCode(error: Error): string | undefined {
  const visited = new Set<object>()
  let current: unknown = error

  while (typeof current === "object" && current !== null && !visited.has(current)) {
    visited.add(current)
    if ("code" in current && typeof current.code === "string" && /^[A-Z0-9_]+$/.test(current.code)) {
      return current.code
    }
    current = "cause" in current ? current.cause : null
  }

  return undefined
}

export const handleAppError: ErrorHandler<AppEnv> = (error, c) => {
  const requestId = c.get("requestId")
  console.error(JSON.stringify({
    level: "error",
    event: "request_failed",
    requestId,
    method: c.req.method,
    path: c.req.path,
    errorName: error.name,
    errorCode: getErrorCode(error),
  }))

  return c.json({ error: "Internal Server Error", requestId }, 500)
}
