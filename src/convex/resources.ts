import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query, mutation, QueryCtx } from "./_generated/server";

/**
 * Custom resources contributed to the Physics Resources page by admins and
 * feed curators ("authors"). Kept in the database so the team can grow the
 * library without code deploys — the Resources page merges these with the
 * curated static list (`src/lib/resources.ts`).
 */

// Mirrors the category/topic/level unions in src/lib/resources.ts so the
// server rejects anything the UI can't produce. (Duplicated on purpose:
// that client module imports lucide icons and can't be bundled into Convex.)
const CATEGORIES = [
  "Simulators",
  "Interactive Tools",
  "Learning",
  "Articles",
  "Reference",
  "Calculators",
  "Visualization",
  "Programming",
  "Experimental Physics",
] as const;

const TOPICS = [
  "Mechanics",
  "Electromagnetism",
  "Optics",
  "Waves & Oscillations",
  "Thermodynamics",
  "Modern Physics",
  "Quantum Physics",
  "Nuclear Physics",
  "Electronics",
  "Mathematical Physics",
  "Astrophysics",
  "Experimental Physics",
] as const;

const LEVELS = ["intro", "intermediate", "advanced"] as const;

const BADGES = [
  "Recommended",
  "Free",
  "Open Source",
  "Interactive",
  "Beginner Friendly",
  "University Level",
  "Community",
] as const;

/** True when the signed-in user may contribute resources (admin or curator). */
async function canContribute(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin" || user?.canPostFeed === true;
}

/** List every user-added resource, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("customResources").collect();
    docs.sort((a, b) => b._creationTime - a._creationTime);
    return docs.map((r) => ({
      ...r,
      addedByName: r.addedByName ?? null,
    }));
  },
});

/** Whether the current user may add resources (drives the UI button). */
export const canManage = query({
  args: {},
  handler: async (ctx) => {
    return await canContribute(ctx);
  },
});

/**
 * Add a resource to the library. Admins and feed curators only; admins may
 * also flag their submission as featured.
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    url: v.string(),
    domain: v.string(),
    category: v.string(),
    topics: v.array(v.string()),
    levels: v.array(v.string()),
    badges: v.array(v.string()),
    featured: v.boolean(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canContribute(ctx))) {
      throw new Error("Only admins and feed curators can add resources.");
    }
    const userId = (await getAuthUserId(ctx)) as Id<"users">;
    const user = await ctx.db.get(userId);

    const name = args.name.trim();
    const description = args.description.trim();
    const source = args.source.trim();
    const url = args.url.trim();

    if (name.length === 0) throw new Error("Give the resource a name.");
    if (name.length > 80) throw new Error("Keep the name under 80 characters.");
    if (description.length === 0) {
      throw new Error("Add a one-line description of what this resource is.");
    }
    if (description.length > 300) {
      throw new Error("Keep the description under 300 characters.");
    }
    if (source.length === 0) throw new Error("Who provides this resource?");
    if (source.length > 80) throw new Error("Keep the provider under 80 characters.");

    // Validate the URL (http/https only — no javascript:, data:, etc.)
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("That doesn't look like a valid URL.");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Use a http(s) link to the resource.");
    }

    if (!(CATEGORIES as readonly string[]).includes(args.category)) {
      throw new Error("Pick a valid category.");
    }
    if (
      args.topics.length === 0 ||
      args.topics.length > 4 ||
      !args.topics.every((t) => (TOPICS as readonly string[]).includes(t))
    ) {
      throw new Error("Pick between 1 and 4 valid topics.");
    }
    if (
      args.levels.length === 0 ||
      !args.levels.every((l) => (LEVELS as readonly string[]).includes(l))
    ) {
      throw new Error("Pick a valid level.");
    }
    if (
      args.badges.length > 4 ||
      !args.badges.every((b) => (BADGES as readonly string[]).includes(b))
    ) {
      throw new Error("Pick valid feature badges.");
    }

    // Reject exact duplicates (same normalized URL or same name) against both
    // the user-added table and the curated list would need the client module;
    // here we dedupe against the database.
    const normalized = url.replace(/\/+$/, "").toLowerCase();
    const existing = await ctx.db.query("customResources").collect();
    for (const r of existing) {
      if (r.url.replace(/\/+$/, "").toLowerCase() === normalized) {
        throw new Error("That URL is already in the resource library.");
      }
      if (r.name.trim().toLowerCase() === name.toLowerCase()) {
        throw new Error("A resource with that name already exists.");
      }
    }

    const isAdmin = user?.role === "admin";
    return await ctx.db.insert("customResources", {
      name,
      description,
      url,
      domain: args.domain.trim() || parsed.hostname.replace(/^www\./, ""),
      category: args.category,
      topics: args.topics,
      levels: args.levels,
      badges: args.badges,
      featured: args.featured === true && isAdmin,
      source,
      addedBy: userId,
      addedByName: user?.name ?? user?.email?.split("@")[0] ?? "Prism author",
    });
  },
});

/**
 * Remove a custom resource — the author who added it, or any admin.
 */
export const remove = mutation({
  args: { id: v.id("customResources") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in.");
    }
    const resource = await ctx.db.get(args.id);
    if (resource === null) return;
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role === "admin";
    if (!isAdmin && resource.addedBy !== userId) {
      throw new Error("You can only remove resources you added.");
    }
    await ctx.db.delete(args.id);
  },
});
