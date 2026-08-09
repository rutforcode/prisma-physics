import { MathKeyboard } from "@/components/MathKeyboard";
import { MathText } from "@/components/MathJax";
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
import { cn } from "@/lib/utils";
import { TOPICS, type TopicId } from "@/lib/topic-meta";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Megaphone, Send, Sigma, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function FeedPostComposer() {
  const createPost = useMutation(api.feedPosts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<TopicId | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [caretPos, setCaretPos] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      let imageStorageId: Id<"_storage"> | undefined;
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const upload = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!upload.ok) throw new Error("Upload failed — please try again.");
        const { storageId } = (await upload.json()) as {
          storageId: Id<"_storage">;
        };
        imageStorageId = storageId;
      }

      await createPost({
        title: title.trim(),
        body: body.trim(),
        topic,
        imageStorageId,
      });

      setTitle("");
      setBody("");
      setTopic(undefined);
      setFile(null);
      setKeyboardOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          <Megaphone className="size-4" />
        </span>
        Share an announcement
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — e.g. 'Mock exam next Tuesday'"
        maxLength={120}
        className="mt-4 h-11 w-full rounded-xl border border-white/70 bg-white/50 px-4 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
      />

      <div className="relative mt-3">
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setCaretPos(e.target.selectionStart ?? e.target.value.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setKeyboardOpen(false);
          }}
          placeholder="Announcements, study tips, reminders… Wrap formulas in $...$."
          rows={3}
          className="w-full resize-none rounded-xl border border-white/70 bg-white/50 px-4 py-3 text-sm leading-relaxed shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
        />
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

      {previewUrl && (
        <div className="relative mt-3 inline-block">
          <img
            src={previewUrl}
            alt="Attachment preview"
            className="h-44 w-full rounded-xl object-cover sm:w-72"
          />
          <button
            type="button"
            onClick={() => setFile(null)}
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/80 text-foreground shadow backdrop-blur transition-colors hover:bg-white"
            aria-label="Remove image"
          >
            <X className="size-4" />
          </button>
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
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!f.type.startsWith("image/")) {
                setError("Please choose an image file (PNG, JPG…).");
                return;
              }
              setError(null);
              setFile(f);
            }}
            id="feed-post-image-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-chip border-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            {file ? "Change image" : "Attach image"}
          </Button>

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
              Publish
            </>
          )}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}
