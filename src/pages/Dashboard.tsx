import { AuroraBackground } from "@/components/AuroraBackground";
import { ConceptCard } from "@/components/feed/ConceptCard";
import { ConceptReader } from "@/components/feed/ConceptReader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { DIFFICULTIES, TOPICS, type DifficultyId } from "@/lib/topic-meta";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Atom,
  BookOpen,
  ChevronDown,
  LogOut,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

function Header({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
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
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="glass-chip flex size-9 items-center justify-center rounded-xl text-primary transition-transform group-hover:scale-105">
            <Atom className="size-5" />
          </span>
          <span className="font-display hidden text-lg font-semibold tracking-tight sm:block">
            Prism
          </span>
        </Link>

        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search concepts, formulas, tags…"
            className="h-10 w-full rounded-xl border border-white/70 bg-white/45 pl-10 pr-4 text-sm text-foreground shadow-inner outline-none transition-all placeholder:text-muted-foreground/80 focus:border-primary/40 focus:bg-white/70 focus:ring-[3px] focus:ring-primary/15"
          />
        </div>

        <div className="flex items-center gap-2">
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

function FeedSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-6 w-3/4 rounded-lg" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-md" />
          <Skeleton className="mt-6 h-8 w-2/3 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyId | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const concepts = useQuery(api.concepts.list, {
    topic: topic ?? undefined,
    difficulty: difficulty ?? undefined,
    search: debouncedSearch || undefined,
  });
  const topicCounts = useQuery(api.concepts.topics);
  const seed = useMutation(api.concepts.seed);
  const seededRef = useRef(false);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Seed the concepts table once on first load
  useEffect(() => {
    if (
      !seededRef.current &&
      concepts !== undefined &&
      concepts.length === 0 &&
      topicCounts !== undefined &&
      topicCounts.length === 0
    ) {
      seededRef.current = true;
      void seed();
    }
  }, [concepts, topicCounts, seed]);

  const isLoading = concepts === undefined;
  const selected = selectedSlug
    ? (concepts?.find((c) => c.slug === selectedSlug) ?? null)
    : null;
  const selectedIndex = selected && concepts ? concepts.indexOf(selected) : -1;
  const prev = selectedIndex > 0 && concepts ? concepts[selectedIndex - 1] : undefined;
  const next =
    selectedIndex >= 0 && concepts && selectedIndex < concepts.length - 1
      ? concepts[selectedIndex + 1]
      : undefined;

  const openConcept = (slug: string) => {
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="min-h-screen text-foreground">
      <AuroraBackground />
      <Header search={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        {/* Mobile search */}
        <div className="relative mb-8 md:hidden">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search concepts, formulas, tags…"
            className="glass h-11 w-full rounded-xl pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/80 focus:border-primary/40"
          />
        </div>

        {/* Page heading */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              {selected ? "Reading" : "Your study feed"}
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {selected ? (
                "Focus mode"
              ) : (
                <>
                  The Physics Feed
                  {firstName && <span className="text-cobalt">, {firstName}</span>}
                </>
              )}
            </h1>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            {isLoading
              ? "Loading concepts…"
              : `${concepts.length} concept${concepts.length === 1 ? "" : "s"} · ${topicCounts?.length ?? 0} topics`}
          </p>
        </div>

        {!selected && (
          <>
            {/* Topic chips */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
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
                All topics
              </button>
              {TOPICS.map((t) => {
                const count = topicCounts?.find((c) => c.topic === t.id)?.count ?? 0;
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
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[11px] font-semibold",
                        active ? "bg-white/60" : "bg-white/50 text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Difficulty filter */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Level
              </span>
              {[
                { id: null, label: "All levels" },
                ...DIFFICULTIES.map((d) => ({ id: d.id, label: d.label })),
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    difficulty === d.id
                      ? "bg-foreground/90 text-background"
                      : "glass-chip text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {selected && selected !== null ? (
              <ConceptReader
                key={selected.slug}
                concept={selected}
                onBack={() => setSelectedSlug(null)}
                onNavigate={openConcept}
                prev={prev}
                next={next}
              />
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FeedSkeleton />
              </motion.div>
            ) : concepts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass mx-auto max-w-xl rounded-3xl p-10 text-center"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-indigo-500/20 text-primary">
                  <Search className="size-6" />
                </span>
                <h2 className="font-display mt-5 text-2xl font-semibold tracking-tight">
                  Nothing matches that
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Try a different topic, level, or search term — the feed has
                  concepts across mechanics, electromagnetism, thermodynamics,
                  waves, quantum, and relativity.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setTopic(null);
                    setDifficulty(null);
                  }}
                  className="glass-chip mt-6 rounded-xl px-4 py-2 text-sm font-medium text-primary transition-transform hover:-translate-y-0.5"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${topic ?? "all"}-${difficulty ?? "all"}-${debouncedSearch}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {concepts.map((concept) => (
                  <ConceptCard
                    key={concept._id}
                    concept={concept}
                    onOpen={openConcept}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
