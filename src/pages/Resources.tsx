import { AddResourceDialog } from "@/components/resources/AddResourceDialog";
import { AppHeader } from "@/components/AppHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GlassFooter } from "@/components/GlassFooter";
import { SortSelect } from "@/components/SortSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { difficultyMeta } from "@/lib/topic-meta";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  RESOURCE_CATEGORIES,
  RESOURCE_TOPICS,
  RESOURCES,
  SORT_OPTIONS,
  sortResources,
  type PhysicsResource,
  type ResourceCategory,
  type ResourceLevel,
  type ResourceSortKey,
  type ResourceTopic,
} from "@/lib/resources";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  FilterX,
  Globe2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "prism-saved-resources";

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

const BADGE_STYLES: Record<string, string> = {
  Recommended: "bg-amber-500/12 text-amber-800 border-amber-300/50",
  Free: "bg-emerald-500/12 text-emerald-800 border-emerald-300/50",
  "Open Source": "bg-teal-500/12 text-teal-800 border-teal-300/50",
  Interactive: "bg-sky-500/12 text-sky-800 border-sky-300/50",
  "Beginner Friendly": "bg-cyan-500/12 text-cyan-800 border-cyan-300/50",
  Advanced: "bg-violet-500/12 text-violet-800 border-violet-300/50",
  "University Level": "bg-indigo-500/12 text-indigo-800 border-indigo-300/50",
  Community: "bg-blue-500/12 text-blue-800 border-blue-300/50",
};

const fallbackBadgeStyle = "bg-slate-500/12 text-slate-700 border-slate-300/50";

function badgeStyle(badge: string) {
  return BADGE_STYLES[badge] ?? fallbackBadgeStyle;
}

function matchesSearch(r: PhysicsResource, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    r.name,
    r.description,
    r.category,
    r.source,
    r.domain,
    ...r.topics,
    ...r.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function Resources() {
  const { user: currentUser } = useAuth();
  const customResources = useQuery(api.resources.list);
  const canManage = useQuery(api.resources.canManage);
  const removeResource = useMutation(api.resources.remove);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | ResourceCategory>("All");
  const [topic, setTopic] = useState<"All" | ResourceTopic>("All");
  const [sort, setSort] = useState<ResourceSortKey>("recommended");
  const [view, setView] = useState<"all" | "saved">("all");
  const [savedIds, setSavedIds] = useState<string[]>(loadSaved);
  const [selected, setSelected] = useState<PhysicsResource | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      /* storage unavailable — bookmarks stay in-memory for the session */
    }
  }, [savedIds]);

  // Merge user-added resources (admin/curator contributions) with the curated
  // static library so filters, search, and sorting all see one combined list.
  const allResources = useMemo<PhysicsResource[]>(() => {
    const custom: PhysicsResource[] = (customResources ?? []).map((r) => ({
      id: `custom:${r._id}`,
      name: r.name,
      description: r.description,
      url: r.url,
      domain: r.domain,
      category: r.category as ResourceCategory,
      topics: r.topics as ResourceTopic[],
      levels: r.levels as ResourceLevel[],
      badges: r.badges,
      featured: r.featured,
      tags: [],
      source: r.source,
      addedAt: new Date(r._creationTime).toISOString().slice(0, 10),
      score: 70,
    }));
    return [...RESOURCES, ...custom];
  }, [customResources]);

  // Which custom resource belongs to which user (drives the delete button).
  const customOwners = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of customResources ?? []) map[`custom:${r._id}`] = r.addedBy;
    return map;
  }, [customResources]);

  const handleDelete = async (resId: string) => {
    if (!resId.startsWith("custom:")) return;
    const id = resId.slice("custom:".length) as Id<"customResources">;
    setRemoving(true);
    try {
      await removeResource({ id });
      toast("Resource removed from the library");
      setSelected(null);
    } catch (err) {
      toast("Could not remove the resource", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setRemoving(false);
    }
  };

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((x) => x !== id) : [...prev, id];
      toast(isSaved ? "Removed from saved resources" : "Saved to your resources", {
        description: isSaved ? undefined : "Find it under the Saved tab.",
        icon: isSaved ? <Bookmark className="size-4" /> : <BookmarkCheck className="size-4" />,
      });
      return next;
    });
  };

  const hasActiveFilters =
    query.trim() !== "" || category !== "All" || topic !== "All";

  const filtered = useMemo(() => {
    const base =
      view === "saved"
        ? allResources.filter((r) => savedIds.includes(r.id))
        : allResources;
    const list = base.filter(
      (r) =>
        matchesSearch(r, query) &&
        (category === "All" || r.category === category) &&
        (topic === "All" || r.topics.includes(topic)),
    );
    return sortResources(list, sort);
  }, [allResources, query, category, topic, sort, view, savedIds]);

  const featured = useMemo(
    () =>
      sortResources(
        allResources.filter((r) => r.featured),
        sort,
      ),
    [allResources, sort],
  );

  const showFeatured = view === "all" && !hasActiveFilters;

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setTopic("All");
  };

  const activeCount =
    (query.trim() !== "" ? 1 : 0) +
    (category !== "All" ? 1 : 0) +
    (topic !== "All" ? 1 : 0);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <AppHeader active="resources" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Curated for students
          </span>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-cobalt">Physics Resources</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explore curated tools, simulations, references, and learning
            resources to understand Physics beyond the textbook.
          </p>
        </div>

        {/* Search */}
        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Physics resources…"
            className="glass h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
          />
        </div>

        {/* View tabs */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {(
            [
              { id: "all", label: "All resources" },
              { id: "saved", label: `Saved (${savedIds.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                view === tab.id
                  ? "glass-chip text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {(["All", ...RESOURCE_CATEGORIES] as const).map((c) => {
            const active = category === c;
            const CatIcon = c === "All" ? undefined : CATEGORY_META[c].icon;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                    : "border-white/60 bg-white/40 text-muted-foreground hover:border-primary/30 hover:text-primary",
                )}
              >
                {CatIcon && <CatIcon className="size-3.5" />}
                {c}
              </button>
            );
          })}
        </div>

        {/* Topic + sort toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Topic
            </span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as "All" | ResourceTopic)}
              className="glass-chip h-9 max-w-[15rem] cursor-pointer rounded-xl border-0 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="All">All topics</option>
              {RESOURCE_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {topic !== "All" && (
              <button
                onClick={() => setTopic("All")}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {topic} ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <FilterX className="size-3.5" />
                Clear filters ({activeCount})
              </button>
            )}
            {canManage === true && (
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="size-4" />
                Add resource
              </Button>
            )}
            <SortSelect
              value={sort}
              onChange={(v) => setSort(v as ResourceSortKey)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Featured */}
        {showFeatured && (
          <section className="mt-10">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Featured Resources
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {featured.map((r) => (
                <FeaturedCard
                  key={r.id}
                  resource={r}
                  saved={savedIds.includes(r.id)}
                  onToggleSave={() => toggleSaved(r.id)}
                  onOpen={() => setSelected(r)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Grid heading */}
        <div className="mt-10 flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {view === "saved" ? "Saved Resources" : "All Resources"}
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          <span className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
          </span>
        </div>

        {/* Grid / empty state */}
        {filtered.length === 0 ? (
          <div className="glass mt-4 flex flex-col items-center rounded-3xl px-6 py-16 text-center">
            <span className="glass-chip flex size-14 items-center justify-center rounded-2xl text-muted-foreground">
              <Search className="size-6" />
            </span>
            <h3 className="mt-4 text-base font-semibold">No resources found</h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {view === "saved"
                ? "You haven't saved any resources yet. Tap the bookmark icon on any resource to keep it here."
                : "Try another search term or remove some filters."}
            </p>
            {view === "saved" && savedIds.length === 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => setView("all")}
              >
                Browse all resources
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="mt-5" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                saved={savedIds.includes(r.id)}
                onToggleSave={() => toggleSaved(r.id)}
                onOpen={() => setSelected(r)}
              />
            ))}
          </motion.div>
        )}
      </main>

      <GlassFooter />

      {/* Detail dialog */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="glass-strong max-w-lg rounded-3xl border-white/60 sm:max-w-xl">
          {selected && (
            <ResourceDetail
              resource={selected}
              saved={savedIds.includes(selected.id)}
              onToggleSave={() => toggleSaved(selected.id)}
              canDelete={
                selected.id.startsWith("custom:") &&
                currentUser !== null &&
                currentUser !== undefined &&
                (currentUser.role === "admin" ||
                  customOwners[selected.id] === currentUser._id)
              }
              onDelete={() => handleDelete(selected.id)}
              deleting={removing}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add resource dialog (admins & curators) */}
      <AddResourceDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function ResourceCard({
  resource: r,
  saved,
  onToggleSave,
  onOpen,
}: {
  resource: PhysicsResource;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[r.category];
  const Icon = meta.icon;
  const level = difficultyMeta(r.levels[0]);
  const primaryTopic = r.topics[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass glass-hover group flex cursor-pointer flex-col rounded-2xl p-5"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
              meta.chip,
            )}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
              {r.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Globe2 className="size-3 shrink-0" />
              <span className="truncate">{r.domain}</span>
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={saved ? "Remove from saved" : "Save resource"}
          className={cn(
            "shrink-0 rounded-lg p-1.5 transition-all",
            saved
              ? "text-primary"
              : "text-muted-foreground hover:bg-white/60 hover:text-primary",
          )}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        </button>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {r.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="rounded-full border-white/60 bg-white/50 text-[11px] font-medium text-muted-foreground">
          {r.category}
        </Badge>
        {primaryTopic && (
          <Badge variant="outline" className="rounded-full border-white/60 bg-white/50 text-[11px] font-medium text-muted-foreground">
            {primaryTopic}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn("rounded-full border text-[11px] font-medium", level.badge)}
        >
          {level.label}
        </Badge>
      </div>

      {r.badges.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {r.badges.slice(0, 3).map((b) => (
            <span
              key={b}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                badgeStyle(b),
              )}
            >
              {b === "Recommended" && <Star className="mr-0.5 inline size-2.5 fill-current" />}
              {b}
            </span>
          ))}
          {r.badges.length > 3 && (
            <span className="rounded-full border border-white/60 bg-white/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{r.badges.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          {r.source}
        </span>
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
        >
          Open Resource
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </motion.article>
  );
}

function FeaturedCard({
  resource: r,
  saved,
  onToggleSave,
  onOpen,
}: {
  resource: PhysicsResource;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[r.category];
  const Icon = meta.icon;
  const level = difficultyMeta(r.levels[0]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass glass-hover group flex cursor-pointer flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-start"
      onClick={onOpen}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
          meta.chip,
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
              {r.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Globe2 className="size-3 shrink-0" />
              {r.domain}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            aria-label={saved ? "Remove from saved" : "Save resource"}
            className={cn(
              "shrink-0 rounded-lg p-1.5 transition-all",
              saved ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {r.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className="rounded-full border-amber-300/60 bg-amber-500/10 text-[11px] font-semibold text-amber-700"
          >
            <Star className="mr-1 size-3 fill-current" /> Featured
          </Badge>
          <Badge variant="outline" className="rounded-full border-white/60 bg-white/50 text-[11px] font-medium text-muted-foreground">
            {r.category}
          </Badge>
          {r.topics.slice(0, 2).map((t) => (
            <Badge key={t} variant="outline" className="rounded-full border-white/60 bg-white/50 text-[11px] font-medium text-muted-foreground">
              {t}
            </Badge>
          ))}
          <Badge variant="outline" className={cn("rounded-full border text-[11px] font-medium", level.badge)}>
            {level.label}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{r.source}</span>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            Open Resource
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function ResourceDetail({
  resource: r,
  saved,
  onToggleSave,
  canDelete = false,
  onDelete,
  deleting = false,
}: {
  resource: PhysicsResource;
  saved: boolean;
  onToggleSave: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = CATEGORY_META[r.category];
  const Icon = meta.icon;
  const level = difficultyMeta(r.levels[0]);

  return (
    <DialogHeader>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
            meta.chip,
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <DialogTitle className="text-lg">{r.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-xs">
            <Globe2 className="size-3" />
            {r.domain}
          </DialogDescription>
        </div>
        <button
          onClick={onToggleSave}
          className={cn(
            "ml-auto shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
            saved
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-white/60 bg-white/50 text-muted-foreground hover:text-primary",
          )}
        >
          {saved ? (
            <span className="flex items-center gap-1.5">
              <BookmarkCheck className="size-3.5" /> Saved
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Bookmark className="size-3.5" /> Save
            </span>
          )}
        </button>
      </div>

      <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
        {r.description}
      </p>

      <div className="mt-3 space-y-3 text-sm">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Topics
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {r.topics.map((t) => (
              <Badge key={t} variant="outline" className="rounded-full border-white/60 bg-white/50 text-[11px] font-medium text-muted-foreground">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Level
            </h4>
            <p className={cn("mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", level.badge)}>
              {level.label}
              {r.levels.length > 1 && ` +${r.levels.length - 1}`}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Provided by
            </h4>
            <p className="mt-1 text-sm text-foreground">{r.source}</p>
          </div>
        </div>
        {r.badges.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Features
            </h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {r.badges.map((b) => (
                <span
                  key={b}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    badgeStyle(b),
                  )}
                >
                  {b === "Recommended" && <Star className="mr-1 inline size-2.5 fill-current" />}
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {canDelete && onDelete && (
        <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[11px] font-medium text-destructive/80">
            This resource was added by a curator — you can remove it.
          </p>
          <Button
            size="sm"
            variant={confirmDelete ? "destructive" : "outline"}
            className="mt-2.5 rounded-xl"
            disabled={deleting}
            onClick={() => {
              if (confirmDelete) {
                onDelete();
                setConfirmDelete(false);
              } else {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 4000);
              }
            }}
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {confirmDelete ? "Click again to confirm" : "Remove resource"}
          </Button>
        </div>
      )}

      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
      >
        Open External Resource
        <ExternalLink className="size-4" />
      </a>
      <p className="text-center text-[11px] text-muted-foreground">
        ↗ This opens an external website — it is not hosted by Prism.
      </p>
    </DialogHeader>
  );
}
