import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { difficultyMeta, topicMeta } from "@/lib/topic-meta";
import type { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Sigma,
} from "lucide-react";

export function ConceptReader({
  concept,
  onBack,
  onNavigate,
  prev,
  next,
}: {
  concept: Doc<"concepts">;
  onBack: () => void;
  onNavigate: (slug: string) => void;
  prev?: Doc<"concepts">;
  next?: Doc<"concepts">;
}) {
  const topic = topicMeta(concept.topic);
  const diff = difficultyMeta(concept.difficulty);

  return (
    <motion.article
      key={concept.slug}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-3xl"
    >
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="glass-chip inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to feed
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("rounded-full border", diff.badge)}>
            {diff.label}
          </Badge>
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            {concept.readingMinutes} min
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="glass-strong rounded-[2rem] p-7 md:p-10">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3.5 py-1.5 text-xs font-semibold",
            topic.chip,
          )}
        >
          <topic.icon className="size-3.5" />
          {topic.label}
        </span>

        <h1 className="font-display mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-[2.75rem] md:leading-[1.1]">
          {concept.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {concept.summary}
        </p>

        {concept.keyFormula && (
          <div className="relative mt-7 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-sky-400/10 via-white/40 to-indigo-400/10 px-6 py-5">
            <div className="absolute -right-6 -top-8 text-primary/10">
              <Sigma className="size-28" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Key equation
            </p>
            <p className="mt-2 font-mono text-lg font-medium leading-relaxed text-foreground md:text-xl">
              {concept.keyFormula}
            </p>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-5">
        {concept.content.map((section, i) => (
          <section
            key={section.heading}
            className="glass rounded-3xl p-7 md:p-8"
          >
            <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold tracking-tight">
              <span className="font-mono text-sm font-medium text-primary/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {/* Takeaways */}
      <div className="glass-strong mt-6 rounded-3xl p-7 md:p-8">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Key takeaways
        </h2>
        <ul className="mt-4 space-y-3">
          {concept.takeaways.map((takeaway) => (
            <li key={takeaway} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Check className="size-3" />
              </span>
              <span className="text-[15px] leading-relaxed">{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prev / next */}
      {(prev || next) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <button
              type="button"
              onClick={() => onNavigate(prev.slug)}
              className="glass glass-hover group flex items-center gap-3 rounded-2xl px-5 py-4 text-left"
            >
              <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                  Previous
                </span>
                <span className="block truncate text-sm font-medium">
                  {prev.title}
                </span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button
              type="button"
              onClick={() => onNavigate(next.slug)}
              className="glass glass-hover group flex items-center justify-end gap-3 rounded-2xl px-5 py-4 text-right"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                  Next
                </span>
                <span className="block truncate text-sm font-medium">
                  {next.title}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
}
