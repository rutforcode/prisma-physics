import { AppHeader } from "@/components/AppHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GlassFooter } from "@/components/GlassFooter";
import { PostCard, type PostItem } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { TOPICS } from "@/lib/topic-meta";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { MessagesSquare, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

function PostsSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass rounded-3xl p-6 md:p-7">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="mt-4 h-6 w-2/3 rounded-lg" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const posts = useQuery(api.posts.list, { topic: topic ?? undefined });
  const isLoading = posts === undefined;

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <AuroraBackground />
      <AppHeader active="community" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-10">
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <MessagesSquare className="size-3.5" />
            Community
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Ask, share, <span className="text-cobalt">explain</span>
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Post questions, notes, and mini-explanations for the rest of your
            physics cohort — attach a diagram whenever a sketch beats a
            paragraph.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <PostComposer />

          {/* Topic filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTopic(null)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                topic === null
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "glass-chip text-muted-foreground hover:text-foreground",
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              All posts
            </button>
            {TOPICS.map((t) => {
              const active = topic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(active ? null : t.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                    active
                      ? cn("shadow-sm", t.selected)
                      : "glass-chip text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="size-3.5" />
                  {t.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Posts */}
          {isLoading ? (
            <PostsSkeleton />
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-10 text-center"
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-indigo-500/20 text-primary">
                <MessagesSquare className="size-6" />
              </span>
              <h2 className="font-display mt-5 text-2xl font-semibold tracking-tight">
                No posts here yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Be the first to share a question or note in this topic — your
                classmates will thank you.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post as PostItem}
                  currentUserId={user?._id}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <GlassFooter />
    </div>
  );
}
