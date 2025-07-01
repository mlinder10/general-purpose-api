import { SQL_UUID } from "@/utils/constants";
import { text, sqliteTable, numeric } from "drizzle-orm/sqlite-core";

export const wcjUserTable = sqliteTable("wcj_user", {
  id: text("id").primaryKey().default(SQL_UUID),
  email: text("email").notNull(),
  password: text("password").notNull(),
  username: text("name").notNull(),
  createdAt: numeric("created_at").notNull(),
});

export const wcjPostTable = sqliteTable("wcj_post", {
  id: text("id").primaryKey().default(SQL_UUID),
  word: text("title").notNull(),
  definition: text("content").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: numeric("created_at").notNull(),
});
