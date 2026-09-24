import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import todoRoutes from './routes/todo.ts'
import swaggerRoutes from './middleware/Swagger.ts'
import { swaggerUI } from '@hono/swagger-ui'
import { Scalar } from '@scalar/hono-api-reference'
import { HomePage } from './ui/Home.tsx'

const app = new Hono()
const runtimeEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process?.env ?? {}

app.route("/todos",todoRoutes)
app.route('/', swaggerRoutes)

app.get('/', (c) => c.html(HomePage()))

// Use the middleware to serve Swagger UI at /ui
app.get('/ui', swaggerUI({ url: '/doc' }))
app.get('/scalar', Scalar({ url: '/doc' }))

serve({
  fetch: app.fetch,
  port: Number(runtimeEnv.PORT) || 3000,
  hostname: runtimeEnv.HOST || '0.0.0.0'
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
