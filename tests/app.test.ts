import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { after, test } from "node:test"
import { Hono } from "hono"
import { requestId } from "hono/request-id"
import { eq } from "drizzle-orm"
import { app } from "../src/app.ts"
import { db } from "../src/db/db.ts"
import { UserTable } from "../src/db/schema/users.ts"
import type { AppEnv } from "../src/middleware/auth.ts"
import { handleAppError } from "../src/middleware/error-handler.ts"

after(async () => {
  await db.$client.end()
})

test("OpenAPI documents the paginated todo response and bearer authentication", async () => {
  const response = await app.request("/doc")
  const document = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(document.paths["/todos"].get.responses["200"].content["application/json"].schema, {
    $ref: "#/components/schemas/TodoPage",
  })
  assert.deepEqual(document.components.schemas.TodoPage.required, ["data", "pagination"])
  assert.equal(document.components.securitySchemes.BearerAuth.scheme, "bearer")
})

test("health responses include security headers and allow configured frontend origins", async () => {
  const response = await app.request("/health", {
    headers: { origin: "http://localhost:5173" },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173")
  assert.equal(response.headers.get("vary"), "Origin")

  const preflight = await app.request("/auth/login", {
    method: "OPTIONS",
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "POST",
      "access-control-request-headers": "authorization,content-type",
    },
  })
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get("access-control-allow-origin"), "http://localhost:5173")
  assert.match(preflight.headers.get("access-control-allow-headers") ?? "", /Authorization/i)

  const deniedOrigin = await app.request("/health", {
    headers: { origin: "https://untrusted.example" },
  })
  assert.equal(deniedOrigin.headers.get("access-control-allow-origin"), null)
})

test("unexpected failures return sanitized JSON tied to the request ID", async () => {
  const testApp = new Hono<AppEnv>()
  testApp.use(requestId())
  testApp.onError(handleAppError)
  testApp.get("/failure", () => {
    throw new Error("sensitive database details")
  })

  const response = await testApp.request("/failure")
  const requestIdHeader = response.headers.get("x-request-id")

  assert.equal(response.status, 500)
  assert.ok(requestIdHeader)
  assert.deepEqual(await response.json(), {
    error: "Internal Server Error",
    requestId: requestIdHeader,
  })
})

test("accounts receive private, paginated todo access after signing in", async () => {
  const uniqueId = randomUUID()
  const email = `auth-test-${uniqueId}@example.invalid`
  const otherEmail = `auth-test-other-${uniqueId}@example.invalid`
  const password = "test-only-password-123"

  try {
    const unauthenticated = await app.request("/todos")
    assert.equal(unauthenticated.status, 401)

    const registration = await app.request("/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    assert.equal(registration.status, 201)
    const registered = await registration.json()
    assert.equal(typeof registered.accessToken, "string")
    assert.equal(registered.user.email, email)
    assert.equal("passwordHash" in registered.user, false)

    const invalidRegistration = await app.request("/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "invalid", password: "short" }),
    })
    assert.equal(invalidRegistration.status, 400)
    assert.equal((await invalidRegistration.json()).error, "Invalid request body")

    const duplicate = await app.request("/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    assert.equal(duplicate.status, 409)

    const invalidSignIn = await app.request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "wrong-password-123" }),
    })
    assert.equal(invalidSignIn.status, 401)

    const signIn = await app.request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    assert.equal(signIn.status, 200)
    const { accessToken } = await signIn.json()

    let firstTodoId: number | undefined
    for (const title of ["first", "second", "third"]) {
      const created = await app.request("/todos", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title }),
      })
      assert.equal(created.status, 201)
      if (!firstTodoId) firstTodoId = (await created.json()).id
    }

    const otherRegistration = await app.request("/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: otherEmail, password }),
    })
    assert.equal(otherRegistration.status, 201)
    const otherToken = (await otherRegistration.json()).accessToken
    const privateTodo = await app.request(`/todos/${firstTodoId}`, {
      headers: { authorization: `Bearer ${otherToken}` },
    })
    assert.equal(privateTodo.status, 404)

    const firstPage = await app.request("/todos?page=1&limit=2", {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    assert.equal(firstPage.status, 200)
    const page = await firstPage.json()
    assert.equal(page.data.length, 2)
    assert.deepEqual(page.pagination, {
      page: 1,
      limit: 2,
      totalItems: 3,
      totalPages: 2,
    })

    const invalidPage = await app.request("/todos?page=0&limit=101", {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    assert.equal(invalidPage.status, 400)
    assert.equal((await invalidPage.json()).error, "Invalid query parameters")
  } finally {
    await db.delete(UserTable).where(eq(UserTable.email, email))
    await db.delete(UserTable).where(eq(UserTable.email, otherEmail))
  }
})
