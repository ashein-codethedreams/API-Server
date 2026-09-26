import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/db.ts'
import { TodoTable } from '../db/schema/todos.ts'
const app = new Hono()


const createTodoSchema = z.object({
  title: z.string(),
})

const updateTodoSchema = z.object({
  title: z.string().optional(),
})

app.get('/', async (c) => {
  const todos = await db.select().from(TodoTable)
  return c.json(todos)
})

app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid todo id' }, 400)
  }

  const [todo] = await db.select().from(TodoTable).where(eq(TodoTable.id, id)).limit(1)
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json(todo)
})

app.post('/', zValidator('json', createTodoSchema), async (c) => {
  const data = c.req.valid("json")
  const [todo] = await db.insert(TodoTable).values(data).returning()
  return c.json(todo, 201)
})

app.put('/:id', zValidator('json', updateTodoSchema), async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid todo id' }, 400)
  }

  const data = c.req.valid('json')
  if (data.title === undefined) {
    const [todo] = await db.select().from(TodoTable).where(eq(TodoTable.id, id)).limit(1)
    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    return c.json(todo)
  }

  const [todo] = await db
    .update(TodoTable)
    .set(data)
    .where(eq(TodoTable.id, id))
    .returning()
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json(todo)
})

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid todo id' }, 400)
  }

  const [deletedTodo] = await db
    .delete(TodoTable)
    .where(eq(TodoTable.id, id))
    .returning({ id: TodoTable.id })
  if (!deletedTodo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json({ message: 'Todo deleted' }, 200)
})

export default app