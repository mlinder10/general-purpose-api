import { sql } from "drizzle-orm";
import { customType, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const float32Array = customType<{
  data: number[];
  config: { dimensions: number };
  configRequired: true;
  driverData: Buffer;
}>({
  dataType(config) {
    return `F32_BLOB(${config.dimensions})`;
  },
  fromDriver(value: Buffer) {
    return Array.from(new Float32Array(value.buffer));
  },
  toDriver(value: number[]) {
    return sql`vector32(${JSON.stringify(value)})`;
  },
});

function jsonType<T>() {
  return customType<{
    data: T;
    configRequired: false;
    driverData: Buffer;
  }>({
    dataType() {
      return `TEXT`;
    },
    fromDriver(value: Buffer) {
      return JSON.parse(value.toString("utf-8"));
    },
    toDriver(value: T) {
      return sql`${JSON.stringify(value)}`;
    },
  });
}

function json<T>(name: string) {
  return jsonType<T>()(name);
}

export const VECTOR_DIMENSIONALITY = 64;

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
    dimensions: VECTOR_DIMENSIONALITY,
  }).notNull(),
});

export const vectorSimilarity = (vector: number[]) =>
  sql.raw(`vector_distance_cos(vector, vector32('[${vector.join(", ")}]'))`);
