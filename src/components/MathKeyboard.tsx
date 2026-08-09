import { MathInline } from "@/components/MathJax";
import { Delete, X } from "lucide-react";

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
    <div className="max-h-[65vh] overflow-y-auto overscroll-contain">
      <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between bg-background/90 px-1 pb-2 backdrop-blur">
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
                {key.label ? (
                  <span className="text-[13px] font-medium">{key.label}</span>
                ) : (
                  <MathInline tex={key.display ?? key.tex} />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
