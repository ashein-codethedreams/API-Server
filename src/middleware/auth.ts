import { sign, verify } from "hono/jwt"
import type { MiddlewareHandler } from "hono"
import { env } from "../data/env.ts"

const issuer = "my-api-server"
const accessTokenLifetimeSeconds = 60 * 60

export type AuthUser = {
  id: number
  email: string
}

export type AppEnv = {
  Variables: {
    user: AuthUser
  }
}

export async function createAccessToken(user: AuthUser): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000)
  return sign({
    sub: String(user.id),
    email: user.email,
    iss: issuer,
    iat: issuedAt,
    exp: issuedAt + accessTokenLifetimeSeconds,
  }, env.JWT_SECRET, "HS256")
}

async function getTokenUser(token: string): Promise<AuthUser | null> {
  try {
    const payload = await verify(token, env.JWT_SECRET, "HS256")
    const id = Number(payload.sub)
    if (payload.iss !== issuer || !Number.isSafeInteger(id) || id < 1 || typeof payload.email !== "string") {
      return null
    }
    return { id, email: payload.email }
  } catch {
    return null
  }
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authorization = c.req.header("authorization")
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)
  if (!match) {
    return c.json({ error: "Authentication required" }, 401)
  }

  const user = await getTokenUser(match[1])
  if (!user) {
    return c.json({ error: "Invalid or expired access token" }, 401)
  }

  c.set("user", user)
  await next()
}
