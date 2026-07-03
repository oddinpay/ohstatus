import { db } from "$lib/server/db";
import { eq, inArray } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const subscribers = sqliteTable("subscribers", {
  email: text("email").primaryKey(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export async function removeSubscriber(email: string) {
  return await db.delete(subscribers).where(eq(subscribers.email, email));
}

export async function removeSubscribersBulk(emails: string[]) {
  return await db.delete(subscribers).where(inArray(subscribers.email, emails));
}
