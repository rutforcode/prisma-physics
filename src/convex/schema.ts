import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Difficulty tiers for concept explanations
export const DIFFICULTIES = {
  INTRO: "intro",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export const difficultyValidator = v.union(
  v.literal(DIFFICULTIES.INTRO),
  v.literal(DIFFICULTIES.INTERMEDIATE),
  v.literal(DIFFICULTIES.ADVANCED),
);
export type Difficulty = Infer<typeof difficultyValidator>;

// Physics topics covered by the feed
export const TOPIC_IDS = [
  "mechanics",
  "electromagnetism",
  "thermodynamics",
  "waves",
  "quantum",
  "relativity",
] as const;

export const topicValidator = v.union(...TOPIC_IDS.map((t) => v.literal(t)));
export type TopicId = Infer<typeof topicValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Community posts — students share questions, notes, and explanations
    posts: defineTable({
      authorId: v.id("users"),
      title: v.string(),
      body: v.string(),
      topic: v.optional(topicValidator),
      imageStorageId: v.optional(v.id("_storage")),
      likedBy: v.array(v.id("users")),
    }).index("by_author", ["authorId"]),

    // Physics concept explanations shown in the study feed
    concepts: defineTable({
      slug: v.string(),
      title: v.string(),
      topic: topicValidator,
      difficulty: difficultyValidator,
      readingMinutes: v.number(),
      summary: v.string(),
      keyFormula: v.optional(v.string()),
      tags: v.array(v.string()),
      content: v.array(
        v.object({
          heading: v.string(),
          body: v.string(),
        }),
      ),
      takeaways: v.array(v.string()),
    })
      .index("by_slug", ["slug"])
      .index("by_topic", ["topic"])
      .index("by_difficulty", ["difficulty"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
