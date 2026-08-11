import { NotificationBell } from "@/components/feed/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Atom, ChevronDown, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";

const NAV_ITEMS = [
  { id: "feed", label: "Feed", to: "/dashboard" },
  { id: "community", label: "Community", to: "/community" },
  { id: "resources", label: "Resources", to: "/resources" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

export function AppHeader({
  active,
  search,
  onSearchChange,
}: {
  active?: NavId;
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-4 z-40 px-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl py-2.5 pl-4 pr-2.5">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="glass-chip flex size-9 items-center justify-center rounded-xl text-primary transition-transform group-hover:scale-105">
              <Atom className="size-5" />
            </span>
            <span className="font-display hidden text-lg font-semibold tracking-tight sm:block">
              Prism
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active === item.id
                    ? "bg-white/60 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/40 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {onSearchChange && (
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search concepts, formulas, tags…"
              className="h-10 w-full rounded-xl border border-white/70 bg-white/45 pl-10 pr-4 text-sm text-foreground shadow-inner outline-none transition-all placeholder:text-muted-foreground/80 focus:border-primary/40 focus:bg-white/70 focus:ring-[3px] focus:ring-primary/15"
            />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger className="glass-chip flex items-center gap-2 rounded-xl px-2 py-1.5 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-xs font-bold text-primary">
              {initial}
            </span>
            <span className="hidden max-w-[9rem] truncate text-sm font-medium sm:block">
              {user?.name ?? user?.email ?? "Student"}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              {user?.name ?? "Signed in"}
              {user?.email && (
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer"
            >
              <UserRound className="mr-2 size-4" />
              Your profile
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem
                onClick={() => navigate("/admin")}
                className="cursor-pointer"
              >
                <ShieldCheck className="mr-2 size-4" />
                Admin overview
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
