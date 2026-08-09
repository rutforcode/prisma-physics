import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { difficultyMeta, topicMeta } from "@/lib/topic-meta";
import type { Doc } from "@/convex/_generated/dataModel";
import { ArrowRight, Clock3 } from "lucide-react";

export function ConceptCard({
  concept,
  onOpen,
}: {
  concept: Doc<"concepts">;
  onOpen: (slug: string) => void;
}) {
  const topic = topicMeta(concept.topic);
  const diff = difficultyMeta(concept.difficulty);

  return (
    <button
      type="button"
      onClick={() => onOpen(concept.slug)}
      className="glass glass-hover group flex h-full flex-col rounded-3xl p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
            topic.chip,
          )}
        >
          <topic.icon className="size-5" />
        </span>
        <Badge variant="outline" className={cn("rounded-full border", diff.badge)}>
          {diff.label}
        </Badge>
      </div>

      <h3 className="font-display mt-5 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
        {concept.title}
      </h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {concept.summary}
      </p>

      {concept.keyFormula && (
        <div className="glass-chip mt-4 inline-flex w-fit max-w-full items-center gap-2 rounded-xl px-3 py-1.5">
          <span className="font-mono text-[13px] font-medium text-primary">
            {concept.keyFormula}
          </span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/60 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" />
          {concept.readingMinutes} min read
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          Read
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
