import { MixedBody } from "@/components/feed/MixedBody";
import type { PostItem } from "@/components/feed/PostCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ImportError,
  parseWordFile,
  type ImportResult,
  type ImportWarning,
} from "@/lib/docx-import";
import { MAX_BODY_CHARS, countNonFormulaChars } from "@/lib/math-count";
import { DIFFICULTIES, TOPICS, type DifficultyId, type TopicId } from "@/lib/topic-meta";
import { cn } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Stage = "pick" | "parsing" | "edit";

interface DraftImage {
  /** data URL (new imports) or resolved storage URL (existing drafts) */
  dataUrl: string;
  /** present when the image already lives in Convex storage */
  storageId?: Id<"_storage">;
}

interface DraftState {
  fileName: string;
  title: string;
  body: string;
  topic: TopicId | "";
  difficulty: DifficultyId | "";
  description: string;
  tags: string[];
  images: DraftImage[];
  stats: ImportResult["stats"] | null;
  warnings: ImportWarning[];
  /** original .docx (kept with the post) */
  sourceFile?: File;
  sourceStorageId?: Id<"_storage">;
  importedFrom?: string;
}

const emptyDraft = (fileName: string): DraftState => ({
  fileName,
  title: "",
  body: "",
  topic: "",
  difficulty: "",
  description: "",
  tags: [],
  images: [],
  stats: null,
  warnings: [],
});

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  );
}

function findDuplicates(posts: PostItem[], title: string): PostItem[] {
  const titleWords = tokenize(title);
  if (titleWords.size === 0) return [];
  return posts
    .filter((p) => {
      if (p.title.toLowerCase() === title.toLowerCase()) return true;
      const words = tokenize(p.title);
      if (words.size === 0) return false;
      let overlap = 0;
      for (const w of words) if (titleWords.has(w)) overlap++;
      return overlap / Math.min(words.size, titleWords.size) >= 0.6;
    })
    .slice(0, 3);
}

export function WordImportDialog({
  open,
  onOpenChange,
  existingPosts,
  initialDraft,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** published posts used for duplicate detection */
  existingPosts: PostItem[];
  /** a saved draft to continue editing (from the drafts list) */
  initialDraft?: PostItem | null;
  onDone?: (postId: string) => void;
}) {
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const enhancePost = useAction(api.ai.enhancePost);

  const [stage, setStage] = useState<Stage>("pick");
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [duplicates, setDuplicates] = useState<PostItem[] | null>(null);
  const [showAi, setShowAi] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiWants, setAiWants] = useState({
    summary: true,
    description: true,
    tags: true,
    topics: true,
    prerequisites: false,
    takeaways: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset when the dialog opens, or when a draft is picked for editing.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setDuplicates(null);
    setTab("edit");
    setShowAi(false);
    if (initialDraft) {
      setDraft({
        fileName: initialDraft.importedFrom ?? "draft.docx",
        title: initialDraft.title,
        body: initialDraft.body,
        topic: (initialDraft.topic as TopicId | undefined) ?? "",
        difficulty: (initialDraft.difficulty as DifficultyId | undefined) ?? "",
        description: initialDraft.description ?? "",
        tags: initialDraft.tags ?? [],
        images: (initialDraft.images ?? []).map((id, i) => ({
          dataUrl: initialDraft.imageUrls?.[i] ?? "",
          storageId: id as Id<"_storage">,
        })),
        stats: null,
        warnings: [],
        sourceStorageId: initialDraft.sourceDocument as Id<"_storage"> | undefined,
        importedFrom: initialDraft.importedFrom ?? undefined,
      });
      setStage("edit");
    } else {
      setDraft(null);
      setStage("pick");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDraft]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setStage("parsing");
    try {
      const result = await parseWordFile(file);
      setDraft({
        fileName: result.fileName,
        title: result.title,
        body: result.body,
        topic: (result.topicGuess as TopicId | null) ?? "",
        difficulty: result.difficultyGuess ?? "",
        description: "",
        tags: [],
        images: result.images.map((img) => ({ dataUrl: img.dataUrl })),
        stats: result.stats,
        warnings: result.warnings,
        sourceFile: file,
      });
      setStage("edit");
    } catch (err) {
      setError(
        err instanceof ImportError
          ? err.message
          : "Unable to process this document. The Word file appears to be corrupted or unsupported.",
      );
      setStage("pick");
    }
  };

  const uploadBlob = async (
    blob: Blob,
    fallbackType = "application/octet-stream",
  ): Promise<Id<"_storage">> => {
    const uploadUrl = await generateUploadUrl();
    const upload = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type || fallbackType },
      body: blob,
    });
    if (!upload.ok) throw new Error("Upload failed — please try again.");
    const { storageId } = (await upload.json()) as { storageId: Id<"_storage"> };
    return storageId;
  };

  const doSave = async (status: "draft" | "published") => {
    if (!draft) return;
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) {
      setError("Give the post a title and some content before saving.");
      setTab("edit");
      return;
    }
    if (countNonFormulaChars(body) > MAX_BODY_CHARS) {
      setError(
        `The content is over the ${MAX_BODY_CHARS.toLocaleString()} character limit (formulas don't count) — trim it in the editor first.`,
      );
      setTab("edit");
      return;
    }

    setSaving(status);
    setError(null);
    try {
      // Upload images that aren't in storage yet.
      const imageIds: Id<"_storage">[] = [];
      for (const img of draft.images) {
        if (img.storageId) {
          imageIds.push(img.storageId);
        } else if (img.dataUrl) {
          imageIds.push(await uploadBlob(dataUrlToBlob(img.dataUrl)));
        }
      }

      // Keep the original Word document with the post.
      let sourceStorageId = draft.sourceStorageId;
      if (draft.sourceFile) {
        sourceStorageId = await uploadBlob(draft.sourceFile, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }

      const tags = [...new Set(draft.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
      if (draft.difficulty) tags.push(`difficulty:${draft.difficulty}`);

      let postId: string;
      if (initialDraft) {
        await updatePost({
          postId: initialDraft._id,
          title,
          body,
          topic: draft.topic || undefined,
          images: imageIds,
          status,
          tags,
          description: draft.description || undefined,
          difficulty: draft.difficulty || undefined,
          sourceDocument: sourceStorageId,
          importedFrom: draft.fileName,
        });
        postId = initialDraft._id;
      } else {
        postId = await createPost({
          title,
          body,
          topic: draft.topic || undefined,
          images: imageIds,
          status,
          tags,
          description: draft.description || undefined,
          difficulty: draft.difficulty || undefined,
          sourceDocument: sourceStorageId,
          importedFrom: draft.fileName,
        });
      }

      toast(
        status === "published"
          ? "Post published to Community"
          : "Draft saved — you can keep editing later",
        {
          description: status === "published" ? "It's live for your classmates." : undefined,
          icon: <CheckCircle2 className="size-4" />,
        },
      );
      onDone?.(postId);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while saving.");
    } finally {
      setSaving(null);
    }
  };

  const save = (status: "draft" | "published") => {
    if (!draft) return;
    if (status === "published") {
      const dupes = findDuplicates(existingPosts, draft.title.trim());
      if (dupes.length > 0) {
        setDuplicates(dupes);
        return;
      }
    }
    void doSave(status);
  };

  const runAiEnhance = async () => {
    if (!draft) return;
    const wants = aiWants;
    if (!Object.values(wants).some(Boolean)) {
      toast("Pick at least one enhancement");
      return;
    }
    setAiBusy(true);
    try {
      const result = await enhancePost({
        title: draft.title || draft.fileName.replace(/\.docx$/i, ""),
        body: draft.body,
        wants,
      });
      setDraft((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (wants.description && result.description) {
          next.description = result.description;
        }
        if (wants.tags && result.tags && result.tags.length > 0) {
          next.tags = [...new Set([...prev.tags, ...result.tags])].slice(0, 12);
        }
        if (wants.topics && result.topic) {
          const match = TOPICS.find((t) => t.id === result.topic);
          if (match) next.topic = match.id as TopicId;
        }

        // Summary / prerequisites / takeaways live in the body as note blocks
        // the author can edit or delete — AI never silently rewrites content.
        const insert: string[] = [];
        if (wants.summary && result.summary) {
          insert.push(`> **Summary:** ${result.summary}`);
        }
        if (wants.prerequisites && result.prerequisites && result.prerequisites.length > 0) {
          insert.push(`> **Prerequisites:** ${result.prerequisites.join(", ")}`);
        }
        if (wants.takeaways && result.takeaways && result.takeaways.length > 0) {
          insert.push(
            `> **Key takeaways:**\n${result.takeaways.map((t) => `> - ${t}`).join("\n")}`,
          );
        }
        if (insert.length > 0) {
          next.body = [insert.join("\n\n"), next.body.trim()].filter(Boolean).join("\n\n");
        }
        return next;
      });
      toast("AI suggestions added — review and edit them in the editor", {
        icon: <Sparkles className="size-4" />,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI enhancement failed — try again in a moment.",
      );
    } finally {
      setAiBusy(false);
    }
  };

  const chars = useMemo(
    () => (draft ? countNonFormulaChars(draft.body) : 0),
    [draft],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-white/60 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="glass-chip flex size-8 items-center justify-center rounded-lg text-primary">
              <FileText className="size-4" />
            </span>
            {initialDraft ? "Continue editing draft" : "Create Post from Word"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Upload a <code className="rounded bg-white/60 px-1 font-mono text-xs">.docx</code>{" "}
            file and Prism converts it into a structured Physics post — you
            review everything before publishing.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="mt-2 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
                dragOver
                  ? "border-primary/60 bg-primary/5"
                  : "border-primary/25 bg-white/30 hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <span className="glass-chip flex size-14 items-center justify-center rounded-2xl text-primary">
                <UploadCloud className="size-7" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">
                Drag &amp; drop your Word file here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">or</p>
              <Button variant="outline" size="sm" className="mt-3">
                Browse files
              </Button>
              <p className="mt-4 text-[11px] text-muted-foreground">
                Supported: <code className="font-mono">.docx</code> · up to 25 MB · no
                macros are ever executed
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                void handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {error && (
              <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <p className="font-semibold">Unable to process this document</p>
                <p className="mt-0.5">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setError(null)}
                >
                  Try Another File
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === "parsing" && (
          <div className="flex flex-col items-center gap-4 py-14">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Reading your document — extracting headings, equations, images…
            </p>
          </div>
        )}

        {stage === "edit" && draft && (
          <div className="mt-2 space-y-5">
            {/* Imported-from + status */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-muted-foreground">
                <FileText className="size-3.5" />
                Imported from: {draft.fileName}
              </span>
              {initialDraft ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-800">
                  <Pencil className="size-3.5" />
                  Draft
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-800">
                  <Pencil className="size-3.5" />
                  Draft — not published yet
                </span>
              )}
            </div>

            {/* Import summary */}
            {draft.stats && (
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <SummaryChip ok label={`${draft.stats.sections} sections`} />
                <SummaryChip ok label={`${draft.stats.paragraphs} paragraphs`} />
                <SummaryChip ok label={`${draft.stats.images} images`} />
                <SummaryChip ok label={`${draft.stats.equations} equations`} />
                <SummaryChip ok label={`${draft.stats.tables} tables`} />
                <SummaryChip ok label={`${draft.stats.lists} list items`} />
              </div>
            )}

            {/* Needs review */}
            {draft.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="size-3.5" />
                  Needs review ({draft.warnings.length})
                </p>
                <ul className="mt-1.5 space-y-1">
                  {draft.warnings.slice(0, 6).map((w, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                      <span className="text-amber-500">⚠</span>
                      {w.message}
                    </li>
                  ))}
                  {draft.warnings.length > 6 && (
                    <li className="text-xs text-muted-foreground">
                      …and {draft.warnings.length - 6} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Edit | Preview tabs */}
            <div className="flex items-center gap-2">
              <div className="glass-chip flex items-center gap-1 rounded-xl p-1">
                {(
                  [
                    { id: "edit", label: "Edit", icon: Pencil },
                    { id: "preview", label: "Preview", icon: Eye },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      tab === t.id
                        ? "bg-white/80 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <t.icon className="size-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
              <span
                className={cn(
                  "ml-auto text-xs font-medium tabular-nums",
                  chars > MAX_BODY_CHARS
                    ? "text-destructive"
                    : chars > MAX_BODY_CHARS * 0.9
                      ? "text-amber-600"
                      : "text-muted-foreground",
                )}
              >
                {chars.toLocaleString()} / {MAX_BODY_CHARS.toLocaleString()} chars
              </span>
            </div>

            {tab === "edit" ? (
              <div className="space-y-4">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Post title"
                  maxLength={120}
                  className="h-11 w-full rounded-xl border border-white/70 bg-white/50 px-4 text-sm font-semibold text-foreground outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Physics topic
                    </span>
                    <select
                      value={draft.topic}
                      onChange={(e) =>
                        setDraft({ ...draft, topic: e.target.value as TopicId | "" })
                      }
                      className="h-9 w-full rounded-xl border border-white/70 bg-white/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">No topic</option>
                      {TOPICS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Level
                    </span>
                    <select
                      value={draft.difficulty}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          difficulty: e.target.value as DifficultyId | "",
                        })
                      }
                      className="h-9 w-full rounded-xl border border-white/70 bg-white/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Not set</option>
                      {DIFFICULTIES.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </span>
                  <input
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="One line describing what this post covers"
                    maxLength={160}
                    className="h-10 w-full rounded-xl border border-white/70 bg-white/50 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags (comma separated)
                  </span>
                  <input
                    value={draft.tags.join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="newton, forces, exam-notes"
                    className="h-10 w-full rounded-xl border border-white/70 bg-white/50 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
                  />
                </label>

                <textarea
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder="Post content — headings, lists, tables, $math$ and [img:N] markers…"
                  className="h-72 w-full resize-y rounded-xl border border-white/70 bg-white/50 px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-all placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
                />

                {draft.images.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Images ({draft.images.length}) — placed with [img:N] markers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {draft.images.map((img, i) => (
                        <div key={i} className="group relative">
                          <img
                            src={img.dataUrl}
                            alt={`Imported image ${i + 1}`}
                            className="size-16 rounded-lg object-cover ring-1 ring-white/70"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                images: draft.images.filter((_, j) => j !== i),
                              })
                            }
                            aria-label={`Remove image ${i + 1}`}
                            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow transition-transform hover:scale-110"
                          >
                            <X className="size-3" />
                          </button>
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-black/60 px-1 text-[9px] font-semibold text-white">
                            [{i}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI enhance */}
                <div className="rounded-xl border border-violet-300/40 bg-violet-500/5 px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => setShowAi((v) => !v)}
                    className="flex w-full items-center gap-2 text-left text-sm font-semibold text-violet-800"
                  >
                    <Wand2 className="size-4" />
                    Enhance with AI (optional)
                    <span className={cn("ml-auto transition-transform", showAi && "rotate-180")}>
                      ▾
                    </span>
                  </button>
                  {showAi && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Generates study metadata from the extracted text — it never
                        rewrites your content. Everything it adds is editable and
                        rejectable.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                        {(
                          [
                            ["summary", "Summary"],
                            ["description", "Description"],
                            ["tags", "Tags"],
                            ["topics", "Detect topic"],
                            ["prerequisites", "Prerequisites"],
                            ["takeaways", "Key takeaways"],
                          ] as const
                        ).map(([key, label]) => (
                          <label
                            key={key}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/60 bg-white/40 px-2.5 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={aiWants[key]}
                              onChange={(e) =>
                                setAiWants((w) => ({ ...w, [key]: e.target.checked }))
                              }
                              className="size-3.5 accent-violet-600"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => void runAiEnhance()}
                        disabled={aiBusy}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {aiBusy ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="mr-1.5 size-3.5" />
                        )}
                        Generate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass max-h-96 overflow-y-auto rounded-2xl p-5">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {draft.title || "Untitled post"}
                </h3>
                {draft.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{draft.description}</p>
                )}
                <div className="mt-3">
                  <MixedBody
                    text={draft.body}
                    imageUrls={draft.images.map((i) => i.dataUrl)}
                  />
                </div>
              </div>
            )}

            {/* Duplicate warning */}
            {duplicates && duplicates.length > 0 && (
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="size-3.5" />
                  Possible duplicate
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A similar post already exists in Prisma.
                </p>
                <div className="mt-2 space-y-1">
                  {duplicates.map((d) => (
                    <p key={d._id} className="text-xs text-foreground/80">
                      • {d.title}
                    </p>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDone?.(duplicates[0]._id);
                      onOpenChange(false);
                    }}
                  >
                    View existing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDuplicates(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDuplicates(null);
                      void doSave("published");
                    }}
                  >
                    Continue anyway
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/50 pt-4">
              <Button
                variant="outline"
                onClick={() => void save("draft")}
                disabled={saving !== null}
              >
                {saving === "draft" ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <BookOpen className="mr-1.5 size-3.5" />
                )}
                Save Draft
              </Button>
              <Button onClick={() => void save("published")} disabled={saving !== null}>
                {saving === "published" ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="mr-1.5 size-3.5" />
                )}
                Publish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium",
        ok
          ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-800"
          : "border-amber-300/50 bg-amber-500/10 text-amber-800",
      )}
    >
      {ok ? <Check className="size-3" /> : <AlertTriangle className="size-3" />}
      {label}
    </span>
  );
}
