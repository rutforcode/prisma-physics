import { MathText } from "@/components/MathJax";
import { IMG_MARKER_REGEX } from "@/lib/inline-images";
import { MentionText } from "@/lib/mentions";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Full-screen image viewer: dark blurred backdrop, centered image, prev/next
 * navigation, keyboard support (Esc closes, ←/→ cycle), and scroll locking.
 * Rendered through a portal so it always covers the viewport.
 */
function ImageLightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const count = images.length;
  const current = images[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNavigate(index - 1);
      else if (e.key === "ArrowRight") onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop — click anywhere to close */}
      <button
        type="button"
        aria-label="Close image"
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out bg-slate-950/85 backdrop-blur-md"
      />

      {/* Image */}
      <figure className="relative z-10 flex max-h-full max-w-full flex-col items-center gap-3 px-4">
        <img
          src={current}
          alt={`Image ${index + 1} of ${count}`}
          className="max-h-[82vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/20"
        />
        <figcaption className="glass-chip rounded-full px-3 py-1 text-xs font-medium text-foreground/90">
          Image {index + 1} of {count}
        </figcaption>
      </figure>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white shadow backdrop-blur transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {/* Prev / Next */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate(index + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Renders a post body with inline image mixing: `[img:N]` markers embed
 * image N (from `imageUrls`) inside the text flow, between mention-aware,
 * math-typesetting text segments. Images whose index is never referenced by
 * a marker fall back to a trailing attachment grid — so old posts that never
 * use markers keep showing their attachments exactly as before. Every image
 * opens in a full-screen lightbox when clicked.
 */
export function MixedBody({
  text,
  imageUrls,
  mentionMap,
  className,
}: {
  text: string;
  imageUrls: (string | null)[];
  mentionMap?: Record<string, string>;
  className?: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lightboxImages = imageUrls.filter((u): u is string => u !== null);

  const openLightbox = (url: string) => {
    const idx = lightboxImages.indexOf(url);
    if (idx !== -1) setLightbox(idx);
  };

  const used = new Set<number>();
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(IMG_MARKER_REGEX)) {
    const idx = Number(match[1]);
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (idx >= 0 && idx < imageUrls.length) {
      used.add(idx);
      const url = imageUrls[idx];
      if (url) {
        parts.push(
          <button
            key={`inline-${idx}`}
            type="button"
            onClick={() => openLightbox(url)}
            aria-label={`Open inline image ${idx + 1}`}
            className="mt-3 block w-full cursor-zoom-in rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <img
              src={url}
              alt={`Inline image ${idx + 1}`}
              className="max-h-96 w-full rounded-2xl object-cover ring-1 ring-white/70"
            />
          </button>,
        );
      }
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Images never referenced by a marker → trailing attachment grid.
  const trailing = imageUrls.flatMap((url, i) =>
    !used.has(i) && url !== null ? [{ url, i }] : [],
  );

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <MathText key={`text-${i}`}>
            <MentionText text={part} mentionMap={mentionMap} />
          </MathText>
        ) : (
          <Fragment key={`node-${i}`}>{part}</Fragment>
        ),
      )}
      {trailing.length > 0 && (
        <div
          className={cn(
            "mt-4 grid gap-3",
            trailing.length === 1
              ? "grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3",
          )}
        >
          {trailing.map(({ url, i }) => (
            <button
              key={i}
              type="button"
              onClick={() => openLightbox(url)}
              aria-label={`Open attachment ${i + 1}`}
              className="cursor-zoom-in rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <img
                src={url}
                alt={`Attachment ${i + 1}`}
                className="max-h-96 w-full rounded-2xl object-cover ring-1 ring-white/70"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox !== null &&
        lightboxImages.length > 0 &&
        createPortal(
          <ImageLightbox
            images={lightboxImages}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onNavigate={(next) => {
              const len = lightboxImages.length;
              setLightbox(((next % len) + len) % len);
            }}
          />,
          document.body,
        )}
    </div>
  );
}
