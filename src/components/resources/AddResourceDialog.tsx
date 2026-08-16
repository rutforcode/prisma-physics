import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";

/** A customResources row as the list query returns it (name resolved). */
export type CustomResourceRow = Omit<Doc<"customResources" >, "addedByName"> & {
  addedByName: string | null;
};

import {
  RESOURCE_CATEGORIES,
  RESOURCE_TOPICS,
  type ResourceCategory,
  type ResourceLevel,
  type ResourceTopic,
} from "@/lib/resources";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "convex/react";
import { Check, Link2, Loader2, Pencil, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const LEVEL_OPTIONS: { value: ResourceLevel; label: string }[] = [
  { value: "intro", label: "Intro" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const BADGE_OPTIONS = [
  "Recommended",
  "Free",
  "Open Source",
  "Interactive",
  "Beginner Friendly",
  "University Level",
  "Community",
];

const inputCls =
  "h-10 w-full rounded-xl border border-white/70 bg-white/50 px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15";

/** Turn free text into a usable http(s) URL; throws with a friendly message. */
function normalizeUrl(raw: string): { url: string; domain: string } {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Add the resource's web address.");
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Use an http(s) link to the resource.");
  }
  if (!parsed.hostname.includes(".")) {
    throw new Error("That doesn't look like a real web address.");
  }
  return {
    url: parsed.toString(),
    domain: parsed.hostname.replace(/^www\./, ""),
  };
}

export function AddResourceDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this resource instead of creating one. */
  editing?: CustomResourceRow | null;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const addResource = useMutation(api.resources.create);
  const updateResource = useMutation(api.resources.update);

  // The parent mounts this dialog per edit target (key = resource id), so
  // initializing from props here always reflects the resource being edited.
  const [name, setName] = useState(editing?.name ?? "");
  const [url, setUrl] = useState(editing?.url ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [category, setCategory] = useState<ResourceCategory | "">(
    (editing?.category as ResourceCategory) ?? "",
  );
  const [topics, setTopics] = useState<ResourceTopic[]>(
    (editing?.topics as ResourceTopic[]) ?? [],
  );
  const [level, setLevel] = useState<ResourceLevel | "">(
    (editing?.levels[0] as ResourceLevel) ?? "",
  );
  const [source, setSource] = useState(editing?.source ?? "");
  const [badges, setBadges] = useState<string[]>(editing?.badges ?? []);
  const [featured, setFeatured] = useState(editing?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = editing !== null && editing !== undefined;

  const toggleTopic = (t: ResourceTopic) =>
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const toggleBadge = (b: string) =>
    setBadges((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );

  const canSubmit =
    name.trim() !== "" &&
    url.trim() !== "" &&
    description.trim() !== "" &&
    category !== "" &&
    topics.length > 0 &&
    level !== "" &&
    source.trim() !== "" &&
    !submitting;

  const submit = async () => {
    setError(null);
    let urlInfo: { url: string; domain: string };
    try {
      urlInfo = normalizeUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid URL.");
      return;
    }
    setSubmitting(true);
    try {
      const fields = {
        name: name.trim(),
        url: urlInfo.url,
        domain: urlInfo.domain,
        description: description.trim(),
        category: category as ResourceCategory,
        topics,
        levels: [level as ResourceLevel],
        badges,
        source: source.trim(),
      };
      if (editing) {
        await updateResource({
          id: editing._id,
          ...fields,
          // Only admins may change the featured flag.
          ...(isAdmin ? { featured } : {}),
        });
        toast("Resource updated", {
          description: `${name.trim()} has been updated in the library.`,
          icon: <Check className="size-4" />,
        });
      } else {
        await addResource({ ...fields, featured });
        toast("Resource added to the library", {
          description: `${name.trim()} is now listed for your classmates.`,
          icon: <Check className="size-4" />,
        });
      }
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const urlPreview = useMemo(() => {
    if (!url.trim()) return null;
    try {
      return normalizeUrl(url).domain;
    } catch {
      return null;
    }
  }, [url]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onOpenChange(false);
        else onOpenChange(true);
      }}
    >
      <DialogContent className="glass-strong max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border-white/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="glass-chip flex size-8 items-center justify-center rounded-lg text-primary">
              {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            </span>
            {isEdit ? "Edit resource" : "Add a resource"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit
              ? "Fix the details and they update in the library for every student."
              : "Share a tool, course, or reference you vouch for — it appears in the library for every student."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tracker — video analysis software"
              maxLength={80}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Web address
            </span>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="physlets.org or https://…"
                className={cn(inputCls, "pl-10")}
              />
            </div>
            {urlPreview && (
              <span className="mt-1 inline-block text-[11px] text-muted-foreground">
                → <span className="font-medium text-primary">{urlPreview}</span>
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One or two sentences: what it is and why it helps."
              maxLength={300}
              rows={2}
              className="h-auto w-full resize-none rounded-xl border border-white/70 bg-white/50 px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory | "")}
                className={cn(inputCls, "cursor-pointer")}
              >
                <option value="">Choose…</option>
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Level
              </span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ResourceLevel | "")}
                className={cn(inputCls, "cursor-pointer")}
              >
                <option value="">Choose…</option>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Topics <span className="normal-case text-muted-foreground/70">(up to 4)</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_TOPICS.map((t) => {
                const active = topics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (active || topics.length < 4) toggleTopic(t);
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-white/60 bg-white/40 text-muted-foreground hover:border-primary/30 hover:text-primary",
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Provided by
            </span>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="University, organization, or creator"
              maxLength={80}
              className={inputCls}
            />
          </label>

          <div>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Feature badges <span className="normal-case text-muted-foreground/70">(optional)</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map((b) => {
                const active = badges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                      active
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-700"
                        : "border-white/60 bg-white/40 text-muted-foreground hover:border-emerald-400/40 hover:text-emerald-700",
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-amber-300/40 bg-amber-500/5 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                Feature in the spotlight strip
              </span>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </label>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/50 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEdit ? (
                <Check className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {isEdit ? "Save changes" : "Add to library"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
