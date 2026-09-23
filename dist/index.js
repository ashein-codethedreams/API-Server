import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import todoRoutes from './routes/todo.js';
const app = new Hono();
app.route("/todos", todoRoutes);
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
