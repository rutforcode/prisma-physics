import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Heart, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router";

interface NotificationItem {
  _id: Id<"notifications">;
  type: "mention" | "like" | "promotion";
  read: boolean;
  postId: Id<"posts">;
  _creationTime: number;
  actorName: string;
  actorImage: string | null;
  postTitle: string;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const notifications = useQuery(api.notifications.list);
  const unread = useQuery(api.notifications.unreadCount);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  const unreadCount = unread ?? 0;
  const items = (notifications ?? []) as NotificationItem[];

  const handleOpen = (item: NotificationItem) => {
    if (!item.read) void markRead({ id: item._id });
    navigate(`/community?post=${item.postId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="glass-chip relative flex size-10 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[21rem] p-0"
        sideOffset={10}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="px-0 py-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="mx-0" />

        <div className="max-h-[24rem] overflow-y-auto">
          {notifications === undefined ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="size-9 rounded-full bg-accent" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-accent" />
                    <div className="h-2.5 w-1/2 rounded bg-accent" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-indigo-500/20 text-primary">
                <Bell className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">All quiet here</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Likes and @mentions will show up here.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const initial = item.actorName.charAt(0).toUpperCase();
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleOpen(item)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/50",
                    !item.read && "bg-primary/[0.06]",
                  )}
                >
                  {item.actorImage ? (
                    <img
                      src={item.actorImage}
                      alt=""
                      className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white/70"
                    />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-xs font-bold text-primary ring-2 ring-white/70">
                      {initial}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug">
                      <span className="font-semibold">{item.actorName}</span>{" "}
                      {item.type === "mention" ? (
                        <>
                          mentioned you in{" "}
                          <span className="font-medium text-primary">
                            “{item.postTitle}”
                          </span>
                        </>
                      ) : item.type === "promotion" ? (
                        <>
                          promoted your post{" "}
                          <span className="font-medium text-primary">
                            “{item.postTitle}”
                          </span>{" "}
                          to the feed
                        </>
                      ) : (
                        <>liked your post</>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {item.type === "mention" ? (
                        <MessageCircle className="size-3" />
                      ) : item.type === "promotion" ? (
                        <Star className="size-3 text-amber-500" />
                      ) : (
                        <Heart className="size-3" />
                      )}
                      {formatDistanceToNow(new Date(item._creationTime), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                  {!item.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
