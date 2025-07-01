import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const pcUser = sqliteTable("pc_user", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  email: text("email").notNull(),
  password: text("password").notNull(),
  username: text("name").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});
