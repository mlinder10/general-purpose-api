import { sql } from "drizzle-orm";

export const SQL_UUID = sql`lower(hex(randomblob(16)))`;
