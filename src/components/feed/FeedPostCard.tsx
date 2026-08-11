import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { MixedBody } from "@/components/feed/MixedBody";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { topicMeta } from "@/lib/topic-meta";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Atom, Pencil, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface FeedPostItem extends Doc<"feedPosts"> {
  authorName: string;
  authorImage: string | null;
  isTeamPost: boolean;
  images: Id<"_storage">[];
  imageUrls: (string | null)[];
}

export function FeedPostCard({
  post,
  canDelete,
  canEdit,
  onEdit,
  highlighted = false,
}: {
  post: FeedPostItem;
  canDelete: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
  /** Flash ring when deep-linked to this post (e.g. ?post=ID). */
  highlighted?: boolean;
}) {
  const removePost = useMutation(api.feedPosts.remove);
  const topic = post.topic ? topicMeta(post.topic) : null;

  const sharePost = async () => {
    const url = `${window.location.origin}/dashboard?post=${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied", {
        description: "Share it with your classmates.",
      });
    } catch {
      toast("Couldn't copy the link", {
        description: url,
      });
    }
  };
  const initials = post.authorName
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      id={post._id}
      className={cn(
        "glass rounded-3xl p-6 transition-shadow hover:shadow-lg md:p-7",
        highlighted && "ring-2 ring-primary/60",
      )}
    >
      <div className="flex items-center gap-3">
        {post.isTeamPost ? (
          <span className="glass-chip flex size-10 shrink-0 items-center justify-center rounded-full text-primary ring-2 ring-white/70">
            <Atom className="size-5" />
          </span>
        ) : post.authorImage ? (
          <img
            src={post.authorImage}
            alt={post.authorName}
            className="size-10 shrink-0 rounded-full object-cover ring-2 ring-white/70"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-xs font-bold text-primary ring-2 ring-white/70">
            {initials || "P"}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post._creationTime), {
              addSuffix: true,
            })}
            {post.editedAt && <span> · edited</span>}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {topic && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border bg-gradient-to-r",
                topic.chip,
              )}
            >
              <topic.icon className="size-3" />
              {topic.label}
            </Badge>
          )}
          <button
            type="button"
            onClick={() => void sharePost()}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Copy link to this announcement"
          >
            <Share2 className="size-4" />
          </button>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Edit feed post"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete feed post"
                >
                  <Trash2 className="size-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the announcement from the feed for everyone.
                    This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void removePost({ id: post._id })}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <h3 className="font-display mt-4 text-xl font-semibold leading-snug tracking-tight">
        {post.title}
      </h3>
      <MixedBody
        text={post.body}
        imageUrls={post.imageUrls}
        className="mt-2 text-[15px] leading-relaxed text-foreground/85"
      />
    </article>
  );
}
