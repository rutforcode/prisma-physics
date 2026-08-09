import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "convex/react";
import { Crown, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

/**
 * Admin-only control: pick which students can publish to the study feed
 * ("post curators"). Rendered on the Dashboard only for admins, so the
 * admin-gated `users.all` query never runs for regular students.
 */
export function CuratorManager({
  currentUserId,
}: {
  currentUserId?: Id<"users">;
}) {
  const users = useQuery(api.users.all);
  const setCurator = useMutation(api.feedPosts.setCurator);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Id<"users"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!users) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(q),
    );
  }, [users, query]);

  const curatorCount = users?.filter((u) => u.canPostFeed).length ?? 0;

  const toggle = async (userId: Id<"users">, canPostFeed: boolean) => {
    setPending(userId);
    setError(null);
    try {
      await setCurator({ userId, canPostFeed });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update curator.",
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="glass rounded-3xl border-primary/20 p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/30 to-orange-500/20 text-amber-700">
          <Crown className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Post curators
          </h3>
          <p className="text-xs text-muted-foreground">
            Choose who can publish to “From the team”. Curators can post
            announcements and remove their own.
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {curatorCount} curator{curatorCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          aria-label="Search students"
          className="h-9 w-full rounded-lg border border-white/70 bg-white/50 pl-8 pr-3 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
        />
      </div>

      <div className="mt-3">
        {filtered === undefined ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2.5 py-2">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No students match “{query}”.
          </p>
        ) : (
          <ul className="max-h-72 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
            {filtered.map((u) => {
              const isAdminUser = u.role === "admin";
              const isSelf = u._id === currentUserId;
              return (
                <li
                  key={u._id}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-xs font-bold text-primary">
                    {(u.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {u.name}
                      {isAdminUser && (
                        <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                      )}
                      {isSelf && (
                        <span className="text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                    {u.email && (
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    )}
                  </div>
                  {isAdminUser ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      Always
                    </span>
                  ) : (
                    <Switch
                      checked={u.canPostFeed}
                      disabled={pending === u._id}
                      onCheckedChange={(v) => toggle(u._id, v)}
                      aria-label={`Feed access for ${u.name}`}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
