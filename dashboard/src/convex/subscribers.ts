import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { TableAggregate } from "@convex-dev/aggregate";

export const subscriberAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: "subscribers";
}>(components.subscriberCount, {
  sortKey: (doc) => doc.email,
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    return await subscriberAggregate.count(ctx);
  },
});

export const get = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    if (args.apiKey !== process.env.API_KEY) throw new Error("Unauthorized");
    return await ctx.db.query("status").collect();
  },
});

// Sync
export const backfill = mutation({
  handler: async (ctx) => {
    await subscriberAggregate.clear(ctx);
    const existing = await ctx.db.query("subscribers").collect();
    for (const sub of existing) {
      try {
        await subscriberAggregate.insert(ctx, sub);
      } catch (e) {
        return `Error backfilling subscriber ${sub._id}: ${e}`;
      }
    }
    return `Synced ${existing.length} subscribers.`;
  },
});
