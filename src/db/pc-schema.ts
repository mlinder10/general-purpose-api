import { SQL_UUID } from "@/utils/constants";
import { text, numeric, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const pcUsers = sqliteTable("pc_users", {
  id: text("id").primaryKey().default(SQL_UUID),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  username: text("name").notNull(),
  createdAt: int("created_at").notNull(),
});

export const pcMeals = sqliteTable("pc_meals", {
  id: text("id").primaryKey().default(SQL_UUID),
  userId: text("user_id")
    .references(() => pcUsers.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: int("created_at").notNull(),

  name: text("name").notNull(),
  calories: int("calories").notNull(),
  protein: numeric("protein").notNull(),
  carbs: numeric("carbs").notNull(),
  fats: numeric("fats").notNull(),
});

export const pcStats = sqliteTable("pc_stats", {
  id: text("id").primaryKey().default(SQL_UUID),
  userId: text("user_id")
    .references(() => pcUsers.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: int("created_at").notNull(),

  weight: numeric("weight").notNull(), // lbs
  height: numeric("height").notNull(), // inches
  age: int("age").notNull(),
  gender: text("gender").notNull(),
  activityLevel: text("activity_level").notNull(), // sedentary, lightly active, moderately active, very active
  bodyFat: numeric("body_fat").notNull(), // percentage
  computedCalories: int("computed_calories").notNull(),
});
