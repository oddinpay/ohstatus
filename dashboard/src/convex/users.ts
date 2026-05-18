import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({ ...user }));
  },
});
