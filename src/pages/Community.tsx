import { AppHeader } from "@/components/AppHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GlassFooter } from "@/components/GlassFooter";
import { SortSelect } from "@/components/SortSelect";
import { PostCard, type PostItem } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { TOPICS } from "@/lib/topic-meta";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { WordImportDialog } from "@/components/feed/WordImportDialog";
import { Button } from "@/components/ui/button";
import { FileText, MessagesSquare, PencilLine, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

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
  const isAdmin = user?.role === "admin";
  const [topic, setTopic] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest" | "likes">("newest");
  const [searchParams, setSearchParams] = useSearchParams();
  const postParam = searchParams.get("post");
  const editParam = searchParams.get("edit");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importDraft, setImportDraft] = useState<PostItem | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const posts = useQuery(api.posts.list, {
    topic: topic ?? undefined,
    sort,
  });
  const drafts = useQuery(api.posts.list, { drafts: true, sort: "newest" });
  const myDrafts = drafts ?? [];
  const isLoading = posts === undefined;

  // Deep link from a notification: reveal the topic filter, scroll to the
  // post, flash a highlight ring, then clean the URL.
  useEffect(() => {
    if (!postParam) return;
    setTopic(null);
    const scrollTimer = setTimeout(() => {
      document
        .getElementById(postParam)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(postParam);
    }, 250);
    const clearTimer = setTimeout(() => setHighlightId(null), 3400);
    const urlTimer = setTimeout(
      () => setSearchParams({}, { replace: true }),
      1500,
    );
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
      clearTimeout(urlTimer);
    };
  }, [postParam, setSearchParams]);

  // Deep link to edit (?edit=POST_ID, e.g. from a profile page): clear any
  // topic filter, open the post in the composer, scroll the composer into
  // view, then clean the URL once the post is visible.
  useEffect(() => {
    if (!editParam || posts === undefined) return;
    if (topic !== null) {
      setTopic(null);
      return;
    }
    const target = posts.find((p) => p._id === editParam);
    if (!target) return;
    setEditingPost(target as PostItem);
    const scrollTimer = setTimeout(() => {
      document
        .getElementById("post-composer")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightId(editParam);
    }, 250);
    const clearTimer = setTimeout(() => setHighlightId(null), 3400);
    const urlTimer = setTimeout(
      () => setSearchParams({}, { replace: true }),
      1500,
    );
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
      clearTimeout(urlTimer);
    };
  }, [editParam, posts, topic, setSearchParams]);

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
          <div id="post-composer" className="scroll-mt-24">
            {/* Create Post action: write manually or import from Word */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Create Post
              </span>
              <div className="flex flex-wrap gap-2">
                {myDrafts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDrafts((v) => !v)}
                    className="border-amber-300/60 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 hover:text-amber-900"
                  >
                    {showDrafts ? "Hide drafts" : `My drafts (${myDrafts.length})`}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document
                      .getElementById("post-composer")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  <PencilLine className="mr-1.5 size-3.5" />
                  Write manually
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setImportDraft(null);
                    setImportOpen(true);
                  }}
                >
                  <FileText className="mr-1.5 size-3.5" />
                  Import from Word
                </Button>
              </div>
            </div>

            {showDrafts && myDrafts.length > 0 && (
              <div className="mb-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your drafts — finish them anytime
                </p>
                {myDrafts.map((d) => (
                  <div
                    key={d._id}
                    className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {d.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          Draft
                        </span>
                        {d.importedFrom
                          ? `Imported from ${d.importedFrom}`
                          : `Saved ${new Date(d._creationTime).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setImportDraft(d as PostItem);
                        setShowDrafts(false);
                        setImportOpen(true);
                      }}
                    >
                      Continue editing
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <PostComposer
              key={editingPost?._id ?? "new"}
              initialPost={editingPost}
              onCancel={() => setEditingPost(null)}
            />
          </div>

          {/* Topic filter + sort */}
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

            <SortSelect
              className="ml-auto"
              value={sort}
              onChange={(v) => setSort(v as "newest" | "oldest" | "likes")}
              options={[
                { value: "newest", label: "Newest" },
                { value: "likes", label: "Most liked" },
                { value: "oldest", label: "Oldest" },
              ]}
            />
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
                  highlighted={highlightId === post._id}
                  canPromote={isAdmin}
                  canEdit={user?._id === post.authorId || isAdmin}
                  onEdit={() => {
                    setEditingPost(post as PostItem);
                    document
                      .getElementById("post-composer")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <GlassFooter />

      <WordImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        existingPosts={(posts ?? []) as PostItem[]}
        initialDraft={importDraft}
        onDone={(postId) => setSearchParams({ post: postId })}
      />
    </div>
  );
}
