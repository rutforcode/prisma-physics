/**
 * Inline image mixing via placeholder markers.
 *
 * A post body is plain text, but writers can drop `[img:N]` markers (N = the
 * image's index in the post's images array) anywhere in the text to embed
 * that image *inside* the flow — a diagram right under the sentence that
 * references it. The shared renderer (`MixedBody`) splits the text at these
 * markers and interleaves the actual images.
 *
 * Keep this file dependency-free: it is imported by the frontend composers
 * and renderers AND by the backend (char counting).
 */
export const IMG_MARKER_REGEX = /\[img:(\d+)\]/g;

/** Remove every `[img:N]` marker from a string. */
export function stripImageMarkers(text: string): string {
  return text.replace(IMG_MARKER_REGEX, "");
}

/**
 * The ordered list of image indices referenced by markers in the text,
 * e.g. "See [img:0] and [img:2]" → [0, 2].
 */
export function parseImageMarkers(text: string): number[] {
  const indices: number[] = [];
  for (const match of text.matchAll(IMG_MARKER_REGEX)) {
    indices.push(Number(match[1]));
  }
  return indices;
}
