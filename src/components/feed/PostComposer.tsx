import { MathKeyboard } from "@/components/MathKeyboard";
import { MixedBody } from "@/components/feed/MixedBody";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  MAX_BODY_CHARS,
  MAX_IMAGES,
  countFormulas,
  countNonFormulaChars,
} from "@/lib/math-count";
import { cn } from "@/lib/utils";
import { TOPICS, type TopicId } from "@/lib/topic-meta";
import { useMutation, useQuery } from "convex/react";
import {
  AtSign,
  Eye,
  ImagePlus,
  Loader2,
  Send,
  Sigma,
  TextCursorInput,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function PostComposer() {
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<TopicId | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // @mention suggestion state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(0);
  const [caretPos, setCaretPos] = useState(0);
  const suggestions = useQuery(api.users.search, { query: mentionQuery });

  // On-screen math keyboard visibility
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Object URL lifecycle for image previews
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Live character budget — formulas and [img:N] markers don't count.
  const { chars, formulas } = useMemo(
    () => ({
      chars: countNonFormulaChars(body),
      formulas: countFormulas(body),
    }),
    [body],
  );
  const overLimit = chars > MAX_BODY_CHARS;
  const nearLimit = chars >= MAX_BODY_CHARS * 0.9;
  const imageCount = files.length;

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []);
    setError(null);
    const valid = chosen.filter((f) => f.type.startsWith("image/"));
    if (valid.length < chosen.length) {
      setError("Please choose image files (PNG, JPG, GIF…).");
    }
    const room = MAX_IMAGES - imageCount;
    setFiles((prev) => [...prev, ...valid].slice(0, room));
    if (e.target) e.target.value = "";
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce the budget: block edits that push the (non-formula) count
    // over the limit, but always allow deletions to make room.
    if (countNonFormulaChars(value) > MAX_BODY_CHARS && value.length > body.length) {
      return;
    }
    setBody(value);
    const caret = e.target.selectionStart ?? value.length;
    setCaretPos(caret);

    // Open the mention picker when the caret sits right after an @token
    const before = value.slice(0, caret);
    const match = before.match(/(?:^|\s)@([A-Za-z0-9._]*)$/);
    if (match) {
      setMentionOpen(true);
      setMentionQuery(match[1]);
      setMentionStart(caret - match[1].length - 1);
    } else {
      setMentionOpen(false);
    }
  };

  // Live preview shows once the post contains LaTeX math ($...$, $$...$$, \(...\))
  const hasMath =
    body.includes("$") || body.includes("\\(") || body.includes("\\[");

  /**
   * Insert a LaTeX token from the math keyboard at the caret. `{}` pairs act
   * as placeholders: a selection is wrapped by the first pair, otherwise the
   * caret lands inside it.
   */
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
    } else if (selected.length > 0) {
      // Plain symbols replace the selection (calculator-style)
      caretOffset = insert.length;
    }

    const next = body.slice(0, start) + insert + body.slice(end);
    setBody(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + caretOffset;
      el.setSelectionRange(pos, pos);
      setCaretPos(pos);
    });
  };

  /** Embed an image at the caret with an [img:N] marker. */
  const insertImageMarker = (idx: number) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? caretPos;
    const end = el.selectionEnd ?? start;
    const marker = `[img:${idx}]`;
    const next = body.slice(0, start) + marker + body.slice(end);
    setBody(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + marker.length;
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
      const pos = from;
      el.setSelectionRange(pos, pos);
      setCaretPos(pos);
    });
  };

  const insertMention = (name: string) => {
    const next =
      body.slice(0, mentionStart) + "@" + name + " " + body.slice(caretPos);
    setBody(next);
    setMentionOpen(false);
    setMentionQuery("");
    requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (el) {
        el.focus();
        const pos = mentionStart + name.length + 2;
        el.setSelectionRange(pos, pos);
        setCaretPos(pos);
      }
    });
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
        if (!upload.ok) {
          throw new Error("Upload failed — please try again.");
        }
        const { storageId } = (await upload.json()) as {
          storageId: Id<"_storage">;
        };
        storageIds.push(storageId);
      }

      await createPost({
        title: title.trim(),
        body: body.trim(),
        topic,
        images: storageIds,
      });

      setTitle("");
      setBody("");
      setTopic(undefined);
      setFiles([]);
      setMentionOpen(false);
      setMentionQuery("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Post error:", err);
      setError(err instanceof Error ? err.message : "Could not publish your post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 md:p-7">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400/30 to-indigo-500/20 text-primary">
          <Send className="size-4" />
        </span>
        Share with your classmates
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — e.g. 'Can someone explain Lenz's law?'"
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
            if (e.key === "Escape") {
              setMentionOpen(false);
              setKeyboardOpen(false);
            }
          }}
          placeholder="What would you like to discuss? Wrap formulas in $...$, or type @ to mention a classmate."
          rows={3}
          className="w-full resize-none rounded-xl border border-white/70 bg-white/50 px-4 py-3 text-sm leading-relaxed shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
        />

        {mentionOpen && (
          <div className="glass-strong absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl p-1.5 shadow-xl">
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mention a classmate
            </p>
            {suggestions === undefined ? (
              <div className="px-2.5 py-3 text-sm text-muted-foreground">
                Searching…
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-2.5 py-3 text-sm text-muted-foreground">
                No classmates match “{mentionQuery}”
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto">
                {suggestions.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertMention(user.name)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/60"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/30 text-[11px] font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {user.name}
                      </span>
                      {user.email && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </span>
                    <AtSign className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(hasMath || imageCount > 0) && (
        <div className="mt-3 rounded-xl border border-primary/15 bg-gradient-to-br from-sky-400/[0.07] via-white/40 to-indigo-400/[0.07] p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Eye className="size-3.5" />
            Live preview
          </p>
          <div className="mt-2.5">
            {title.trim() && (
              <h4 className="font-display text-lg font-semibold leading-snug tracking-tight">
                {title}
              </h4>
            )}
            <MixedBody
              text={body}
              imageUrls={filePreviews}
              className="mt-1 text-sm leading-relaxed text-foreground/85"
            />
          </div>
        </div>
      )}

      {imageCount > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
              <button
                type="button"
                onClick={() => insertImageMarker(i)}
                className="absolute bottom-1.5 left-1.5 flex h-6 items-center gap-1 rounded-full bg-white/85 px-2 text-[11px] font-medium text-foreground opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100"
                title="Place this image in the text at the cursor"
              >
                <TextCursorInput className="size-3.5" />
                Inline
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
            id="post-image-input"
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
            Attach images
          </Button>
          {imageCount > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {imageCount}/{MAX_IMAGES} images
            </span>
          )}

          <Select
            value={topic}
            onValueChange={(v) => setTopic(v === "none" ? undefined : (v as TopicId))}
          >
            <SelectTrigger
              size="sm"
              className={cn("glass-chip h-8 w-36 border-0 text-xs", !topic && "text-muted-foreground")}
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
          disabled={!title.trim() || !body.trim() || isSubmitting}
          className="rounded-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Publishing…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Publish post
            </>
          )}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}
