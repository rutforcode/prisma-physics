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

// Physics topics covered by the feed — the full undergraduate syllabus
export const TOPIC_IDS = [
  "mechanics",
  "fluids",
  "thermodynamics",
  "statistical",
  "electromagnetism",
  "circuits",
  "waves",
  "optics",
  "quantum",
  "atomic",
  "particle",
  "solidstate",
  "relativity",
  "cosmology",
  "classical",
  "mathematical",
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

      canPostFeed: v.optional(v.boolean()), // granted by admins — allows posting to the study feed
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Admin-authored announcements shown at the top of the study feed
    feedPosts: defineTable({
      authorId: v.optional(v.id("users")), // absent for seeded "Prism Team" posts
      title: v.string(),
      body: v.string(),
      topic: v.optional(topicValidator),
      images: v.optional(v.array(v.id("_storage"))), // up to MAX_IMAGES attachments
      editedAt: v.optional(v.number()), // set when a post is edited
    }).index("by_author", ["authorId"]),

    // Community posts — students share questions, notes, and explanations
    posts: defineTable({
      authorId: v.id("users"),
      title: v.string(),
      body: v.string(),
      topic: v.optional(topicValidator),
      images: v.optional(v.array(v.id("_storage"))), // up to MAX_IMAGES attachments
      likedBy: v.array(v.id("users")),
      mentionedUserIds: v.optional(v.array(v.id("users"))),
      promotedAt: v.optional(v.number()),
      editedAt: v.optional(v.number()), // set when the author edits the post
      // Word-import / draft lifecycle (drafts are visible only to their author)
      status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
      tags: v.optional(v.array(v.string())),
      description: v.optional(v.string()),
      difficulty: v.optional(
        v.union(v.literal("intro"), v.literal("intermediate"), v.literal("advanced")),
      ),
      sourceDocument: v.optional(v.id("_storage")), // original imported .docx
      importedFrom: v.optional(v.string()), // original file name
    }).index("by_author", ["authorId"]),

    // Snapshot of every feed announcement edit (powers the edit-history UI)
    feedPostEdits: defineTable({
      feedPostId: v.id("feedPosts"),
      editorId: v.id("users"),
      editedAt: v.number(),
      title: v.string(),
      body: v.string(),
      topic: v.optional(topicValidator),
    }).index("by_feed_post", ["feedPostId"]),

    // Snapshot of every community post edit (powers the edit-history UI)
    postEdits: defineTable({
      postId: v.id("posts"),
      editorId: v.id("users"),
      editedAt: v.number(),
      title: v.string(),
      body: v.string(),
      topic: v.optional(topicValidator),
    }).index("by_post", ["postId"]),

    // Community activity notifications (mentions + likes)
    notifications: defineTable({
      recipientId: v.id("users"),
      actorId: v.id("users"),
      type: v.union(
        v.literal("mention"),
        v.literal("like"),
        v.literal("promotion"),
      ),
      postId: v.id("posts"),
      read: v.boolean(),
    })
      .index("by_recipient", ["recipientId"])
      .index("by_recipient_read", ["recipientId", "read"]),

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
