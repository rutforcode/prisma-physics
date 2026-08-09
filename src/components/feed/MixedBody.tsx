import { MathText } from "@/components/MathJax";
import { IMG_MARKER_REGEX } from "@/lib/inline-images";
import { MentionText } from "@/lib/mentions";
import { cn } from "@/lib/utils";
import { Fragment, type ReactNode } from "react";

/**
 * Renders a post body with inline image mixing: `[img:N]` markers embed
 * image N (from `imageUrls`) inside the text flow, between mention-aware,
 * math-typesetting text segments. Images whose index is never referenced by
 * a marker fall back to a trailing attachment grid — so old posts that never
 * use markers keep showing their attachments exactly as before.
 */
export function MixedBody({
  text,
  imageUrls,
  mentionMap,
  className,
}: {
  text: string;
  imageUrls: (string | null)[];
  mentionMap?: Record<string, string>;
  className?: string;
}) {
  const used = new Set<number>();
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(IMG_MARKER_REGEX)) {
    const idx = Number(match[1]);
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (idx >= 0 && idx < imageUrls.length) {
      used.add(idx);
      const url = imageUrls[idx];
      if (url) {
        parts.push(
          <img
            key={`inline-${idx}`}
            src={url}
            alt={`Inline image ${idx + 1}`}
            className="mt-3 block max-h-96 w-full rounded-2xl object-cover ring-1 ring-white/70"
          />,
        );
      }
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Images never referenced by a marker → trailing attachment grid.
  const trailing = imageUrls
    .map((url, i) => ({ url, i }))
    .filter(({ url, i }) => !used.has(i) && url);

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <MathText key={`text-${i}`}>
            <MentionText text={part} mentionMap={mentionMap} />
          </MathText>
        ) : (
          <Fragment key={`node-${i}`}>{part}</Fragment>
        ),
      )}
      {trailing.length > 0 && (
        <div
          className={cn(
            "mt-4 grid gap-3",
            trailing.length === 1
              ? "grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3",
          )}
        >
          {trailing.map(({ url, i }) => (
            <img
              key={i}
              src={url!}
              alt={`Attachment ${i + 1}`}
              className="max-h-96 w-full rounded-2xl object-cover ring-1 ring-white/70"
            />
          ))}
        </div>
      )}
    </div>
  );
}
