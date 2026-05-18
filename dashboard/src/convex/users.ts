import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db.get(userId);

    if (currentUser === null) {
      throw new Error("User record not found");
    }

    return {
      id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      image: currentUser.image,
    };
  },
});
