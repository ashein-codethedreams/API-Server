import { index, integer, pgTable, serial, text } from "drizzle-orm/pg-core"
import { UserTable } from "./users.ts"

export const TodoTable = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").references(() => UserTable.id, { onDelete: "cascade" }),
}, (table) => [
  index("todos_user_id_idx").on(table.userId),
])