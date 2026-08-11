import mammoth from "mammoth/mammoth.browser.js";
import { countNonFormulaChars, MAX_BODY_CHARS, MAX_IMAGES } from "./math-count";

/**
 * Word (.docx) → Prisma post importer.
 *
 * The pipeline is deliberately decoupled so other sources (PDF, Markdown,
 * HTML, Google Docs) can later produce the same normalized result:
 *
 *   DOCX ──mammoth──▶ HTML ──parse──▶ Normalized blocks ──▶ Prisma body
 *
 * The output `body` is Prisma's native post format: a single string with
 * inline markup the shared renderer understands:
 *   - `##` / `###` / `####`   section headings
 *   - `- item` / `1. item`    bullet / numbered lists
 *   - `| a | b |` pipe tables
 *   - `> text`                note / definition callouts
 *   - `$...$`                 LaTeX math (from Word equations)
 *   - `[img:N]`               inline images (index into the images array)
 *   - `**bold**` and `[label](url)` inline formatting
 *
 * Images are extracted as data URLs and uploaded to Convex storage at
 * publish time. Nothing here touches the network or the database.
 */

export const MAX_DOCX_BYTES = 25 * 1024 * 1024; // 25 MB, configurable later

export interface ImportedImage {
  dataUrl: string;
  /** index referenced by [img:N] markers in the body */
  index: number;
}

export interface ImportWarning {
  code: string;
  message: string;
}

export interface ImportStats {
  sections: number;
  paragraphs: number;
  images: number;
  equations: number;
  equationsUnconverted: number;
  tables: number;
  lists: number;
  chars: number;
}

export interface ImportResult {
  fileName: string;
  title: string;
  body: string;
  images: ImportedImage[];
  /** plain text (math stripped) — used for AI enhancement */
  plainText: string;
  topicGuess: string | null;
  difficultyGuess: "intro" | "intermediate" | "advanced" | null;
  warnings: ImportWarning[];
  stats: ImportStats;
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

/* ── Topic / difficulty guessing (heuristics — always editable) ─────────── */

const TOPIC_KEYWORDS: [string, string[]][] = [
  ["mechanics", ["force", "momentum", "newton", "kinematics", "projectile", "friction", "torque", "energy", "work", "oscillat", "spring", "pendulum", "velocity", "acceleration", "collision", "gravity", "inertia"]],
  ["electromagnetism", ["electric", "magnetic", "coulomb", "field", "capacitor", "induct", "maxwell", "charge", "voltage", "ampere", "ohm", "gauss"]],
  ["waves", ["wave", "frequency", "amplitude", "resonance", "interference", "diffraction", "doppler", "sound", "harmonic"]],
  ["optics", ["optics", "lens", "mirror", "refraction", "reflection", "photon", "ray", "focal", "prism", "polariz"]],
  ["thermodynamics", ["thermodynamic", "entropy", "temperature", "heat", "internal energy", "gas law", "carnot", "enthalpy", "boltzmann"]],
  ["quantum", ["quantum", "wavefunction", "schr", "planck", "photon", "uncertainty", "heisenberg", "eigen", "superposition", "tunneling", "dirac"]],
  ["atomic", ["nucleus", "nuclear", "decay", "fission", "fusion", "radiation", "isotope", "atom", "electron shell", "half-life"]],
  ["relativity", ["relativity", "lorentz", "spacetime", "speed of light", "special relativ", "general relativ", "twin paradox"]],
  ["astrophysics", ["star", "galaxy", "cosmolog", "orbit", "planet", "supernova", "black hole", "stellar", "nebula", "redshift"]],
  ["electronics", ["circuit", "diode", "transistor", "amplifier", "resistor", "capacitor", "logic gate", "semiconductor", "op-amp"]],
  ["mathematical", ["vector", "calculus", "differential equation", "fourier", "laplace", "complex number", "tensor", "linear algebra", "gradient", "divergence", "curl"]],
  ["experimental", ["experiment", "measurement", "uncertainty analysis", "error analysis", "calibration", "apparatus", "data analysis"]],
];

const ADVANCED_KEYWORDS = ["tensor", "hamiltonian", "lagrangian", "quantum field", "relativistic", "statistical mechanics", "variational", "hilbert", "advanced", "graduate", "electrodynamics"];
const INTRO_KEYWORDS = ["introduction", "introductory", "basics", "fundamentals", "beginner", "high school", "first year", "overview"];

function guessTopic(plainText: string): string | null {
  const text = plainText.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const [topic, words] of TOPIC_KEYWORDS) {
    const score = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  return bestScore >= 2 ? best : null;
}

function guessDifficulty(plainText: string): "intro" | "intermediate" | "advanced" | null {
  const text = plainText.toLowerCase();
  const advanced = ADVANCED_KEYWORDS.reduce((a, w) => a + (text.includes(w) ? 1 : 0), 0);
  const intro = INTRO_KEYWORDS.reduce((a, w) => a + (text.includes(w) ? 1 : 0), 0);
  if (advanced >= 2) return "advanced";
  if (intro >= 2) return "intro";
  if (advanced === 1) return "advanced";
  return null;
}

/* ── MathML → LaTeX (best effort, conservative) ─────────────────────────── */

const GREEK: Record<string, string> = {
  alpha: "\\alpha", beta: "\\beta", gamma: "\\gamma", delta: "\\delta",
  epsilon: "\\epsilon", varepsilon: "\\varepsilon", zeta: "\\zeta",
  eta: "\\eta", theta: "\\theta", vartheta: "\\vartheta", iota: "\\iota",
  kappa: "\\kappa", lambda: "\\lambda", mu: "\\mu", nu: "\\nu", xi: "\\xi",
  pi: "\\pi", varpi: "\\varpi", rho: "\\rho", sigma: "\\sigma",
  varsigma: "\\varsigma", tau: "\\tau", upsilon: "\\upsilon",
  phi: "\\phi", varphi: "\\varphi", chi: "\\chi", psi: "\\psi",
  omega: "\\omega", Gamma: "\\Gamma", Delta: "\\Delta", Theta: "\\Theta",
  Lambda: "\\Lambda", Xi: "\\Xi", Pi: "\\Pi", Sigma: "\\Sigma",
  Upsilon: "\\Upsilon", Phi: "\\Phi", Psi: "\\Psi", Omega: "\\Omega",
};

const OPERATORS: Record<string, string> = {
  "∫": "\\int", "∬": "\\iint", "∭": "\\iiint", "∑": "\\sum", "∏": "\\prod",
  "√": "\\sqrt", "∛": "\\sqrt[3]", "≠": "\\ne", "≤": "\\le", "≥": "\\ge",
  "×": "\\times", "·": "\\cdot", "±": "\\pm", "∓": "\\mp", "∞": "\\infty",
  "→": "\\to", "⇒": "\\Rightarrow", "⇔": "\\Leftrightarrow", "∈": "\\in",
  "∉": "\\notin", "∂": "\\partial", "∇": "\\nabla", "≈": "\\approx",
  "∝": "\\propto", "≡": "\\equiv", "≪": "\\ll", "≫": "\\gg",
  "∘": "\\circ", "⋯": "\\cdots", "…": "\\ldots", "∀": "\\forall",
  "∃": "\\exists", "∪": "\\cup", "∩": "\\cap", "⊂": "\\subset",
  "⊆": "\\subseteq", "∅": "\\emptyset", "ℏ": "\\hbar", "†": "^\\dagger",
  "⟨": "\\langle", "⟩": "\\rangle",
};

const VALID_TEX_CHARS = /^[A-Za-z0-9\s+\-*/=<>()[\]{},.;:!?'"|\\^_~#&@%]+$/;

function texEscape(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}");
}

/**
 * Convert a MathML `<math>` element to LaTeX. Returns null when the tree
 * contains constructs we can't safely translate (caller flags the equation
 * as needing review instead of corrupting it).
 */
export function mathmlToLatex(el: Element): string | null {
  let unreliable = false;

  const convert = (node: Element): string => {
    const tag = node.tagName.toLowerCase();

    // Embedded TeX annotation (some tools store the real LaTeX here).
    if (tag === "annotation" || tag === "annotation-xml") {
      const enc = node.getAttribute("encoding") ?? "";
      if (enc.toLowerCase().includes("tex")) {
        const tex = node.textContent?.trim() ?? "";
        if (tex) return tex;
      }
      return "";
    }
    if (tag === "semantics" || tag === "mstyle" || tag === "mpadded" || tag === "mphantom") {
      return Array.from(node.children).map(convert).join("");
    }

    const children = Array.from(node.children);
    const text = (node.textContent ?? "").trim();

    switch (tag) {
      case "math":
        return Array.from(node.children).map(convert).join("");
      case "mrow":
        return children.map(convert).join("");
      case "mi": {
        if (children.length > 0) return children.map(convert).join("");
        const name = text.replace(/\u200b/g, "");
        if (GREEK[name]) return GREEK[name];
        if (/^[A-Za-z]$/.test(name)) return name;
        if (/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
          // multi-letter symbol (e.g. "F", "eff") — render as-is
          return name;
        }
        unreliable = true;
        return name;
      }
      case "mn":
        return text;
      case "mo": {
        if (OPERATORS[text]) return OPERATORS[text];
        if (VALID_TEX_CHARS.test(text)) return text;
        unreliable = true;
        return text;
      }
      case "mtext":
        return texEscape(text);
      case "mspace":
        return " ";
      case "mfrac": {
        const num = children[0] ? convert(children[0]) : "";
        const den = children[1] ? convert(children[1]) : "";
        return `\\frac{${num}}{${den}}`;
      }
      case "msup": {
        const base = children[0] ? convert(children[0]) : "";
        const sup = children[1] ? convert(children[1]) : "";
        return `{${base}}^{${sup}}`;
      }
      case "msub": {
        const base = children[0] ? convert(children[0]) : "";
        const sub = children[1] ? convert(children[1]) : "";
        return `{${base}}_{${sub}}`;
      }
      case "msubsup": {
        const base = children[0] ? convert(children[0]) : "";
        const sub = children[1] ? convert(children[1]) : "";
        const sup = children[2] ? convert(children[2]) : "";
        return `{${base}}_{${sub}}^{${sup}}`;
      }
      case "msqrt":
        return `\\sqrt{${children.map(convert).join("")}}`;
      case "mroot": {
        const base = children[0] ? convert(children[0]) : "";
        const deg = children[1] ? convert(children[1]) : "";
        return `\\sqrt[${deg}]{${base}}`;
      }
      case "munderover":
      case "munder":
      case "mover": {
        const base = children[0] ? convert(children[0]) : "";
        if (base === "\\int" || base === "\\sum" || base === "\\prod") {
          const below = children[1] ? convert(children[1]) : "";
          const above = children[2] ? convert(children[2]) : "";
          if (tag === "munderover") return `${base}_{${below}}^{${above}}`;
          if (tag === "munder") return `${base}_{${below}}`;
          return `${base}^{${above}}`;
        }
        return base;
      }
      case "mfenced": {
        const open = node.getAttribute("open") ?? "(";
        const close = node.getAttribute("close") ?? ")";
        const inner = children.map(convert).join(", ");
        return `${open}${inner}${close}`;
      }
      case "merror":
        unreliable = true;
        return "";
      default:
        // Unknown MathML construct — do not guess.
        unreliable = true;
        return text || children.map(convert).join("");
    }
  };

  const tex = convert(el);
  if (unreliable) return null;
  return tex;
}

/* ── HTML → normalized blocks → Prisma body ─────────────────────────────── */

interface Block {
  kind: "title" | "heading" | "paragraph" | "list" | "table" | "image" | "equation";
  level?: number;
  text?: string;
  items?: { text: string; ordered: boolean; depth: number }[];
  rows?: string[][];
  imageDataUrl?: string;
  latex?: string;
  reliable?: boolean;
}

function cleanText(node: Element): string {
  // Walk descendants producing plain text, converting <a> to [label](url),
  // <strong>/<b> to **bold**, and dropping <em>/<i> markers.
  const parts: string[] = [];
  const walk = (n: Node): void => {
    if (n.nodeType === Node.TEXT_NODE) {
      parts.push(n.textContent ?? "");
      return;
    }
    if (!(n instanceof Element)) return;
    const tag = n.tagName.toLowerCase();
    if (tag === "math" || tag === "script" || tag === "style") return;
    if (tag === "br") {
      parts.push("\n");
      return;
    }
    if (tag === "a") {
      const href = n.getAttribute("href");
      const label = (n.textContent ?? "").trim();
      if (href && /^https?:\/\//i.test(href) && label) {
        parts.push(`[${label}](${href})`);
        return;
      }
      walk(n);
      return;
    }
    if (tag === "strong" || tag === "b") {
      const inner: string[] = [];
      const sub = (x: Node): void => {
        if (x.nodeType === Node.TEXT_NODE) inner.push(x.textContent ?? "");
        else if (x instanceof Element && x.tagName.toLowerCase() !== "math") {
          Array.from(x.childNodes).forEach(sub);
        }
      };
      Array.from(n.childNodes).forEach(sub);
      const content = inner.join("").trim();
      parts.push(content ? `**${content}**` : "");
      return;
    }
    if (tag === "em" || tag === "i") {
      Array.from(n.childNodes).forEach(walk);
      return;
    }
    // Sub/superscripts: keep the content, drop the styling (content-preserving).
    if (tag === "sub" || tag === "sup") {
      parts.push((n.textContent ?? "").trim());
      return;
    }
    Array.from(n.childNodes).forEach(walk);
  };
  Array.from(node.childNodes).forEach(walk);
  return parts
    .join("")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Serialize a MathML element that may appear inline inside a paragraph. */
function extractInlineMath(el: Element): { latex: string; reliable: boolean } | null {
  const tex = mathmlToLatex(el);
  if (tex === null) return null;
  return { latex: tex, reliable: true };
}

function blockToLines(block: Block, body: string[]): void {
  switch (block.kind) {
    case "heading": {
      const marker = block.level === 2 ? "## " : block.level === 3 ? "### " : "#### ";
      body.push(`${marker}${block.text ?? ""}`);
      break;
    }
    case "paragraph":
      body.push(block.text ?? "");
      break;
    case "equation":
      body.push(`$${block.latex ?? ""}$`);
      break;
    case "list":
      for (const item of block.items ?? []) {
        const prefix = item.ordered
          ? `${(item.depth * 3 + 1).toString()}. `
          : `${"  ".repeat(item.depth)}- `;
        body.push(`${prefix}${item.text}`);
      }
      break;
    case "table": {
      const rows = block.rows ?? [];
      if (rows.length === 0) break;
      const colCount = Math.max(...rows.map((r) => r.length));
      const pad = (cells: string[]) =>
        `| ${cells.map((c) => (c ?? "").trim() || " ").join(" | ")} |`;
      body.push(pad(rows[0]));
      body.push(`| ${Array.from({ length: colCount }, () => "---").join(" | ")} |`);
      for (let r = 1; r < rows.length; r++) body.push(pad(rows[r]));
      break;
    }
    case "image":
      body.push(`[img:${block.imageDataUrl}]`);
      break;
    case "title":
      break; // handled by the title field
  }
}

const NOTE_PREFIX = /^(note|important|definition|key point|key takeaway|warning|remember|caution)\b[:.]/i;

async function parseHtml(
  html: string,
  warnings: ImportWarning[],
): Promise<{
  title: string;
  body: string;
  blocks: Block[];
  plainText: string;
  images: ImportedImage[];
}> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const bodyEl = doc.body;
  const blocks: Block[] = [];
  let title = "";

  const pushParagraph = (el: Element, notePrefix = false) => {
    const hasMath = el.querySelector("math") !== null;
    const hasImg = el.querySelector("img") !== null;

    if (hasImg && !hasMath && (el.textContent ?? "").trim() === "") {
      const img = el.querySelector("img");
      if (img) {
        blocks.push({ kind: "image", imageDataUrl: img.getAttribute("src") ?? "" });
        return;
      }
    }

    const text = cleanText(el);
    if (hasMath) {
      // Split the paragraph into text + equation segments.
      const segments: (string | { latex: string })[] = [];
      let cursor = 0;
      const mathNodes = Array.from(el.querySelectorAll("math"));
      for (const m of mathNodes) {
        const before = (() => {
          const range = doc.createRange();
          range.setStart(el, 0);
          range.setEndBefore(m);
          return range.toString();
        })();
        const beforeText = before.slice(cursor).trim();
        if (beforeText) segments.push(beforeText);
        const converted = extractInlineMath(m);
        if (converted) {
          segments.push({ latex: converted.latex });
        } else {
          warnings.push({
            code: "equation-unconverted",
            message: "An equation could not be converted automatically — review it in the editor.",
          });
          segments.push({ latex: (m.textContent ?? "").trim() || "?" });
        }
        cursor = before.length + (m.textContent ?? "").length;
      }
      const after = el.textContent ?? "";
      const afterText = after.slice(cursor).trim();
      if (afterText) segments.push(afterText);

      const built = segments
        .map((s) => (typeof s === "string" ? s : `$${s.latex}$`))
        .join(" ");
      if (built.trim()) blocks.push({ kind: "paragraph", text: built.trim() });
      return;
    }

    if (!text) return;

    // Inline image inside a paragraph (rare) — hoist it.
    const img = el.querySelector("img");
    if (img && el.children.length === 1) {
      blocks.push({ kind: "image", imageDataUrl: img.getAttribute("src") ?? "" });
      return;
    }

    const finalText = notePrefix || NOTE_PREFIX.test(text) ? `> ${text}` : text;
    blocks.push({ kind: "paragraph", text: finalText });
  };

  const walkChildren = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      const tag = child.tagName.toLowerCase();

      if (tag === "h1") {
        const text = cleanText(child);
        if (!title) {
          title = text;
          blocks.push({ kind: "title" });
        } else {
          blocks.push({ kind: "heading", level: 2, text });
        }
        continue;
      }
      if (tag === "h2") {
        blocks.push({ kind: "heading", level: 2, text: cleanText(child) });
        continue;
      }
      if (tag === "h3") {
        blocks.push({ kind: "heading", level: 3, text: cleanText(child) });
        continue;
      }
      if (tag === "h4" || tag === "h5" || tag === "h6") {
        blocks.push({ kind: "heading", level: 4, text: cleanText(child) });
        continue;
      }
      if (tag === "p") {
        pushParagraph(child);
        continue;
      }
      if (tag === "ul" || tag === "ol") {
        const ordered = tag === "ol";
        const items: { text: string; ordered: boolean; depth: number }[] = [];
        const walkList = (listEl: Element, depth: number) => {
          for (const li of Array.from(listEl.children)) {
            if (li.tagName.toLowerCase() !== "li") continue;
            const text = cleanText(li).replace(/^\d+[.)]\s*/, "");
            if (text) items.push({ text, ordered, depth });
            for (const nested of Array.from(li.children)) {
              const nt = nested.tagName.toLowerCase();
              if (nt === "ul" || nt === "ol") walkList(nested, depth + 1);
            }
          }
        };
        walkList(child, 0);
        if (items.length > 0) blocks.push({ kind: "list", items });
        continue;
      }
      if (tag === "table") {
        const rows: string[][] = [];
        for (const tr of Array.from(child.querySelectorAll("tr"))) {
          const cells: string[] = [];
          for (const td of Array.from(tr.children)) {
            if (td.tagName.toLowerCase() === "td" || td.tagName.toLowerCase() === "th") {
              cells.push(cleanText(td));
            }
          }
          if (cells.length > 0) rows.push(cells);
        }
        if (rows.length > 0) blocks.push({ kind: "table", rows });
        continue;
      }
      if (tag === "img") {
        blocks.push({ kind: "image", imageDataUrl: child.getAttribute("src") ?? "" });
        continue;
      }
      if (tag === "ol" || tag === "ul") continue;
      // Fall through to a generic container walk (div, section, …).
      walkChildren(child);
    }
  };

  walkChildren(bodyEl);

  // Fallback title from the first paragraph if the document had no headings.
  if (!title) {
    const firstParagraph = blocks.find((b) => b.kind === "paragraph");
    const fallback = firstParagraph?.text?.replace(/^> /, "").split("\n")[0] ?? "";
    if (fallback) {
      title = fallback.slice(0, 120);
      blocks.splice(blocks.indexOf(firstParagraph!), 1);
    }
  }

  // Assign image indices in document order and emit [img:N] markers.
  const images: ImportedImage[] = [];
  const bodyLines: string[] = [];
  for (const block of blocks) {
    if (block.kind === "image") {
      const dataUrl = block.imageDataUrl ?? "";
      if (images.length >= MAX_IMAGES) {
        warnings.push({
          code: "too-many-images",
          message: `Only the first ${MAX_IMAGES} images were kept.`,
        });
        continue;
      }
      const index = images.length;
      images.push({ dataUrl, index });
      bodyLines.push(`[img:${index}]`);
      continue;
    }
    blockToLines(block, bodyLines);
  }

  const body = bodyLines.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  const plainText = body
    .replace(/\$\$?[^$]*\$\$?/g, " ")
    .replace(/\[img:\d+\]/g, " ")
    .replace(/[#>*|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { title, body, blocks, plainText, images };
}

/* ── Public entry point ─────────────────────────────────────────────────── */

/**
 * Parse a `.docx` File into a Prisma post draft. Throws `ImportError` for
 * validation failures (wrong type, too large, corrupted). Everything else is
 * reported via `result.warnings` and editable in the generated post editor.
 */
export async function parseWordFile(file: File): Promise<ImportResult> {
  const warnings: ImportWarning[] = [];

  if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    if (/\.docx?$/i.test(file.name) && !/\.docx$/i.test(file.name)) {
      throw new ImportError(
        "Legacy .doc files aren't supported yet — open the document in Word (or Google Docs) and save it as .docx, then try again.",
      );
    }
    throw new ImportError("Unsupported file type. Please upload a .docx Word document.");
  }
  if (file.size === 0) {
    throw new ImportError("The Word file is empty — there's nothing to import.");
  }
  if (file.size > MAX_DOCX_BYTES) {
    throw new ImportError(
      `The file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_DOCX_BYTES / 1024 / 1024} MB.`,
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  let html: string;
  try {
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
        ],
        includeDefaultStyleMap: true,
        convertImage: async (image) => {
          try {
            const buffer = await image.readAsArrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = "";
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
              binary += String.fromCharCode.apply(
                null,
                Array.from(bytes.subarray(i, i + chunk)),
              );
            }
            const base64 = btoa(binary);
            return {
              src: `data:${image.contentType || "image/png"};base64,${base64}`,
            };
          } catch {
            warnings.push({
              code: "image-extract",
              message: "An embedded image could not be extracted.",
            });
            return { src: "" };
          }
        },
      },
    );
    html = result.value;
    for (const message of result.messages) {
      if (message.type === "warning") {
        warnings.push({ code: "mammoth", message: message.message });
      }
    }
  } catch (err) {
    throw new ImportError(
      "The Word file appears to be corrupted or unsupported. Try exporting it again as .docx, or try another file.",
    );
  }

  const { title, body, plainText, images } = await parseHtml(html, warnings);

  const stats: ImportStats = {
    sections: (body.match(/^#{2,4} /gm) ?? []).length,
    paragraphs: body
      .split(/\n\n+/)
      .filter((l) => l.trim() && !/^[#|>]/.test(l.trim()) && !/^\[img:/i.test(l.trim())).length,
    images: (body.match(/\[img:\d+\]/g) ?? []).length,
    equations: (body.match(/\$[^$]+\$/g) ?? []).length,
    equationsUnconverted: warnings.filter((w) => w.code === "equation-unconverted").length,
    tables: (body.match(/\| --- \|/g) ?? []).length,
    lists: (body.match(/^- /gm) ?? []).length + (body.match(/^\d+\. /gm) ?? []).length,
    chars: countNonFormulaChars(body),
  };

  if (stats.chars > MAX_BODY_CHARS) {
    warnings.push({
      code: "too-long",
      message: `The imported text is ${stats.chars.toLocaleString()} characters — over the ${MAX_BODY_CHARS.toLocaleString()} limit. Trim it in the editor before publishing.`,
    });
  }

  const finalTitle = title.trim() || file.name.replace(/\.docx$/i, "");
  if (!title.trim()) {
    warnings.push({ code: "no-title", message: "No title heading was found — using the file name." });
  }

  return {
    fileName: file.name,
    title: finalTitle,
    body,
    images,
    plainText,
    topicGuess: guessTopic(plainText),
    difficultyGuess: guessDifficulty(plainText),
    warnings,
    stats,
  };
}
