import type { FeedPostItem } from "@/components/feed/FeedPostCard";
import { MathKeyboard } from "@/components/MathKeyboard";
import { MathText } from "@/components/MathJax";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  MAX_BODY_CHARS,
  MAX_IMAGES,
  countFormulas,
  countNonFormulaChars,
} from "@/lib/math-count";
import { TOPICS, type TopicId } from "@/lib/topic-meta";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import {
  ImagePlus,
  Loader2,
  Megaphone,
  Pencil,
  Send,
  Sigma,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function FeedPostComposer({
  initialPost,
  onCancel,
}: {
  initialPost?: FeedPostItem | null;
  onCancel?: () => void;
} = {}) {
  const isEditing = initialPost != null;

  const createPost = useMutation(api.feedPosts.create);
  const updatePost = useMutation(api.feedPosts.update);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [topic, setTopic] = useState<TopicId | undefined>(
    initialPost?.topic ?? undefined,
  );
  const [existingImages, setExistingImages] = useState<
    { id: Id<"_storage">; url: string | null }[]
  >(() =>
    (initialPost?.images ?? []).map((id, i) => ({
      id,
      url: initialPost?.imageUrls[i] ?? null,
    })),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [caretPos, setCaretPos] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Live character budget — formulas don't count.
  const { chars, formulas } = useMemo(
    () => ({
      chars: countNonFormulaChars(body),
      formulas: countFormulas(body),
    }),
    [body],
  );
  const overLimit = chars > MAX_BODY_CHARS;
  const nearLimit = chars >= MAX_BODY_CHARS * 0.9;
  const imageCount = existingImages.length + files.length;

  const hasMath =
    body.includes("$") || body.includes("\\(") || body.includes("\\[");

  const insertTex = (tex: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? caretPos;
    const end = el.selectionEnd ?? start;
    const selected = body.slice(start, end);

    let insert = tex;
    let caretOffset = insert.length;
    const braceIndex = insert.indexOf("{}");
    if (braceIndex !== -1) {
      if (selected.length > 0) {
        insert =
          insert.slice(0, braceIndex) +
          "{" +
          selected +
          "}" +
          insert.slice(braceIndex + 2);
        caretOffset = braceIndex + selected.length + 2;
      } else {
        caretOffset = braceIndex + 1;
      }
    }

    const next = body.slice(0, start) + insert + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + caretOffset;
      el.setSelectionRange(pos, pos);
      setCaretPos(pos);
    });
  };

  const handleMathBackspace = () => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? caretPos;
    const end = el.selectionEnd ?? start;
    if (start === end && start === 0) return;
    const from = start === end ? start - 1 : start;
    const next = body.slice(0, from) + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(from, from);
      setCaretPos(from);
    });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce the budget: block edits that push the (non-formula) count
    // over the limit, but always allow deletions to make room.
    if (countNonFormulaChars(value) > MAX_BODY_CHARS && value.length > body.length) {
      return;
    }
    setBody(value);
    setCaretPos(e.target.selectionStart ?? value.length);
  };

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []);
    setError(null);
    const valid = chosen.filter((f) => f.type.startsWith("image/"));
    if (valid.length < chosen.length) {
      setError("Please choose image files (PNG, JPG…).");
    }
    const room = MAX_IMAGES - imageCount;
    setFiles((prev) => [...prev, ...valid].slice(0, room));
    if (e.target) e.target.value = "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim() || isSubmitting || overLimit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // Upload any newly attached images.
      const storageIds: Id<"_storage">[] = [];
      for (const f of files) {
        const uploadUrl = await generateUploadUrl();
        const upload = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": f.type },
          body: f,
        });
        if (!upload.ok) throw new Error("Upload failed — please try again.");
        const { storageId } = (await upload.json()) as {
          storageId: Id<"_storage">;
        };
        storageIds.push(storageId);
      }
      const images = [
        ...existingImages.map((img) => img.id),
        ...storageIds,
      ];

      if (isEditing && initialPost) {
        await updatePost({
          id: initialPost._id,
          title: title.trim(),
          body: body.trim(),
          topic,
          images,
        });
        onCancel?.();
      } else {
        await createPost({
          title: title.trim(),
          body: body.trim(),
          topic,
          images,
        });
        setTitle("");
        setBody("");
        setTopic(undefined);
        setFiles([]);
        setExistingImages([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      setKeyboardOpen(false);
    } catch (err) {
      console.error("Feed post error:", err);
      setError(
        err instanceof Error ? err.message : "Could not publish your post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-3xl border-primary/20 p-6 md:p-7"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400/30 to-indigo-500/20 text-primary">
          {isEditing ? (
            <Pencil className="size-4" />
          ) : (
            <Megaphone className="size-4" />
          )}
        </span>
        {isEditing ? "Edit announcement" : "Share an announcement"}
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            aria-label="Cancel editing"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — e.g. 'Mock exam next Tuesday'"
        maxLength={120}
        className="mt-4 h-11 w-full rounded-xl border border-white/70 bg-white/50 px-4 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Body
        </span>
        <span
          className={cn(
            "text-xs tabular-nums",
            overLimit
              ? "font-semibold text-destructive"
              : nearLimit
                ? "text-amber-600"
                : "text-muted-foreground",
          )}
        >
          {chars.toLocaleString()} / {MAX_BODY_CHARS.toLocaleString()}
          {formulas > 0 && (
            <span className="text-muted-foreground">
              {" "}
              · {formulas} formula{formulas === 1 ? "" : "s"} not counted
            </span>
          )}
        </span>
      </div>

      <div className="relative mt-1.5">
        <textarea
          ref={bodyRef}
          value={body}
          onChange={handleBodyChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") setKeyboardOpen(false);
          }}
          placeholder="Announcements, study tips, reminders… Wrap formulas in $...$."
          rows={4}
          className="w-full resize-none rounded-xl border border-white/70 bg-white/50 px-4 py-3 text-sm leading-relaxed shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
        />
        {overLimit && (
          <p className="mt-1 text-xs text-destructive">
            Over the {MAX_BODY_CHARS.toLocaleString()}-character limit —
            delete some text or move more into $...$ formulas.
          </p>
        )}
      </div>

      {hasMath && (
        <div className="mt-3 rounded-xl border border-primary/15 bg-gradient-to-br from-sky-400/[0.07] via-white/40 to-indigo-400/[0.07] p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <span>Live preview</span>
          </p>
          <div className="mt-2.5">
            {title.trim() && (
              <h4 className="font-display text-lg font-semibold leading-snug tracking-tight">
                {title}
              </h4>
            )}
            <MathText className="mt-1 block whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
              {body}
            </MathText>
          </div>
        </div>
      )}

      {imageCount > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-video overflow-hidden rounded-xl ring-1 ring-white/70"
            >
              <img
                src={img.url ?? undefined}
                alt="Attachment"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setExistingImages((prev) =>
                    prev.filter((x) => x.id !== img.id),
                  )
                }
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/80 text-foreground shadow backdrop-blur transition-colors hover:bg-white"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {files.map((f, i) => (
            <div
              key={i}
              className="group relative aspect-video overflow-hidden rounded-xl ring-1 ring-white/70"
            >
              <img
                src={filePreviews[i]}
                alt={f.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/80 text-foreground shadow backdrop-blur transition-colors hover:bg-white"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={keyboardOpen} onOpenChange={setKeyboardOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "glass-chip border-0",
                  keyboardOpen && "bg-primary/10 text-primary",
                )}
              >
                <Sigma className="size-4" />
                Insert math
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              sideOffset={8}
              className="w-[23rem] max-w-[calc(100vw-2rem)] rounded-2xl p-3 shadow-xl"
            >
              <MathKeyboard
                onInsert={insertTex}
                onBackspace={handleMathBackspace}
                onClose={() => setKeyboardOpen(false)}
              />
            </PopoverContent>
          </Popover>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFilesChosen}
            id="feed-post-image-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-chip border-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageCount >= MAX_IMAGES}
          >
            <ImagePlus className="size-4" />
            {isEditing ? "Add image" : "Attach image"}
          </Button>
          {imageCount > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {imageCount}/{MAX_IMAGES} images
            </span>
          )}

          <Select
            value={topic}
            onValueChange={(v) =>
              setTopic(v === "none" ? undefined : (v as TopicId))
            }
          >
            <SelectTrigger
              size="sm"
              className={cn(
                "glass-chip h-8 w-36 border-0 text-xs",
                !topic && "text-muted-foreground",
              )}
            >
              <SelectValue placeholder="No topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No topic</SelectItem>
              {TOPICS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={
            !title.trim() || !body.trim() || isSubmitting || overLimit
          }
          className="rounded-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isEditing ? "Saving…" : "Publishing…"}
            </>
          ) : (
            <>
              <Send className="size-4" />
              {isEditing ? "Save changes" : "Publish"}
            </>
          )}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}
