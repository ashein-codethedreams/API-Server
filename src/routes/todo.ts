import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => {
  return c.text('Todo endpoint')
})

export default app