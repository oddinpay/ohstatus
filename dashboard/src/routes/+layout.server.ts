// src/routes/+layout.server.ts
import { createConvexAuthHandlers } from "@mmailaender/convex-auth-svelte/sveltekit/server";
import type { LayoutServerLoad } from "./$types";

const { getAuthState } = createConvexAuthHandlers();

export const load: LayoutServerLoad = async (event) => {
  return { authState: await getAuthState(event) };
};
