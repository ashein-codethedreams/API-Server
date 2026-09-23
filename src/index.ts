import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import todoRoutes from './routes/todo.ts'

const app = new Hono()
const runtimeEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process?.env ?? {}

app.route("/todos",todoRoutes)

serve({
  fetch: app.fetch,
  port: Number(runtimeEnv.PORT) || 3000,
  hostname: runtimeEnv.HOST || '0.0.0.0'
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
