import { Hono } from 'hono'
import { z } from 'zod'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../db/db.ts'
import { TodoTable } from '../db/schema/todos.ts'
import { requireAuth, type AppEnv } from '../middleware/auth.ts'
import { validateJson, validateQuery } from '../middleware/validation.ts'
const app = new Hono<AppEnv>()

app.use('*', requireAuth)


const createTodoSchema = z.object({
  title: z.string(),
})

const updateTodoSchema = z.object({
  title: z.string().optional(),
})

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

app.get('/', validateQuery(paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query')
  const userFilter = eq(TodoTable.userId, c.get('user').id)
  const [total] = await db.select({ totalItems: count() })
    .from(TodoTable)
    .where(userFilter)
  const todos = await db.select().from(TodoTable)
    .where(userFilter)
    .orderBy(desc(TodoTable.id))
    .limit(limit)
    .offset((page - 1) * limit)

  return c.json({
    data: todos,
    pagination: {
      page,
      limit,
      totalItems: total.totalItems,
      totalPages: Math.ceil(total.totalItems / limit),
    },
  })
})

app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid todo id' }, 400)
  }

  const [todo] = await db.select().from(TodoTable)
    .where(and(eq(TodoTable.id, id), eq(TodoTable.userId, c.get('user').id)))
    .limit(1)
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json(todo)
})

app.post('/', validateJson(createTodoSchema), async (c) => {
  const data = c.req.valid("json")
  const [todo] = await db.insert(TodoTable)
    .values({ ...data, userId: c.get('user').id })
    .returning()
  return c.json(todo, 201)
})

app.put('/:id', validateJson(updateTodoSchema), async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid todo id' }, 400)
  }

  const data = c.req.valid('json')
  if (data.title === undefined) {
    const [todo] = await db.select().from(TodoTable)
      .where(and(eq(TodoTable.id, id), eq(TodoTable.userId, c.get('user').id)))
      .limit(1)
    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    return c.json(todo)
  }

  const [todo] = await db
    .update(TodoTable)
    .set(data)
    .where(and(eq(TodoTable.id, id), eq(TodoTable.userId, c.get('user').id)))
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
    .where(and(eq(TodoTable.id, id), eq(TodoTable.userId, c.get('user').id)))
    .returning({ id: TodoTable.id })
  if (!deletedTodo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json({ message: 'Todo deleted' }, 200)
})

export default app