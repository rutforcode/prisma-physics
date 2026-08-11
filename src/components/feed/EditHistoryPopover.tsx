import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";

/** One recorded edit (newest first). */
export interface PostEditRecord {
  editedAt: number;
  editorId: Id<"users">;
  editorName: string;
  title: string;
  body: string;
  topic?: string;
}

/**
 * The 🕘 history button + timeline popover for edited posts. Shared by
 * community post cards and feed announcement cards.
 */
export function EditHistoryPopover({ records }: { records: PostEditRecord[] }) {
  if (records.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label="View edit history"
        >
          <History className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-4 shadow-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Edit history
        </p>
        <div className="mt-2.5 max-h-72 space-y-3 overflow-y-auto overscroll-contain pr-1">
          {records.map((edit) => (
            <div
              key={edit.editedAt}
              className="rounded-xl border border-white/60 bg-white/40 p-2.5"
            >
              <p className="text-xs font-semibold">
                {edit.editorName}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  {formatDistanceToNow(new Date(edit.editedAt), {
                    addSuffix: true,
                  })}
                </span>
              </p>
              <p className="mt-0.5 truncate text-sm font-medium">{edit.title}</p>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {edit.body}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
