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

/**
 * Automatically typesets LaTeX anywhere in the document. MathJax scans the
 * page once on load; this observer catches everything React mounts later
 * (route changes, reader content, community posts) and re-typesets after a
 * short debounce. Returns null — mount once at the app root.
 */
export function MathJaxAutoRender() {
  useEffect(() => {
    if (typeof window === "undefined" || !("MutationObserver" in window)) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver((mutations) => {
      // Only react to new elements being added (not attribute/text churn),
      // and ignore MathJax's own output to avoid feedback loops.
      const hasRelevant = mutations.some((m) =>
        m.type === "childList"
          ? Array.from(m.addedNodes).some(
              (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                !((node as HTMLElement).tagName ?? "")
                  .toLowerCase()
                  .startsWith("mjx-"),
            )
          : false,
      );
      if (!hasRelevant) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        window.MathJax?.typesetPromise().catch((err: unknown) => {
          console.warn("[MathJax] auto-typeset failed:", err);
        });
      }, 200);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
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
