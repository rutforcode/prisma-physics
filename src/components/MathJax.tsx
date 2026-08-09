import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

/** Typeset any `$...$` math inside the given DOM node (no-op until MathJax loads). */
function typeset(node: HTMLElement | null) {
  if (node && window.MathJax) {
    window.MathJax.typesetPromise([node]).catch((err: unknown) => {
      console.warn("[MathJax] typeset failed:", err);
    });
  }
}

/** Renders a TeX expression as inline math (`$...$`). */
export function MathInline({
  tex,
  className,
}: {
  tex: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    typeset(ref.current);
  });
  return (
    <span ref={ref} className={cn("whitespace-nowrap", className)}>
      {`$${tex}$`}
    </span>
  );
}

/** Renders a TeX expression as display math (`$$...$$`). */
export function MathDisplay({
  tex,
  className,
}: {
  tex: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    typeset(ref.current);
  });
  return (
    <div ref={ref} className={cn("overflow-x-auto", className)}>
      {`$$${tex}$$`}
    </div>
  );
}

/**
 * Typesets rich text that may contain `$...$` inline math (e.g. explanation
 * bodies and takeaways).
 */
export function MathText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    typeset(ref.current);
  });
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
