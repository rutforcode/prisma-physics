/**
 * Minimal ambient types for mammoth's browser UMD bundle
 * (`mammoth/mammoth.browser.js`). Only the surface used by the Word
 * importer is declared — the API mirrors mammoth's shipped
 * `lib/index.d.ts` for the pieces we call.
 */
declare module "mammoth/mammoth.browser.js" {
  export interface MammothImage {
    contentType: string;
    altText?: string;
    read: (encoding?: string) => Promise<unknown>;
    readAsArrayBuffer: () => Promise<ArrayBuffer>;
    readAsBase64String: () => Promise<string>;
  }

  export interface MammothMessage {
    type: "warning" | "error";
    message: string;
    error?: unknown;
  }

  export interface MammothOptions {
    styleMap?: string[] | string;
    includeDefaultStyleMap?: boolean;
    includeEmbeddedStyleMap?: boolean;
    ignoreEmptyParagraphs?: boolean;
    convertImage?: (
      image: MammothImage,
      messages: MammothMessage[],
    ) => Promise<{ src: string }>;
    idPrefix?: string;
  }

  export interface MammothResult {
    value: string;
    messages: MammothMessage[];
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: MammothOptions,
  ): Promise<MammothResult>;

  const mammoth: { convertToHtml: typeof convertToHtml };
  export default mammoth;
}
