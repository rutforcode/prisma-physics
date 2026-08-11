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
import { motion } from "framer-motion";
import { Heart, Pencil, Star, Trash2 } from "lucide-react";
import { Link } from "react-router";

export interface MentionRef {
  userId: string;
  name: string;
}

export interface PostItem extends Doc<"posts"> {
  authorName: string;
  authorImage: string | null;
  images: Id<"_storage">[];
  imageUrls: (string | null)[];
  mentionedUsers: MentionRef[];
}

export function PostCard({
  post,
  currentUserId,
  highlighted = false,
  canPromote = false,
  canDelete = false,
  canEdit = false,
  onEdit,
}: {
  post: PostItem;
  currentUserId: Id<"users"> | null | undefined;
  highlighted?: boolean;
  canPromote?: boolean;
  /** Admin moderation: allow deleting posts the user did not author. */
  canDelete?: boolean;
  /** Allow the author (or an admin) to open this post in the composer. */
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  const toggleLike = useMutation(api.posts.toggleLike);
  const removePost = useMutation(api.posts.remove);
  const setPromoted = useMutation(api.posts.setPromoted);

  const isPromoted = post.promotedAt !== undefined;

  const liked = currentUserId !== undefined && currentUserId !== null
    ? post.likedBy.includes(currentUserId)
    : false;
  const isOwn = currentUserId !== undefined && currentUserId !== null
    ? post.authorId === currentUserId
    : false;
  const topic = post.topic ? topicMeta(post.topic) : null;
  const mentionMap = Object.fromEntries(
    post.mentionedUsers.map((m) => [m.name, m.userId]),
  );

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
      {/* Author row */}
      <div className="flex items-center gap-3">
        <Link
          to={`/profile?user=${post.authorId}`}
          className="group/author flex min-w-0 items-center gap-3"
        >
          {post.authorImage ? (
            <img
              src={post.authorImage}
              alt={post.authorName}
              className="size-10 shrink-0 rounded-full object-cover ring-2 ring-white/70 transition-transform group-hover/author:scale-105"
            />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-xs font-bold text-primary ring-2 ring-white/70">
              {initials || "S"}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold transition-colors group-hover/author:text-primary">
              {post.authorName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post._creationTime), {
                addSuffix: true,
              })}
              {post.editedAt && <span> · edited</span>}
            </p>
          </div>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isPromoted && (
            <Badge
              variant="outline"
              className="rounded-full border-amber-300/60 bg-amber-500/10 text-amber-700"
            >
              <Star className="size-3 fill-amber-500" />
              Promoted
            </Badge>
          )}
          {topic && (
            <Badge
              variant="outline"
              className={cn("rounded-full border bg-gradient-to-r", topic.chip)}
            >
              <topic.icon className="size-3" />
              {topic.label}
            </Badge>
          )}
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Edit post"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {(isOwn || canDelete) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete post"
                >
                  <Trash2 className="size-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the post and any attached image for everyone.
                    This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void removePost({ postId: post._id })}
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

      {/* Content */}
      <h3 className="font-display mt-4 text-xl font-semibold leading-snug tracking-tight">
        {post.title}
      </h3>
      <MixedBody
        text={post.body}
        imageUrls={post.imageUrls}
        mentionMap={mentionMap}
        className="mt-2 text-[15px] leading-relaxed text-foreground/85"
      />

      {/* Actions */}
      <div className="mt-5 flex items-center border-t border-white/60 pt-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={() => void toggleLike({ postId: post._id })}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
            liked
              ? "bg-rose-500/10 text-rose-500"
              : "text-muted-foreground hover:bg-white/50 hover:text-rose-500",
          )}
        >
          <Heart
            className={cn("size-4 transition-transform", liked && "fill-rose-500")}
          />
          {post.likedBy.length > 0 ? (
            <span>{post.likedBy.length} like{post.likedBy.length === 1 ? "" : "s"}</span>
          ) : (
            <span>Like</span>
          )}
        </motion.button>

        {canPromote && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            onClick={() =>
              void setPromoted({ postId: post._id, promoted: !isPromoted })
            }
            aria-label={isPromoted ? "Remove from feed" : "Promote to feed"}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
              isPromoted
                ? "bg-amber-500/10 text-amber-600"
                : "text-muted-foreground hover:bg-white/50 hover:text-amber-600",
            )}
          >
            <Star
              className={cn("size-4 transition-transform", isPromoted && "fill-amber-500")}
            />
            {isPromoted ? "Promoted" : "Promote"}
          </motion.button>
        )}
      </div>
    </article>
  );
}
