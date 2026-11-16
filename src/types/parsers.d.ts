declare module "mammoth" {
  export interface RawTextResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ExtractOptions {
    buffer?: Buffer;
    path?: string;
  }

  export function extractRawText(options: ExtractOptions): Promise<RawTextResult>;
}

declare module "pdf-parse" {
  export interface PDFParseResult {
    numpages?: number;
    numrender?: number;
    info?: unknown;
    metadata?: unknown;
    version?: string;
    text: string;
    total?: number;
    pages?: Array<{ text: string; num: number }>;
  }

  export interface PDFParseOptions {
    data?: Buffer | Uint8Array;
    pagerender?: (pageData: unknown) => string | Promise<string>;
    max?: number;
    version?: string;
    verbosity?: number;
  }

  export class PDFParse {
    constructor(options: PDFParseOptions);
    getText(): Promise<PDFParseResult>;
    destroy(): Promise<void>;
  }

  export default function PDFParseFunction(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>;
}
