import { db } from "$lib/server/db";
import { eq, inArray } from "drizzle-orm";
import { subscribers } from "$lib/schema";

export async function removeSubscriber(email: string) {
  return await db.delete(subscribers).where(eq(subscribers.email, email));
}

export async function removeSubscribersBulk(emails: string[]) {
  return await db.delete(subscribers).where(inArray(subscribers.email, emails));
}
