import { Hono } from 'hono'
import todoRoutes from './routes/todo.ts'
import swaggerRoutes from './middleware/Swagger.ts'
import { swaggerUI } from '@hono/swagger-ui'
import { Scalar } from '@scalar/hono-api-reference'
import { HomePage } from './ui/Home.ts'
import { NotFoundPage } from './ui/NotFound.ts'

export const app = new Hono()

app.route('/todos', todoRoutes)
app.route('/', swaggerRoutes)

app.get('/', (c) => c.html(HomePage()))
app.get('/ui', swaggerUI({ url: '/doc' }))
app.get('/scalar', Scalar({ url: '/doc' }))
app.get('/404', (c) => c.html(NotFoundPage({ path: '/404', method: 'GET' }), 404))

app.notFound((c) => {
  const accept = c.req.header('accept') ?? ''
  if (accept.includes('text/html')) {
    return c.html(NotFoundPage({ path: c.req.path, method: c.req.method }), 404)
  }

  return c.json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${c.req.method} ${c.req.path}`,
  }, 404)
})

export default app
