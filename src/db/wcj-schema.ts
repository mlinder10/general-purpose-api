import { SQL_UUID } from "@/utils/constants";
import { text, sqliteTable, int } from "drizzle-orm/sqlite-core";
import { float32Array } from "./extensions";

export const wcjUsers = sqliteTable("wcj_users", {
  id: text("id").primaryKey().default(SQL_UUID),
  email: text("email").notNull(),
  password: text("password").notNull(),
  username: text("name").notNull(),
  createdAt: int("created_at").notNull(),
});

export const wcjPosts = sqliteTable("wcj_posts", {
  id: text("id").primaryKey().default(SQL_UUID),
  word: text("title").notNull(),
  definition: text("content").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  example: text("example"),
  userId: text("user_id")
    .references(() => wcjUsers.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: int("created_at").notNull(),
});

export const WCJ_POST_VECTOR_DIMENSIONALITY = 64;

export const wcjPostEmbedding = sqliteTable("wcj_post_embedding", {
  postId: text("post_id")
    .primaryKey()
    .references(() => wcjPosts.id, { onDelete: "cascade" })
    .notNull(),
  embedding: float32Array("embedding", {
    dimensions: WCJ_POST_VECTOR_DIMENSIONALITY,
  }).notNull(),
});
