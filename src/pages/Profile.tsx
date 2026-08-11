import { AppHeader } from "@/components/AppHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GlassFooter } from "@/components/GlassFooter";
import { PostCard, type PostItem } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AtSign,
  CalendarDays,
  Camera,
  FileText,
  Heart,
  Loader2,
  MessagesSquare,
  PencilLine,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

function AvatarEditor({
  image,
  initials,
}: {
  image: string | null;
  initials: string;
}) {
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG…).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Keep your photo under 5 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const upload = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("Upload failed — please try again.");
      const { storageId } = (await upload.json()) as { storageId: Id<"_storage"> };
      await updateProfileImage({ storageId });
    } catch (err) {
      console.error("Photo upload error:", err);
      setError(
        err instanceof Error ? err.message : "Could not update your photo.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile photo"
        className="group relative block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {image ? (
          <img
            src={image}
            alt="Profile photo"
            className="size-20 rounded-full object-cover shadow-lg ring-4 ring-white/80"
          />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-2xl font-bold text-primary shadow-lg ring-4 ring-white/80">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 group-disabled:opacity-100">
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Camera className="size-6" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && (
        <p className="absolute left-1/2 top-full mt-2 w-max max-w-[13rem] -translate-x-1/2 rounded-lg bg-white/90 px-2 py-1 text-center text-xs font-medium text-destructive shadow-md backdrop-blur">
          {error}
        </p>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-[2rem] p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Skeleton className="mx-auto h-7 w-48 rounded-lg sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-32 rounded-md sm:mx-0" />
          </div>
        </div>
      </div>
      <div className="glass rounded-3xl p-6">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: me } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramUser = searchParams.get("user");
  const isSelf = !paramUser || paramUser === me?._id;
  const profileId: Id<"users"> | undefined = paramUser
    ? (paramUser as Id<"users">)
    : me?._id;

  const profile = useQuery(
    api.users.getById,
    isSelf ? "skip" : { userId: paramUser as Id<"users"> },
  );
  const authored = useQuery(
    api.posts.byAuthor,
    profileId ? { userId: profileId } : "skip",
  );
  const mentions = useQuery(
    api.posts.mentionsOf,
    profileId ? { userId: profileId } : "skip",
  );
  const [tab, setTab] = useState<"posts" | "mentions">("posts");

  const name = isSelf
    ? (me?.name ?? me?.email?.split("@")[0] ?? "Student")
    : (profile?.name ?? "Student");
  const email = isSelf ? (me?.email ?? null) : null;
  const image = isSelf ? (me?.image ?? null) : (profile?.image ?? null);
  const createdAt = isSelf ? me?._creationTime : profile?.createdAt;
  const initials =
    name
      .split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";

  const authoredList = (authored ?? []) as PostItem[];
  const mentionsList = (mentions ?? []) as PostItem[];
  const likesReceived = authoredList.reduce(
    (sum, post) => sum + post.likedBy.length,
    0,
  );

  const headerLoading = isSelf ? me === undefined : profile === undefined;
  const contentLoading =
    profileId !== undefined && (authored === undefined || mentions === undefined);

  const activeList = tab === "posts" ? authoredList : mentionsList;

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <AuroraBackground />
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-10">
        {/* Profile header */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-strong relative overflow-hidden rounded-[2rem] p-8"
        >
          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-sky-300/30 blur-[90px]" />
          <div className="absolute -bottom-24 -left-16 size-56 rounded-full bg-indigo-300/25 blur-[90px]" />

          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            {headerLoading ? (
              <>
                <Skeleton className="size-20 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <Skeleton className="mx-auto h-7 w-48 rounded-lg sm:mx-0" />
                  <Skeleton className="mx-auto h-4 w-32 rounded-md sm:mx-0" />
                </div>
              </>
            ) : (
              <>
                {isSelf ? (
                  <AvatarEditor image={image} initials={initials} />
                ) : image ? (
                  <img
                    src={image}
                    alt={name}
                    className="size-20 shrink-0 rounded-full object-cover shadow-lg ring-4 ring-white/80"
                  />
                ) : (
                  <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-2xl font-bold text-primary shadow-lg ring-4 ring-white/80">
                    {initials}
                  </span>
                )}
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h1 className="font-display text-3xl font-semibold tracking-tight">
                    {name}
                  </h1>
                  <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                    {email && (
                      <span className="inline-flex items-center gap-1.5">
                        <MessagesSquare className="size-3.5" />
                        {email}
                      </span>
                    )}
                    {createdAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        Joined {format(new Date(createdAt), "MMMM yyyy")}
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}

            {/* Stats */}
            <div className="flex shrink-0 items-center gap-5">
              {[
                { icon: FileText, value: authoredList.length, label: "Posts" },
                { icon: AtSign, value: mentionsList.length, label: "Mentions" },
                { icon: Heart, value: likesReceived, label: "Likes" },
              ].map((stat) => (
                <div key={stat.label} className="glass-chip rounded-2xl px-4 py-3 text-center">
                  <stat.icon className="mx-auto size-4 text-primary" />
                  <p className="mt-1 text-xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Grouped tabs */}
        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
              tab === "posts"
                ? "bg-foreground/90 text-background shadow-sm"
                : "glass-chip text-muted-foreground hover:text-foreground",
            )}
          >
            <PencilLine className="size-3.5" />
            Posts
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] font-semibold",
                tab === "posts" ? "bg-white/25" : "bg-white/60 text-muted-foreground",
              )}
            >
              {authoredList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("mentions")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
              tab === "mentions"
                ? "bg-foreground/90 text-background shadow-sm"
                : "glass-chip text-muted-foreground hover:text-foreground",
            )}
          >
            <AtSign className="size-3.5" />
            Mentioned in
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] font-semibold",
                tab === "mentions" ? "bg-white/25" : "bg-white/60 text-muted-foreground",
              )}
            >
              {mentionsList.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-5">
          {contentLoading ? (
            <ProfileSkeleton />
          ) : activeList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-10 text-center"
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-indigo-500/20 text-primary">
                {tab === "posts" ? (
                  <PencilLine className="size-6" />
                ) : (
                  <AtSign className="size-6" />
                )}
              </span>
              <h2 className="font-display mt-5 text-2xl font-semibold tracking-tight">
                {tab === "posts" ? "No posts yet" : "No mentions yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {tab === "posts"
                  ? isSelf
                    ? "Your questions and notes will appear here. Share something in the community."
                    : "This student hasn't posted anything yet."
                  : isSelf
                    ? "When a classmate @mentions you in a post, it will show up here."
                    : "This student hasn't been mentioned in any posts yet."}
              </p>
              {isSelf && tab === "posts" && (
                <Link
                  to="/community"
                  className="glass-chip mt-6 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-primary transition-transform hover:-translate-y-0.5"
                >
                  Go to Community
                </Link>
              )}
            </motion.div>
          ) : (
            activeList.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={me?._id}
                canEdit={post.authorId === me?._id}
                onEdit={() => navigate(`/community?edit=${post._id}`)}
              />
            ))
          )}
        </div>
      </main>

      <GlassFooter />
    </div>
  );
}
