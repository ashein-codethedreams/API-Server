import { zValidator } from "@hono/zod-validator"
import type { z } from "zod"

type ValidationTarget = "json" | "query"

function validate<T extends z.ZodType>(target: ValidationTarget, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (result.success) return

    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }))
    return c.json({
      error: target === "query" ? "Invalid query parameters" : "Invalid request body",
      details,
    }, 400)
  })
}

export const validateJson = <T extends z.ZodType>(schema: T) => validate("json", schema)
export const validateQuery = <T extends z.ZodType>(schema: T) => validate("query", schema)
