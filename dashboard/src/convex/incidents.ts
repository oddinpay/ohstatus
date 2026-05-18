import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";
import { getAuthUserId } from "@convex-dev/auth/server";

export const incidentAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: "incidents";
}>(components.incidentCount, {
  sortKey: (doc) => doc.status,
});

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.query("incidents").collect();
  },
});

export const post = mutation({
  args: {
    parentId: v.string(),
    title: v.optional(v.string()),
    service: v.string(),
    status: v.string(),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const id = await ctx.db.insert("incidents", {
      parentId: args.parentId,
      title: args.title ?? "",
      status: args.status,
      service: args.service,
      note: args.note,
    });

    const doc = await ctx.db.get(id);
    if (doc) {
      await incidentAggregate.insert(ctx, doc);
    }
    return id;
  },
});

export const count = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    return await incidentAggregate.count(ctx);
  },
});

export const getStatusCounts = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const all = await ctx.db.query("incidents").collect();
    const groups = new Map<string, string[]>();

    all.forEach((s) => {
      const existing = groups.get(s.parentId) || [];
      groups.set(s.parentId, [...existing, s.status]);
    });

    const identifiedCount = Array.from(groups.values()).filter(
      (statuses) =>
        statuses.includes("Identified") &&
        statuses.every((s) => s === "Identified" || s === "Investigating"),
    ).length;

    const incidentCount = Array.from(groups.values()).filter(
      (statuses) =>
        statuses.includes("Investigating") &&
        statuses.every(
          (s) =>
            s === "Identified" || s === "Investigating" || s === "Inprogress",
        ),
    ).length;

    return {
      incidents: incidentCount,
      identified: identifiedCount,
      total: all.length,
    };
  },
});

export const update = mutation({
  args: {
    parentId: v.string(),
    service: v.string(),
    status: v.string(),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const id = await ctx.db.insert("incidents", {
      title: "",
      parentId: args.parentId,
      status: args.status,
      service: args.service,
      note: args.note,
    });

    const doc = await ctx.db.get(id);
    if (doc) {
      await incidentAggregate.insert(ctx, doc);
    }
    return id;
  },
});

export const deleteById = mutation({
  args: { id: v.id("incidents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const doc = await ctx.db.get(args.id);
    if (doc) {
      await incidentAggregate.delete(ctx, doc);
      await ctx.db.delete(args.id);
    }
  },
});

export const deleteBulk = mutation({
  args: { id: v.array(v.id("incidents")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }
    for (const id of args.id) {
      const doc = await ctx.db.get(id);
      if (doc) {
        await incidentAggregate.delete(ctx, doc);
        await ctx.db.delete(id);
      }
    }
  },
});

export const backfill = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    await incidentAggregate.clear(ctx);
    const existing = await ctx.db.query("incidents").collect();
    for (const doc of existing) {
      try {
        await incidentAggregate.insert(ctx, doc);
      } catch (e) {
        return `Error backfilling incident ${doc._id}: ${e}`;
      }
    }
    return `Synced ${existing.length} incidents.`;
  },
});

export const cleanup = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const oldItems = await ctx.db
      .query("incidents")
      .filter((q) => q.lt(q.field("_creationTime"), ninetyDaysAgo))
      .collect();

    for (const item of oldItems) {
      await ctx.db.delete(item._id);
    }
  },
});
