import { MathInline } from "@/components/MathJax";
import { Delete, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

interface MathKey {
  /** LaTeX inserted at the caret (may contain `{}` placeholder pairs). */
  tex: string;
  /** LaTeX rendered on the button when different from `tex` (e.g. x^{}). */
  display?: string;
  /** Plain-text label instead of a rendered glyph (for multi-line templates). */
  label?: string;
  aria?: string;
}

interface KeyGroup {
  title: string;
  keys: MathKey[];
}

const GROUPS: KeyGroup[] = [
  {
    title: "Arithmetic",
    keys: [
      { tex: "+", aria: "Plus" },
      { tex: "-", aria: "Minus" },
      { tex: "\\pm", aria: "Plus or minus" },
      { tex: "\\mp", aria: "Minus or plus" },
      { tex: "\\times", aria: "Times" },
      { tex: "\\div", aria: "Divide" },
      { tex: "\\cdot", aria: "Dot product" },
      { tex: "\\ast", aria: "Asterisk" },
      { tex: "\\star", aria: "Star" },
      { tex: "\\circ", aria: "Composition circle" },
      { tex: "\\bullet", aria: "Bullet" },
      { tex: "\\%", aria: "Percent" },
      { tex: "'", display: "f'", aria: "Prime (derivative)" },
      { tex: "\\ldots", aria: "Lower dots" },
      { tex: "\\cdots", aria: "Centre dots" },
      { tex: "\\infty", aria: "Infinity" },
      { tex: "\\propto", aria: "Proportional to" },
    ],
  },
  {
    title: "Relations & inequalities",
    keys: [
      { tex: "=", aria: "Equals" },
      { tex: "\\neq", aria: "Not equal" },
      { tex: "\\approx", aria: "Approximately" },
      { tex: "\\sim", aria: "Similar to" },
      { tex: "\\simeq", aria: "Asymptotic to" },
      { tex: "\\cong", aria: "Congruent" },
      { tex: "\\equiv", aria: "Identical to" },
      { tex: "\\doteq", aria: "Dot over equals" },
      { tex: "\\triangleq", aria: "Defined as" },
      { tex: "<", aria: "Less than" },
      { tex: ">", aria: "Greater than" },
      { tex: "\\leq", aria: "Less than or equal" },
      { tex: "\\geq", aria: "Greater than or equal" },
      { tex: "\\ll", aria: "Much less than" },
      { tex: "\\gg", aria: "Much greater than" },
      { tex: "\\prec", aria: "Precedes" },
      { tex: "\\succ", aria: "Succeeds" },
      { tex: "\\preceq", aria: "Precedes or equal" },
      { tex: "\\succeq", aria: "Succeeds or equal" },
      { tex: "\\mid", aria: "Divides" },
      { tex: "\\nmid", aria: "Does not divide" },
      { tex: "\\parallel", aria: "Parallel" },
      { tex: "\\perp", aria: "Perpendicular" },
      { tex: "\\therefore", aria: "Therefore" },
      { tex: "\\because", aria: "Because" },
    ],
  },
  {
    title: "Sets & logic",
    keys: [
      { tex: "\\in", aria: "Element of" },
      { tex: "\\ni", aria: "Contains as element" },
      { tex: "\\notin", aria: "Not an element of" },
      { tex: "\\subset", aria: "Subset" },
      { tex: "\\supset", aria: "Superset" },
      { tex: "\\subseteq", aria: "Subset or equal" },
      { tex: "\\supseteq", aria: "Superset or equal" },
      { tex: "\\nsubseteq", aria: "Not a subset of" },
      { tex: "\\nsupseteq", aria: "Not a superset of" },
      { tex: "\\not\\subset", aria: "Not a subset" },
      { tex: "\\not\\supset", aria: "Not a superset" },
      { tex: "\\cup", aria: "Union" },
      { tex: "\\cap", aria: "Intersection" },
      { tex: "\\setminus", aria: "Set difference" },
      { tex: "\\emptyset", aria: "Empty set" },
      { tex: "\\varnothing", aria: "Empty set (variant)" },
      { tex: "\\land", aria: "Logical and" },
      { tex: "\\lor", aria: "Logical or" },
      { tex: "\\neg", aria: "Logical not" },
      { tex: "\\forall", aria: "For all" },
      { tex: "\\exists", aria: "There exists" },
      { tex: "\\nexists", aria: "There does not exist" },
      { tex: "\\vdash", aria: "Turnsile (proves)" },
      { tex: "\\models", aria: "Satisfies (models)" },
      { tex: "\\langle", aria: "Left angle bracket" },
      { tex: "\\rangle", aria: "Right angle bracket" },
      { tex: "\\top", aria: "Top (tautology)" },
      { tex: "\\aleph", aria: "Aleph" },
      { tex: "\\beth", aria: "Beth" },
    ],
  },
  {
    title: "Arrows",
    keys: [
      { tex: "\\rightarrow", aria: "Right arrow" },
      { tex: "\\leftarrow", aria: "Left arrow" },
      { tex: "\\leftrightarrow", aria: "Left right arrow" },
      { tex: "\\Rightarrow", aria: "Implies" },
      { tex: "\\Leftarrow", aria: "Implied by" },
      { tex: "\\Leftrightarrow", aria: "If and only if" },
      { tex: "\\longrightarrow", aria: "Long right arrow" },
      { tex: "\\longleftarrow", aria: "Long left arrow" },
      { tex: "\\Longrightarrow", aria: "Long implies" },
      { tex: "\\Longleftarrow", aria: "Long implied by" },
      { tex: "\\Longleftrightarrow", aria: "Long if and only if" },
      { tex: "\\mapsto", aria: "Maps to" },
      { tex: "\\rightleftharpoons", aria: "Equilibrium arrows" },
      { tex: "\\uparrow", aria: "Up arrow" },
      { tex: "\\downarrow", aria: "Down arrow" },
      { tex: "\\updownarrow", aria: "Up down arrow" },
      { tex: "\\Uparrow", aria: "Double up arrow" },
      { tex: "\\Downarrow", aria: "Double down arrow" },
      { tex: "\\nearrow", aria: "North east arrow" },
      { tex: "\\searrow", aria: "South east arrow" },
      { tex: "\\swarrow", aria: "South west arrow" },
      { tex: "\\nwarrow", aria: "North west arrow" },
    ],
  },
  {
    title: "Greek · lowercase",
    keys: [
      { tex: "\\alpha", aria: "Alpha" },
      { tex: "\\beta", aria: "Beta" },
      { tex: "\\gamma", aria: "Gamma" },
      { tex: "\\delta", aria: "Delta" },
      { tex: "\\epsilon", aria: "Epsilon" },
      { tex: "\\zeta", aria: "Zeta" },
      { tex: "\\eta", aria: "Eta" },
      { tex: "\\theta", aria: "Theta" },
      { tex: "\\iota", aria: "Iota" },
      { tex: "\\kappa", aria: "Kappa" },
      { tex: "\\lambda", aria: "Lambda" },
      { tex: "\\mu", aria: "Mu" },
      { tex: "\\nu", aria: "Nu" },
      { tex: "\\xi", aria: "Xi" },
      { tex: "\\omicron", aria: "Omicron" },
      { tex: "\\pi", aria: "Pi" },
      { tex: "\\rho", aria: "Rho" },
      { tex: "\\sigma", aria: "Sigma" },
      { tex: "\\varsigma", aria: "Final sigma" },
      { tex: "\\tau", aria: "Tau" },
      { tex: "\\upsilon", aria: "Upsilon" },
      { tex: "\\phi", aria: "Phi" },
      { tex: "\\chi", aria: "Chi" },
      { tex: "\\psi", aria: "Psi" },
      { tex: "\\omega", aria: "Omega" },
    ],
  },
  {
    title: "Greek · variants & uppercase",
    keys: [
      { tex: "\\varepsilon", aria: "Variant epsilon" },
      { tex: "\\vartheta", aria: "Variant theta" },
      { tex: "\\varphi", aria: "Variant phi" },
      { tex: "\\varpi", aria: "Variant pi" },
      { tex: "\\varrho", aria: "Variant rho" },
      { tex: "\\Gamma", aria: "Capital gamma" },
      { tex: "\\Delta", aria: "Capital delta" },
      { tex: "\\Theta", aria: "Capital theta" },
      { tex: "\\Lambda", aria: "Capital lambda" },
      { tex: "\\Xi", aria: "Capital xi" },
      { tex: "\\Pi", aria: "Capital pi" },
      { tex: "\\Sigma", aria: "Capital sigma" },
      { tex: "\\Upsilon", aria: "Capital upsilon" },
      { tex: "\\Phi", aria: "Capital phi" },
      { tex: "\\Psi", aria: "Capital psi" },
      { tex: "\\Omega", aria: "Capital omega" },
    ],
  },
  {
    title: "Calculus & summation",
    keys: [
      { tex: "\\int", aria: "Integral" },
      { tex: "\\int_{}^{}", aria: "Definite integral" },
      { tex: "\\iint", aria: "Double integral" },
      { tex: "\\iiint", aria: "Triple integral" },
      { tex: "\\oint", aria: "Contour integral" },
      { tex: "\\sum_{}^{}", aria: "Summation" },
      { tex: "\\prod_{}^{}", aria: "Product" },
      { tex: "\\coprod", aria: "Coproduct" },
      { tex: "\\bigcup", aria: "Big union" },
      { tex: "\\bigcap", aria: "Big intersection" },
      { tex: "\\bigoplus", aria: "Direct sum" },
      { tex: "\\bigotimes", aria: "Tensor product" },
      { tex: "\\lim_{}", aria: "Limit" },
      { tex: "\\sup", aria: "Supremum" },
      { tex: "\\inf", aria: "Infimum" },
      { tex: "\\max", aria: "Maximum" },
      { tex: "\\min", aria: "Minimum" },
      { tex: "\\partial", aria: "Partial derivative" },
      { tex: "\\nabla", aria: "Nabla (gradient)" },
    ],
  },
  {
    title: "Functions & logarithms",
    keys: [
      { tex: "\\sin", aria: "Sine" },
      { tex: "\\cos", aria: "Cosine" },
      { tex: "\\tan", aria: "Tangent" },
      { tex: "\\cot", aria: "Cotangent" },
      { tex: "\\sec", aria: "Secant" },
      { tex: "\\csc", aria: "Cosecant" },
      { tex: "\\sinh", aria: "Hyperbolic sine" },
      { tex: "\\cosh", aria: "Hyperbolic cosine" },
      { tex: "\\tanh", aria: "Hyperbolic tangent" },
      { tex: "\\arcsin", aria: "Inverse sine" },
      { tex: "\\arccos", aria: "Inverse cosine" },
      { tex: "\\arctan", aria: "Inverse tangent" },
      { tex: "\\log", aria: "Logarithm" },
      { tex: "\\ln", aria: "Natural logarithm" },
      { tex: "\\lg", aria: "Base ten logarithm" },
      { tex: "\\exp", aria: "Exponential" },
      { tex: "\\det", aria: "Determinant" },
      { tex: "\\dim", aria: "Dimension" },
      { tex: "\\ker", aria: "Kernel" },
      { tex: "\\gcd", aria: "Greatest common divisor" },
      { tex: "\\arg", aria: "Argument" },
      { tex: "\\deg", aria: "Degree of function" },
      { tex: "\\bmod", aria: "Modulo" },
    ],
  },
  {
    title: "Physics & constants",
    keys: [
      { tex: "\\hbar", aria: "Reduced Planck constant" },
      { tex: "\\ell", aria: "Script ell (length)" },
      { tex: "^\\circ", display: "45^{\\circ}", aria: "Degrees" },
      { tex: "\\mathrm{d}", display: "\\mathrm{d}x", aria: "Differential d" },
      { tex: "\\Re", aria: "Real part" },
      { tex: "\\Im", aria: "Imaginary part" },
      { tex: "\\angle", aria: "Angle" },
      { tex: "\\measuredangle", aria: "Measured angle" },
      { tex: "\\triangle", aria: "Triangle" },
      { tex: "\\square", aria: "Square" },
      { tex: "\\blacksquare", aria: "Filled square" },
      { tex: "\\diamond", aria: "Diamond" },
    ],
  },
  {
    title: "Structures & fonts",
    keys: [
      { tex: "\\frac{}{}", aria: "Fraction" },
      { tex: "\\dfrac{}{}", display: "\\dfrac{a}{b}", aria: "Display fraction" },
      { tex: "\\tfrac{}{}", display: "\\tfrac{a}{b}", aria: "Text fraction" },
      { tex: "\\binom{}{}", display: "\\binom{n}{k}", aria: "Binomial coefficient" },
      { tex: "\\sqrt{}", display: "\\sqrt{x}", aria: "Square root" },
      { tex: "\\sqrt[]{}", display: "\\sqrt[n]{x}", aria: "Nth root" },
      { tex: "^{}", display: "x^{}", aria: "Superscript" },
      { tex: "_{}", display: "x_{}", aria: "Subscript" },
      { tex: "\\text{}", display: "\\text{a}", aria: "Text inside math" },
      { tex: "\\mathbf{}", display: "\\mathbf{v}", aria: "Bold (vectors)" },
      { tex: "\\boldsymbol{}", display: "\\boldsymbol{v}", aria: "Bold italic" },
      { tex: "\\mathbb{}", display: "\\mathbb{R}", aria: "Blackboard bold" },
      { tex: "\\mathcal{}", display: "\\mathcal{L}", aria: "Calligraphic" },
      { tex: "\\mathrm{}", display: "\\mathrm{d}", aria: "Roman (upright)" },
    ],
  },
  {
    title: "Accents & vectors",
    keys: [
      { tex: "\\hat{}", display: "\\hat{x}", aria: "Hat" },
      { tex: "\\widehat{}", display: "\\widehat{x}", aria: "Wide hat" },
      { tex: "\\vec{}", display: "\\vec{v}", aria: "Vector arrow" },
      { tex: "\\bar{}", display: "\\bar{x}", aria: "Bar (mean)" },
      { tex: "\\overline{}", display: "\\overline{x}", aria: "Overline" },
      { tex: "\\underline{}", display: "\\underline{x}", aria: "Underline" },
      { tex: "\\tilde{}", display: "\\tilde{x}", aria: "Tilde" },
      { tex: "\\widetilde{}", display: "\\widetilde{x}", aria: "Wide tilde" },
      { tex: "\\dot{}", display: "\\dot{x}", aria: "First time derivative" },
      { tex: "\\ddot{}", display: "\\ddot{x}", aria: "Second derivative" },
      { tex: "\\dddot{}", display: "\\dddot{x}", aria: "Third derivative" },
      { tex: "\\overrightarrow{}", display: "\\overrightarrow{v}", aria: "Right vector arrow" },
      { tex: "\\overleftarrow{}", display: "\\overleftarrow{v}", aria: "Left vector arrow" },
      { tex: "\\overbrace{}", display: "\\overbrace{x}", aria: "Overbrace" },
      { tex: "\\underbrace{}", display: "\\underbrace{x}", aria: "Underbrace" },
    ],
  },
  {
    title: "Brackets & delimiters",
    keys: [
      { tex: "\\left( {} \\right)", display: "\\left( x \\right)", aria: "Auto-sized parentheses" },
      { tex: "\\left[ {} \\right]", display: "\\left[ x \\right]", aria: "Auto-sized brackets" },
      { tex: "\\left\\{ {} \\right\\}", display: "\\left\\{ x \\right\\}", aria: "Auto-sized braces" },
      { tex: "\\left| {} \\right|", display: "\\left| x \\right|", aria: "Absolute value" },
      { tex: "\\left\\langle {} \\right\\rangle", display: "\\left\\langle x \\right\\rangle", aria: "Expectation value" },
      { tex: "\\left\\lfloor {} \\right\\rfloor", display: "\\left\\lfloor x \\right\\rfloor", aria: "Floor" },
      { tex: "\\left\\lceil {} \\right\\rceil", display: "\\left\\lceil x \\right\\rceil", aria: "Ceiling" },
      {
        tex: "\\begin{cases} {} \\\\ {} \\end{cases}",
        label: "cases",
        aria: "Piecewise cases",
      },
      {
        tex: "\\begin{pmatrix} {} & {} \\\\ {} & {} \\end{pmatrix}",
        label: "matrix",
        aria: "Matrix",
      },
    ],
  },
];

const RECENT_KEY = "prism:math-recents";
const RECENT_LIMIT = 10;

/** Load recently used symbols from localStorage (best-effort). */
function loadRecents(): MathKey[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MathKey =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as MathKey).tex === "string",
    );
  } catch {
    return [];
  }
}

function saveRecents(recents: MathKey[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  } catch {
    // Storage unavailable — ignore.
  }
}

/** A single keyboard button, shared by the grouped grid and “recently used”. */
function KeyButton({
  item,
  onInsert,
}: {
  item: MathKey;
  onInsert: (key: MathKey) => void;
}) {
  return (
    <button
      type="button"
      aria-label={item.aria ?? `Insert ${item.tex}`}
      onClick={() => onInsert(item)}
      className="glass-chip flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm text-foreground transition-all hover:-translate-y-px hover:text-primary"
    >
      {item.label ? (
        <span className="text-[13px] font-medium">{item.label}</span>
      ) : (
        <MathInline tex={item.display ?? item.tex} />
      )}
    </button>
  );
}

export function MathKeyboard({
  onInsert,
  onBackspace,
  onClose,
}: {
  onInsert: (tex: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<MathKey[]>(() => loadRecents());
  const normalized = query.trim().toLowerCase();

  // Filter keys across every group by name, LaTeX command, label or group.
  const filtered = useMemo(() => {
    if (!normalized) return GROUPS;
    const tokens = normalized.split(/\s+/);
    return GROUPS.map((group) => ({
      ...group,
      keys: group.keys.filter((key) => {
        const haystack = [key.aria, key.tex, key.label, group.title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .replace(/\\/g, "");
        return tokens.every((token) => haystack.includes(token));
      }),
    })).filter((group) => group.keys.length > 0);
  }, [normalized]);

  const matchCount = filtered.reduce((n, group) => n + group.keys.length, 0);

  /** Record a used symbol (most recent first) and hand it to the composer. */
  const handleInsert = (key: MathKey) => {
    setRecents((prev) => {
      const next = [key, ...prev.filter((item) => item.tex !== key.tex)].slice(
        0,
        RECENT_LIMIT,
      );
      saveRecents(next);
      return next;
    });
    onInsert(key.tex);
  };

  const clearRecents = () => {
    setRecents([]);
    saveRecents([]);
  };

  return (
    <div className="max-h-[65vh] overflow-y-auto overscroll-contain">
      <div className="sticky top-0 z-10 -mx-1 space-y-2 bg-background/90 px-1 pb-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Math keyboard
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onBackspace}
              aria-label="Delete character before cursor"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
            >
              <Delete className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close math keyboard"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Clear the search instead of closing the popover on first Esc
              if (e.key === "Escape" && query) {
                e.stopPropagation();
                setQuery("");
              }
            }}
            placeholder="Search symbols…"
            aria-label="Search math symbols"
            className="h-9 w-full rounded-lg border border-white/70 bg-white/50 pl-8 pr-8 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {normalized && matchCount > 0 && (
          <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            {matchCount} symbol{matchCount === 1 ? "" : "s"} found
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">
          No symbols match “{query.trim()}” — try “integral”, “gamma” or
          “arrow”.
        </p>
      ) : (
        <>
          {!normalized && recents.length > 0 && (
            <div className="mt-2.5 first:mt-0">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Recently used
                </p>
                <button
                  type="button"
                  onClick={clearRecents}
                  className="text-[10px] font-medium text-muted-foreground/70 transition-colors hover:text-destructive"
                >
                  Clear
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {recents.map((item) => (
                  <KeyButton
                    key={item.tex}
                    item={item}
                    onInsert={handleInsert}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.map((group) => (
            <div key={group.title} className="mt-2.5 first:mt-0">
              <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                {group.title}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {group.keys.map((key) => (
                  <KeyButton
                    key={`${group.title}-${key.tex}`}
                    item={key}
                    onInsert={handleInsert}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
