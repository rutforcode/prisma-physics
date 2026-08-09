import { mutation, query } from "./_generated/server";
import { SEED_CONCEPTS } from "./seedData";
import { v } from "convex/values";

/**
 * Seed the concepts table, upserting by slug so content edits (e.g. TeX
 * formula upgrades) propagate to already-seeded deployments. Idempotent.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    for (const concept of SEED_CONCEPTS) {
      const doc = {
        ...concept,
        tags: [...concept.tags],
        content: concept.content.map((section) => ({ ...section })),
        takeaways: [...concept.takeaways],
      };
      const existing = await ctx.db
        .query("concepts")
        .withIndex("by_slug", (q) => q.eq("slug", concept.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, doc);
        updated += 1;
      } else {
        await ctx.db.insert("concepts", doc);
        inserted += 1;
      }
    }
    return { inserted, updated };
  },
});

/** List concepts, optionally filtered by topic, difficulty, and a search string. */
export const list = query({
  args: {
    topic: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("intro"), v.literal("intermediate"), v.literal("advanced")),
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let concepts = await ctx.db.query("concepts").collect();

    if (args.topic) {
      concepts = concepts.filter((c) => c.topic === args.topic);
    }
    if (args.difficulty) {
      concepts = concepts.filter((c) => c.difficulty === args.difficulty);
    }
    const query = (args.search ?? "").trim().toLowerCase();
    if (query) {
      concepts = concepts.filter((c) => {
        const haystack = [
          c.title,
          c.summary,
          c.keyFormula ?? "",
          ...c.tags,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return concepts.sort((a, b) => a.title.localeCompare(b.title));
  },
});

/** Fetch a single concept by slug. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("concepts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

/** Topic counts for the filter chips ("All" row is computed client-side). */
export const topics = query({
  args: {},
  handler: async (ctx) => {
    const concepts = await ctx.db.query("concepts").collect();
    const counts = new Map<string, number>();
    for (const c of concepts) {
      counts.set(c.topic, (counts.get(c.topic) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([topic, count]) => ({
      topic,
      count,
    }));
  },
});
