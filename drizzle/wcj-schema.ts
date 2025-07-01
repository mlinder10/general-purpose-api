import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const wcjUserTable = sqliteTable("wcj_user", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  email: text("email").notNull(),
  password: text("password").notNull(),
  username: text("name").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const wcjPostTable = sqliteTable("wcj_post", {
  id: text("id").primaryKey().default(crypto.randomUUID()),
  word: text("title").notNull(),
  definition: text("content").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});
