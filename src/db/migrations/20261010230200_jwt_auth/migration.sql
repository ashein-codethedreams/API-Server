CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "todos"
  ADD COLUMN "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE;

CREATE INDEX "todos_user_id_idx" ON "todos" ("user_id");
