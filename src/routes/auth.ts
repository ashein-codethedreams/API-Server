import { scrypt, randomBytes, timingSafeEqual } from "node:crypto"
import { Hono } from "hono"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "../db/db.ts"
import { UserTable } from "../db/schema/users.ts"
import { createAccessToken } from "../middleware/auth.ts"
import { createRateLimiter } from "../middleware/rate-limit.ts"
import { validateJson } from "../middleware/validation.ts"

const app = new Hono()
const passwordBytes = 64
app.use("*", createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 }))

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
})

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, passwordBytes, (error, key) => {
      if (error) {
        reject(error)
        return
      }
      resolve(key)
    })
  })
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await derivePassword(password, salt)
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":")
  if (!saltHex || !hashHex || !/^[a-f0-9]{32}$/.test(saltHex) || !/^[a-f0-9]{128}$/.test(hashHex)) {
    return false
  }
  const expectedHash = Buffer.from(hashHex, "hex")
  const actualHash = await derivePassword(password, Buffer.from(saltHex, "hex"))
  return timingSafeEqual(actualHash, expectedHash)
}

function isUniqueViolation(error: unknown): boolean {
  const visited = new Set<object>()
  let current = error
  while (typeof current === "object" && current !== null && !visited.has(current)) {
    visited.add(current)
    if ("code" in current && current.code === "23505") return true
    current = "cause" in current ? current.cause : null
  }
  return false
}

app.post("/register", validateJson(credentialsSchema), async (c) => {
  const { email, password } = c.req.valid("json")
  let user: { id: number; email: string } | undefined

  try {
    const [createdUser] = await db.insert(UserTable)
      .values({ email, passwordHash: await hashPassword(password) })
      .returning({ id: UserTable.id, email: UserTable.email })
    user = createdUser
  } catch (error) {
    if (isUniqueViolation(error)) {
      return c.json({ error: "An account with this email already exists" }, 409)
    }
    throw error
  }

  if (!user) {
    throw new Error("User creation did not return a record")
  }
  const accessToken = await createAccessToken(user)
  return c.json({ accessToken, tokenType: "Bearer", expiresIn: 3600, user }, 201)
})

app.post("/login", validateJson(credentialsSchema), async (c) => {
  const { email, password } = c.req.valid("json")
  const [user] = await db.select().from(UserTable).where(eq(UserTable.email, email)).limit(1)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: "Invalid email or password" }, 401)
  }

  const accessToken = await createAccessToken({ id: user.id, email: user.email })
  return c.json({
    accessToken,
    tokenType: "Bearer",
    expiresIn: 3600,
    user: { id: user.id, email: user.email },
  })
})

export default app
