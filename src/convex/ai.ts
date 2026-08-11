"use node";

/**
 * Optional AI enhancement for imported Word documents.
 *
 * Uses AI21 Labs (Jamba) — key: AI21_API_KEY (set in the project's
 * Keys/environment tab; model overridable via AI21_MODEL). The action is
 * purely additive: it generates metadata (summary, description, tags, topic,
 * prerequisites, key takeaways) from the extracted text and never rewrites
 * the educational content itself. All output is editable and rejectable in
 * the import editor.
 */
import { AI21 } from "ai21";
import { v } from "convex/values";
import { action } from "./_generated/server";

const CHAT_MODELS = ["jamba-mini", "jamba-large"] as const;
type ChatModelName = (typeof CHAT_MODELS)[number];

function pickModel(): ChatModelName {
  const env = process.env.AI21_MODEL;
  if (env && (CHAT_MODELS as readonly string[]).includes(env)) {
    return env as ChatModelName;
  }
  return "jamba-mini";
}

/** Pull the first balanced JSON object out of a model response. */
function extractJson(content: string): Record<string, unknown> {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("The AI response didn't contain JSON.");
  }
  try {
    const parsed: unknown = JSON.parse(content.slice(start, end + 1));
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through to the friendly error below
  }
  throw new Error("The AI response couldn't be parsed — try again.");
}

function toStringList(value: unknown): string[] | undefined {
  if (typeof value === "string") {
    const list = value
      .split(/[,\n]/)
      .map((s) => s.replace(/^[-*•\s]+/, "").trim())
      .filter(Boolean);
    return list.length > 0 ? list.slice(0, 12) : undefined;
  }
  if (Array.isArray(value)) {
    const list = value
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
    return list.length > 0 ? list.slice(0, 12) : undefined;
  }
  return undefined;
}

export const enhancePost = action({
  args: {
    title: v.string(),
    body: v.string(),
    wants: v.object({
      summary: v.boolean(),
      description: v.boolean(),
      tags: v.boolean(),
      topics: v.boolean(),
      prerequisites: v.boolean(),
      takeaways: v.boolean(),
    }),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.AI21_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI enhancement isn't configured yet. Add your AI21_API_KEY in the project's Keys tab, then try again.",
      );
    }

    const instructions: string[] = [];
    if (args.wants.summary) {
      instructions.push('"summary": a 2–3 sentence summary of the post content');
    }
    if (args.wants.description) {
      instructions.push('"description": one sentence under 160 characters');
    }
    if (args.wants.tags) {
      instructions.push('"tags": an array of 3–8 short lowercase study tags');
    }
    if (args.wants.topics) {
      instructions.push(
        '"topic": the best-matching physics topic from this list, or null if unsure: mechanics, fluids, thermodynamics, statistical, electromagnetism, circuits, waves, optics, quantum, atomic, particle, solidstate, relativity, cosmology, classical, mathematical',
      );
    }
    if (args.wants.prerequisites) {
      instructions.push('"prerequisites": an array of prerequisite concepts a student should know first');
    }
    if (args.wants.takeaways) {
      instructions.push('"takeaways": an array of 3–5 key takeaways (single sentences)');
    }
    if (instructions.length === 0) {
      throw new Error("Select at least one enhancement to generate.");
    }

    // Strip markup so the model sees clean prose (keep it bounded).
    const text = args.body
      .replace(/\$\$?[^$]*\$\$?/g, " ")
      .replace(/\[img:\d+\]/g, " ")
      .replace(/[#>*|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12_000);

    const client = new AI21({ apiKey });
    const response = await client.chat.completions.create({
      model: pickModel(),
      messages: [
        {
          role: "system",
          content:
            "You are an expert physics educator. You generate helpful study metadata from student material. Never rewrite, add to, or invent facts that are not present in the provided text. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: `Post title: ${args.title}\n\nContent:\n${text}\n\nReturn a single JSON object with exactly these keys:\n${instructions.join("\n")}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 900,
    });

    const content = response.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) {
      throw new Error("The AI returned an empty response — try again.");
    }
    const json = extractJson(content);

    return {
      summary: typeof json.summary === "string" ? json.summary.trim() || undefined : undefined,
      description:
        typeof json.description === "string"
          ? json.description.trim().slice(0, 160) || undefined
          : undefined,
      tags: toStringList(json.tags),
      topic: typeof json.topic === "string" ? json.topic : undefined,
      prerequisites: toStringList(json.prerequisites),
      takeaways: toStringList(json.takeaways),
    };
  },
});
