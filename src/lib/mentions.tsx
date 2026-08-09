import { Fragment, type ReactNode } from "react";

/**
 * Matches an @mention: requires a word boundary (start, whitespace, or "(")
 * before "@" so plain emails are left alone. The mention body allows letters,
 * digits, dots, spaces, underscores and hyphens, and must be followed by
 * punctuation, whitespace, or end of string.
 */
export const MENTION_REGEX =
  /(^|[\s(])@([A-Za-z0-9][A-Za-z0-9._ -]{0,39})(?=[\s.,!?;:)'")\]]|$)/g;

/** Renders text with @mentions styled as highlighted chips. */
export function MentionText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  MENTION_REGEX.lastIndex = 0;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <Fragment key={key++}>
        {match[1]}
        <span className="rounded-md bg-primary/12 px-1 py-0.5 font-semibold text-primary">
          @{match[2]}
        </span>
      </Fragment>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}
