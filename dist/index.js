import { serve } from '@hono/node-server';
import { app } from './app.js';
const runtimeEnv = globalThis.process?.env ?? {};
serve({
    fetch: app.fetch,
    port: Number(runtimeEnv.PORT) || 3000,
    hostname: runtimeEnv.HOST || '0.0.0.0'
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
