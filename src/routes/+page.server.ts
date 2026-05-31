import { zod4 } from "sveltekit-superforms/adapters";
import { subscriberCreate } from "$lib/types/form";
import { fail, type Actions } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "./[...catchall]/$types";

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

    try {
    } catch (error) {
      return setError(form, "", "Failed to create subscriber");
    }

    return { form };
  },
};
