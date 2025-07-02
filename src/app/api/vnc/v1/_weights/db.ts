import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: "file:src/app/api/vnc/v1/_weights/weights.db",
});

export const db = drizzle(turso);
