import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import todoRoutes from './routes/todo.js';
const app = new Hono();
const runtimeEnv = globalThis.process?.env ?? {};
app.route("/todos", todoRoutes);
serve({
    fetch: app.fetch,
    port: Number(runtimeEnv.PORT) || 3000,
    hostname: runtimeEnv.HOST || '0.0.0.0'
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
