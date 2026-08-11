/**
 * Helpers for inserting math with the on-screen keyboard.
 *
 * MathJax only renders LaTeX that lives inside math delimiters ($…$, $$…$$,
 * \(…\), \[…\]) — bare tokens like `\Psi` outside those show as raw text.
 * The keyboard therefore wraps inserted tokens in $…$ automatically, unless
 * the caret is already inside a math span, where tokens are inserted bare so
 * long formulas can be composed token by token.
 *
 * Frontend-only: imported by the composers, never by the Convex backend.
 */

/** Remove math spans so internal `$` don't confuse delimiter counting. */
function stripMathSpans(text: string): string {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/\\\[[\s\S]*?\\\]/g, "")
    .replace(/\\\([\s\S]*?\\\)/g, "");
}

/** True when the caret at `position` sits inside an existing math span. */
export function isInsideMath(text: string, position: number): boolean {
  const prefix = stripMathSpans(text.slice(0, position));
  const dollars = (prefix.match(/\$/g) ?? []).length;
  const opens = (prefix.match(/\\\(|\\\[/g) ?? []).length;
  const closes = (prefix.match(/\\\)|\\\]/g) ?? []).length;
  return dollars % 2 === 1 || opens > closes;
}

/**
 * Build the text to insert for a keyboard token at `position` plus the caret
 * offset from the insertion point. Outside math the token is wrapped in
 * $…$; `{}` pairs act as placeholders — a selection is wrapped by the first
 * pair, otherwise the caret lands inside it.
 */
export function mathInsert(
  text: string,
  position: number,
  tex: string,
  selected: string,
): { insert: string; caretOffset: number } {
  const wrap = !isInsideMath(text, position);
  let insert = wrap ? `$${tex}$` : tex;

  // Avoid "$$" or a backslash collision right after a closing delimiter.
  const prev = position > 0 ? text[position - 1] : "";
  if (wrap && (prev === "$" || prev === "\\")) {
    insert = ` ${insert}`;
  }

  let caretOffset = insert.length;
  const braceIndex = insert.indexOf("{}");
  if (braceIndex !== -1) {
    if (selected.length > 0) {
      insert =
        insert.slice(0, braceIndex) +
        `{${selected}}` +
        insert.slice(braceIndex + 2);
      caretOffset = braceIndex + selected.length + 2;
    } else {
      caretOffset = braceIndex + 1;
    }
  }

  return { insert, caretOffset };
}
