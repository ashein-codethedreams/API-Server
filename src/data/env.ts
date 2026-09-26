import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DB_PASSWORD: z.string().min(1),
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)),
  DB_NAME: z.string(),
  PORT: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.message);
  process.exit(1);
}

export const env = parsedEnv.data;