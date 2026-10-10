import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DB_PASSWORD: z.string().min(1),
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)),
  DB_NAME: z.string(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().optional(),
  CORS_ORIGINS: z.string().optional().transform((origins) =>
    origins?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ]),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.message);
  process.exit(1);
}

export const env = parsedEnv.data;