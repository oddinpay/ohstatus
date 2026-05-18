import { createConvexAuthHooks } from "@mmailaender/convex-auth-svelte/sveltekit/server";
import type { RequestHandler } from "./$types";

const { handleAuth } = createConvexAuthHooks();

export const POST: RequestHandler = async (event) => {
  return handleAuth({ event, resolve: () => new Response() });
};

export const GET: RequestHandler = async (event) => {
  return handleAuth({ event, resolve: () => new Response() });
};
