import { serve } from '@hono/node-server'
import { app } from './app.ts'
import { env } from './data/env.ts'

const runtimeEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process?.env ?? {}

if (!runtimeEnv.VERCEL) {
  serve({
    fetch: app.fetch,
    port: env.PORT ? parseInt(env.PORT, 10) : 3000,
    hostname: runtimeEnv.HOST || '0.0.0.0'
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

export default app
