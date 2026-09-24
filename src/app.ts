import { Hono } from 'hono'
import todoRoutes from './routes/todo.ts'
import swaggerRoutes from './middleware/Swagger.ts'
import { swaggerUI } from '@hono/swagger-ui'
import { Scalar } from '@scalar/hono-api-reference'
import { HomePage } from './ui/Home.ts'

export const app = new Hono()

app.route('/todos', todoRoutes)
app.route('/', swaggerRoutes)

app.get('/', (c) => c.html(HomePage()))
app.get('/ui', swaggerUI({ url: '/doc' }))
app.get('/scalar', Scalar({ url: '/doc' }))

export default app
