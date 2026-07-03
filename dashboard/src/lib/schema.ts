import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const subscribers = sqliteTable("subscribers", {
  email: text("email").primaryKey(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
