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
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
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
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What would you like to discuss? Questions, notes, and mini-explanations welcome."
        rows={3}
        className="mt-3 w-full resize-none rounded-xl border border-white/70 bg-white/50 px-4 py-3 text-sm leading-relaxed shadow-inner outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-[3px] focus:ring-primary/15"
      />

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
        <div className="flex items-center gap-2">
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
