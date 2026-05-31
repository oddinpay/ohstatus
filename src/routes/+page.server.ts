import { zod4 } from "sveltekit-superforms/adapters";
import { subscriberCreate } from "$lib/types/form";
import { fail, type Actions } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "./[...catchall]/$types";
import { subscribers } from "$lib/schema";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
  const form = await superValidate(event, zod4(subscriberCreate));
  return {
    form,
  };
};

export const actions: Actions = {
  create: async (e) => {
    const form = await superValidate(e, zod4(subscriberCreate));
    if (!form.valid) return fail(400, { form });

    const db = drizzle(e.platform!.env.ohstatus);
    const { email } = form.data;

    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .get();

    if (existing) {
      return setError(form, "", "This email is already subscribed.");
    }

    try {
      await db
        .insert(subscribers)
        .values({
          email: email,
        })
        .onConflictDoNothing();
    } catch (error) {
      return setError(form, "", "Failed to subscribe. Please try again later.");
    }

    return { form };
  },
};
