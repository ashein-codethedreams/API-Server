import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
const app = new Hono()

const todos = [
  { id: 1 ,title: "Learn Hono"},
  { id: 2 ,title: "Build a REST API"}
]

const createTodoSchema = z.object({
  title: z.string(),
})

const updateTodoSchema = z.object({
  title: z.string().optional(),
})

app.get('/', (c) => {
  return c.json(todos)
})

app.get('/:id', (c) => { 
  const id = c.req.param('id')
  const todo = todos.find(t => t.id===parseInt(id))
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json(todo)
})

app.post('/', zValidator("json", createTodoSchema), (c) => {
  const { title } = c.req.valid("json")
  const id = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1
  const newTodo = { id, title }
  todos.push(newTodo)
  return c.json(newTodo, 201)
})

app.put('/:id', zValidator("json", updateTodoSchema), (c) => {
  const id = c.req.param('id')
  const todo = todos.find(t => t.id===parseInt(id))
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  todo.title = c.req.valid("json").title ?? todo.title
  return c.json(todo)
})

app.delete('/:id', (c) => {
  const id = c.req.param('id')
  const index = todos.findIndex(t => t.id===parseInt(id))
  if (index === -1) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  todos.splice(index, 1)
  return c.json({ message: 'Todo deleted' }, 200)
})

export default app