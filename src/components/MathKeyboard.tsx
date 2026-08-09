import { MathInline } from "@/components/MathJax";
import { Delete, X } from "lucide-react";

interface MathKey {
  /** LaTeX inserted at the caret (may contain `{}` placeholder pairs). */
  tex: string;
  /** LaTeX rendered on the button when different from `tex` (e.g. x^{}). */
  display?: string;
  aria?: string;
}

interface KeyGroup {
  title: string;
  keys: MathKey[];
}

const GROUPS: KeyGroup[] = [
  {
    title: "Operators",
    keys: [
      { tex: "+", aria: "Plus" },
      { tex: "-", aria: "Minus" },
      { tex: "\\times", aria: "Times" },
      { tex: "\\div", aria: "Divide" },
      { tex: "=", aria: "Equals" },
      { tex: "\\neq", aria: "Not equal" },
      { tex: "\\approx", aria: "Approximately" },
      { tex: "<", aria: "Less than" },
      { tex: ">", aria: "Greater than" },
      { tex: "\\leq", aria: "Less than or equal" },
      { tex: "\\geq", aria: "Greater than or equal" },
      { tex: "\\pm", aria: "Plus or minus" },
      { tex: "\\cdot", aria: "Dot product" },
      { tex: "\\infty", aria: "Infinity" },
      { tex: "\\propto", aria: "Proportional to" },
    ],
  },
  {
    title: "Greek",
    keys: [
      { tex: "\\alpha", aria: "Alpha" },
      { tex: "\\beta", aria: "Beta" },
      { tex: "\\gamma", aria: "Gamma" },
      { tex: "\\delta", aria: "Delta" },
      { tex: "\\epsilon", aria: "Epsilon" },
      { tex: "\\theta", aria: "Theta" },
      { tex: "\\lambda", aria: "Lambda" },
      { tex: "\\mu", aria: "Mu" },
      { tex: "\\pi", aria: "Pi" },
      { tex: "\\rho", aria: "Rho" },
      { tex: "\\sigma", aria: "Sigma" },
      { tex: "\\tau", aria: "Tau" },
      { tex: "\\phi", aria: "Phi" },
      { tex: "\\chi", aria: "Chi" },
      { tex: "\\psi", aria: "Psi" },
      { tex: "\\omega", aria: "Omega" },
      { tex: "\\Gamma", aria: "Capital gamma" },
      { tex: "\\Delta", aria: "Capital delta" },
      { tex: "\\Theta", aria: "Capital theta" },
      { tex: "\\Lambda", aria: "Capital lambda" },
      { tex: "\\Pi", aria: "Capital pi" },
      { tex: "\\Sigma", aria: "Capital sigma" },
      { tex: "\\Phi", aria: "Capital phi" },
      { tex: "\\Omega", aria: "Capital omega" },
    ],
  },
  {
    title: "Calculus & vectors",
    keys: [
      { tex: "\\int", aria: "Integral" },
      { tex: "\\int_{}^{}", aria: "Definite integral" },
      { tex: "\\oint", aria: "Contour integral" },
      { tex: "\\sum_{}^{}", aria: "Summation" },
      { tex: "\\prod_{}^{}", aria: "Product" },
      { tex: "\\partial", aria: "Partial" },
      { tex: "\\nabla", aria: "Nabla" },
      { tex: "\\lim_{}", aria: "Limit" },
    ],
  },
  {
    title: "Relations & logic",
    keys: [
      { tex: "\\rightarrow", aria: "Right arrow" },
      { tex: "\\leftarrow", aria: "Left arrow" },
      { tex: "\\Rightarrow", aria: "Implies" },
      { tex: "\\in", aria: "Element of" },
      { tex: "\\notin", aria: "Not an element of" },
      { tex: "\\subset", aria: "Subset" },
      { tex: "\\subseteq", aria: "Subset or equal" },
      { tex: "\\cup", aria: "Union" },
      { tex: "\\cap", aria: "Intersection" },
      { tex: "\\emptyset", aria: "Empty set" },
      { tex: "\\forall", aria: "For all" },
      { tex: "\\exists", aria: "There exists" },
      { tex: "\\equiv", aria: "Equivalent" },
    ],
  },
  {
    title: "Structures",
    keys: [
      { tex: "\\frac{}{}", aria: "Fraction" },
      { tex: "\\sqrt{}", aria: "Square root" },
      { tex: "^{}", display: "x^{}", aria: "Superscript" },
      { tex: "_{}", display: "x_{}", aria: "Subscript" },
      { tex: "\\hat{}", aria: "Hat" },
      { tex: "\\vec{}", aria: "Vector" },
      { tex: "\\dot{}", aria: "Time derivative" },
      { tex: "\\bar{}", aria: "Bar" },
      { tex: "\\text{}", display: "\\text{a}", aria: "Text in math" },
    ],
  },
];

export function MathKeyboard({
  onInsert,
  onBackspace,
  onClose,
}: {
  onInsert: (tex: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2">
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

      {GROUPS.map((group) => (
        <div key={group.title} className="mt-2.5 first:mt-0">
          <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            {group.title}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {group.keys.map((key) => (
              <button
                key={`${group.title}-${key.tex}`}
                type="button"
                aria-label={key.aria ?? `Insert ${key.tex}`}
                onClick={() => onInsert(key.tex)}
                className="glass-chip flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm text-foreground transition-all hover:-translate-y-px hover:text-primary"
              >
                <MathInline tex={key.display ?? key.tex} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
