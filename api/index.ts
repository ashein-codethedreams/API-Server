import { app } from '../src/app.ts'
import { handle } from 'hono/vercel'

export default handle(app)

