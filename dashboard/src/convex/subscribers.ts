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

export const addSubscriber = mutation({
  args: {
    apiKey: v.string(),
    email: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.apiKey !== process.env.API_KEY) {
      throw new Error("Unauthorized");
    }

    const subscriberId = await ctx.db.insert("subscribers", {
      email: args.email,
      status: args.status,
    });

    if (args.status === "subscribed") {
      const subscriber = await ctx.db.get(subscriberId);
      if (subscriber) {
        await subscriberAggregate.insert(ctx, subscriber);
      }
    }
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    return await subscriberAggregate.count(ctx);
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
