import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

/**
 * Matches an @mention: requires a word boundary (start, whitespace, or "(")
 * before "@" so plain emails are left alone. The mention body allows letters,
 * digits, dots, spaces, underscores and hyphens, and must be followed by
 * punctuation, whitespace, or end of string.
 */
export const MENTION_REGEX =
  /(^|[\s(])@([A-Za-z0-9][A-Za-z0-9._ -]{0,39})(?=[\s.,!?;:)'")\]]|$)/g;

/**
 * Renders text with @mentions styled as highlighted chips. When `mentionMap`
 * maps a mention name to a user id, the chip becomes a link to that user's
 * profile.
 */
export function MentionText({
  text,
  mentionMap,
}: {
  text: string;
  mentionMap?: Record<string, string>;
}) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  MENTION_REGEX.lastIndex = 0;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const userId = mentionMap ? mentionMap[match[2]] : undefined;
    const chip = userId ? (
      <Link
        to={`/profile?user=${userId}`}
        className="rounded-md bg-primary/12 px-1 py-0.5 font-semibold text-primary transition-colors hover:bg-primary/20 hover:underline"
      >
        @{match[2]}
      </Link>
    ) : (
      <span className="rounded-md bg-primary/12 px-1 py-0.5 font-semibold text-primary">
        @{match[2]}
      </span>
    );
    parts.push(
      <Fragment key={key++}>
        {match[1]}
        {chip}
      </Fragment>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}
