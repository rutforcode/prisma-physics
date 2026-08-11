import { AppHeader } from "@/components/AppHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GlassFooter } from "@/components/GlassFooter";
import { AdminManager } from "@/components/feed/AdminManager";
import { CuratorManager } from "@/components/feed/CuratorManager";
import {
  FeedPostCard,
  type FeedPostItem,
} from "@/components/feed/FeedPostCard";
import { PostCard, type PostItem } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Crown,
  Lock,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-4">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/30 to-indigo-500/20 text-primary">
        <Icon className="size-4" />
      </span>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-12 rounded-md" />
      ) : (
        <p className="font-display mt-3 text-2xl font-semibold tracking-tight">
          {value}
        </p>
      )}
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Admin-gated queries are skipped entirely for non-admins
  const stats = useQuery(api.users.stats, isAdmin ? {} : "skip");
  const posts = useQuery(api.posts.list, {});
  const feedPosts = useQuery(api.feedPosts.list);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col text-foreground">
        <AuroraBackground />
        <AppHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-24">
          <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-indigo-500/20 text-primary">
              <Lock className="size-6" />
            </span>
            <h1 className="font-display mt-5 text-2xl font-semibold tracking-tight">
              Admins only
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This overview is restricted to administrators. If you believe
              this is a mistake, contact your class admin.
            </p>
          </div>
        </main>
        <GlassFooter />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Students", value: stats?.users ?? 0 },
    { icon: Crown, label: "Curators", value: stats?.curators ?? 0 },
    { icon: ShieldCheck, label: "Admins", value: stats?.admins ?? 0 },
    { icon: MessageSquare, label: "Community posts", value: stats?.posts ?? 0 },
    { icon: Megaphone, label: "Feed posts", value: stats?.feedPosts ?? 0 },
    { icon: Star, label: "Promoted", value: stats?.promoted ?? 0 },
  ];

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <AuroraBackground />
      <AppHeader active="feed" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="size-3.5" />
              Admin
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage who posts to the feed and moderate community activity.
            </p>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              loading={stats === undefined}
            />
          ))}
        </motion.div>

        {/* Curators + feed announcements / Community moderation */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <AdminManager currentUserId={user?._id} />
            <CuratorManager currentUserId={user?._id} />

            {/* Feed announcements */}
            <section>
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-primary" />
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Feed announcements
                </h2>
                <span className="glass-chip rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                  {stats?.feedPosts ?? "…"}
                </span>
              </div>
              <div className="mt-4 max-h-[34rem] space-y-5 overflow-y-auto overscroll-contain pr-1">
                {feedPosts === undefined ? (
                  <div className="space-y-5">
                    {[0, 1].map((i) => (
                      <div key={i} className="glass rounded-3xl p-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32 rounded-md" />
                            <Skeleton className="h-3 w-20 rounded-md" />
                          </div>
                        </div>
                        <Skeleton className="mt-4 h-5 w-2/3 rounded-lg" />
                        <Skeleton className="mt-3 h-4 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : feedPosts.length === 0 ? (
                  <p className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
                    No announcements yet.
                  </p>
                ) : (
                  (feedPosts as FeedPostItem[])
                    .slice(0, 6)
                    .map((post) => (
                      <FeedPostCard key={post._id} post={post} canDelete />
                    ))
                )}
              </div>
            </section>
          </div>

          {/* Community moderation */}
          <section className="lg:col-span-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Community posts
              </h2>
              <span className="glass-chip rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                {stats?.posts ?? "…"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Moderators can delete any post and promote high-quality ones to
              the feed.
            </p>
            <div className="mt-4 space-y-5">
              {posts === undefined ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="glass rounded-3xl p-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28 rounded-md" />
                          <Skeleton className="h-3 w-16 rounded-md" />
                        </div>
                      </div>
                      <Skeleton className="mt-4 h-5 w-3/4 rounded-lg" />
                      <Skeleton className="mt-3 h-4 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (posts as PostItem[]).length === 0 ? (
                <p className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
                  No community posts yet.
                </p>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {(posts as PostItem[])
                    .slice(0, 10)
                    .map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUserId={user?._id}
                        canPromote={isAdmin}
                        canDelete={isAdmin}
                      />
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <GlassFooter />
    </div>
  );
}
