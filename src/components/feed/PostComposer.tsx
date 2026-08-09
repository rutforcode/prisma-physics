import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { TOPICS, type TopicId } from "@/lib/topic-meta";
import { useMutation, useQuery } from "convex/react";
import { AtSign, ImagePlus, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function PostComposer() {
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<TopicId | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Object URL lifecycle for the image preview
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, GIF…).");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
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
        if (!upload.ok) {
          throw new Error("Upload failed — please try again.");
        }
        const { storageId } = (await upload.json()) as { storageId: Id<"_storage"> };
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

      <div className="relative mt-3">
        <textarea
          ref={bodyRef}
          value={body}
          onChange={handleBodyChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMentionOpen(false);
          }}
          placeholder="What would you like to discuss? Questions, notes, and mini-explanations welcome — type @ to mention a classmate."
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

      {previewUrl && (
        <div className="relative mt-3 inline-block">
          <img
            src={previewUrl}
            alt="Post attachment preview"
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
            id="post-image-input"
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
