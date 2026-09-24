import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import todoRoutes from './routes/todo.js';
import swaggerRoutes from './middleware/Swagger.js';
import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';
import { HomePage } from './ui/Home.js';
const app = new Hono();
const runtimeEnv = globalThis.process?.env ?? {};
app.route("/todos", todoRoutes);
app.route('/', swaggerRoutes);
app.get('/', (c) => c.html(HomePage()));
// Use the middleware to serve Swagger UI at /ui
app.get('/ui', swaggerUI({ url: '/doc' }));
app.get('/scalar', Scalar({ url: '/doc' }));
serve({
    fetch: app.fetch,
    port: Number(runtimeEnv.PORT) || 3000,
    hostname: runtimeEnv.HOST || '0.0.0.0'
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
