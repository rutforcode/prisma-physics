import { MathText } from "@/components/MathJax";
import { MentionText } from "@/lib/mentions";
import type { ReactNode } from "react";

/**
 * Lightweight line-markup renderer shared by every post surface.
 *
 * The post body stays a single plain string (Prisma's native format), but a
 * small set of conventions render as real structure — produced by the Word
 * importer and available to any author:
 *
 *   `## ` / `### ` / `#### `   headings
 *   `- item`  / `1. item`      bullet / numbered lists
 *   `| a | b |`  (+ `|---|`)   tables (row 1 header when a separator follows)
 *   `> text`                   note / definition callout
 *   `**bold**`                 inline bold
 *   `[label](https://…)`       safe external link
 *
 * `$…$` math and @mentions work inside every block. Line breaks within a
 * paragraph are preserved; blank lines separate blocks. Anything that isn't
 * one of these patterns renders exactly as plain text, so existing posts
 * look unchanged.
 */

const BOLD_OR_LINK =
  /(\*\*[^*\n]+\*\*)|(\[([^\]\n]+)\]\((https?:\/\/[^\s)\n]+)\))/g;

function InlineRich({
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

  BOLD_OR_LINK.lastIndex = 0;
  while ((match = BOLD_OR_LINK.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <MathText key={key++}>
          <MentionText text={text.slice(lastIndex, match.index)} mentionMap={mentionMap} />
        </MathText>,
      );
    }
    if (match[1] !== undefined) {
      const inner = match[1].slice(2, -2);
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          <MathText>
            <MentionText text={inner} mentionMap={mentionMap} />
          </MathText>
        </strong>,
      );
    } else if (match[2] !== undefined) {
      const label = match[3];
      const href = match[4];
      parts.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
        >
          {label}
        </a>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(
      <MathText key={key++}>
        <MentionText text={text.slice(lastIndex)} mentionMap={mentionMap} />
      </MathText>,
    );
  }
  return <>{parts}</>;
}

function isTableLine(line: string) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isSeparatorLine(line: string) {
  return /^\s*\|[\s:|]+\|\s*$/.test(line);
}

function splitCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** `- item`, `* item`, `1. item`, `12. item` — returns (depth, rest). */
function matchListItem(line: string): { depth: number; rest: string } | null {
  const m = line.match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)$/);
  if (!m) return null;
  return { depth: Math.floor(m[1].length / 2), rest: m[2] };
}

export function MarkupText({
  text,
  mentionMap,
}: {
  text: string;
  mentionMap?: Record<string, string>;
}) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (t: string) => <InlineRich text={t} mentionMap={mentionMap} />;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const content = heading[2];
      const cls =
        level === 2
          ? "mt-6 mb-2 text-lg font-semibold tracking-tight text-foreground"
          : level === 3
            ? "mt-5 mb-1.5 text-base font-semibold tracking-tight text-foreground"
            : "mt-4 mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground";
      blocks.push(
        <p key={key++} className={cls}>
          {inline(content)}
        </p>,
      );
      i++;
      continue;
    }

    // Note / definition callout
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <div
          key={key++}
          className="my-3 rounded-r-xl border-l-2 border-primary/50 bg-primary/5 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90"
        >
          {quoteLines.map((q, qi) => (
            <p key={qi} className={qi > 0 ? "mt-1.5" : undefined}>
              {inline(q)}
            </p>
          ))}
        </div>,
      );
      continue;
    }

    // Tables (consecutive pipe lines; separator after row 1 = header row)
    if (isTableLine(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const hasHeader = tableLines.length > 1 && isSeparatorLine(tableLines[1]);
      const rows = tableLines
        .filter((l) => !isSeparatorLine(l))
        .map(splitCells);
      const colCount = Math.max(...rows.map((r) => r.length));
      blocks.push(
        <div key={key++} className="my-3 overflow-x-auto rounded-xl border border-white/60 bg-white/40">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {rows.map((row, ri) => {
                const isHeader = hasHeader && ri === 0;
                return (
                  <tr key={ri} className={isHeader ? "border-b border-white/70 bg-white/50" : "border-b border-white/40 last:border-0"}>
                    {Array.from({ length: colCount }, (_, ci) => (
                      <td
                        key={ci}
                        className={
                          isHeader
                            ? "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            : "px-3 py-2 text-left align-top text-foreground/90"
                        }
                      >
                        {inline(row[ci] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Lists (consecutive list lines — ordered and bullet can mix)
    if (matchListItem(line)) {
      const items: { depth: number; rest: string; ordered: boolean }[] = [];
      while (i < lines.length) {
        const item = matchListItem(lines[i]);
        if (!item) break;
        items.push({ ...item, ordered: /^\s*\d+\./.test(lines[i]) });
        i++;
      }
      blocks.push(
        <div key={key++} className="my-2 space-y-1.5">
          {items.map((item, ii) => (
            <div key={ii} className="flex items-start gap-2" style={{ paddingLeft: item.depth * 20 }}>
              <span className="mt-px shrink-0 select-none text-primary">
                {item.ordered ? `${ii + 1}.` : "•"}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/90">
                {inline(item.rest)}
              </span>
            </div>
          ))}
        </div>,
      );
      continue;
    }

    // Plain paragraph — keep going until a blank line or a markup line.
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) break;
      if (/^(#{2,4})\s+/.test(l)) break;
      if (l.startsWith(">")) break;
      if (isTableLine(l)) break;
      if (matchListItem(l)) break;
      paraLines.push(l);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
        {inline(paraLines.join("\n"))}
      </p>,
    );
  }

  return <>{blocks}</>;
}
