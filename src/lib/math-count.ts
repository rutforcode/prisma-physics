/**
 * Shared helpers for feed-post limits.
 *
 * "Formulas are not counted as characters": LaTeX math segments wrapped in
 * $…$, $$…$$, \(…\) or \[…\] are stripped before counting, so students can
 * write long derivations without eating into the character budget.
 *
 * Imported by both the frontend composer (live counter) and the backend
 * (enforcement) — keep this file dependency-free so the Convex bundler
 * accepts it.
 */
export const MAX_BODY_CHARS = 50_000;
export const MAX_IMAGES = 25;

const MATH_PATTERNS = [
  /\$\$[\s\S]*?\$\$/g,
  /\\\[[\s\S]*?\\\]/g,
  /\$[\s\S]*?\$/g,
  /\\\([\s\S]*?\\\)/g,
];

/** Remove every LaTeX math segment from a string. */
export function stripMath(text: string): string {
  let out = text;
  for (const re of MATH_PATTERNS) {
    out = out.replace(re, "");
  }
  return out;
}

/** Count the number of math segments in a string. */
export function countFormulas(text: string): number {
  let remaining = text;
  let count = 0;
  for (const pattern of MATH_PATTERNS) {
    const re = new RegExp(pattern.source, "g");
    count += (remaining.match(re) ?? []).length;
    remaining = remaining.replace(re, "");
  }
  return count;
}

/** Character count excluding formulas. */
export function countNonFormulaChars(text: string): number {
  return stripMath(text).length;
}
