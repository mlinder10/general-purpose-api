import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { json, float32Array } from "@/db";

export const VNC_EXERCISE_VECTOR_DIMENSIONALITY = 64;

export const vncExercises = sqliteTable("vnc_exercises", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  directions: json<string[]>("directions").notNull(),
  cues: json<string[]>("cues").notNull(),
  image: text("image").notNull(),
  videoId: text("video_id").notNull(),
  bodyPart: text("body_part").notNull(),
  primaryGroup: text("primary_group").notNull(),
  secondaryGroups: json<string[]>("secondary_groups").notNull(),
  exerciseType: text("exercise_type").notNull(),
  equipmentType: text("equipment_type").notNull(),
  repsLow: int("reps_low").notNull(),
  repsHigh: int("reps_high").notNull(),
  vector: float32Array("vector", {
    dimensions: VNC_EXERCISE_VECTOR_DIMENSIONALITY,
  }).notNull(),
});

export const vectorSimilarity = (vector: number[], columnName = "vector") =>
  sql.raw(
    `vector_distance_cos(${columnName}, vector32('[${vector.join(", ")}]'))`
  );
