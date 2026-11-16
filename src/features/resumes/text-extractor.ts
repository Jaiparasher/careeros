export interface TextExtractionResult {
  success: boolean;
  text: string;
  status: "completed" | "failed";
  errorMessage?: string;
}

/**
 * Clean extracted raw text by removing null bytes, normalizing line endings,
 * and collapsing multiple consecutive blank lines.
 */
export function cleanExtractedText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Server-side extraction of text from PDF documents.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<TextExtractionResult> {
  if (!buffer || buffer.length === 0) {
    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: "The uploaded PDF file is empty (0 bytes).",
    };
  }

  // Quick signature check
  const header = buffer.subarray(0, 5).toString("utf-8");
  if (!header.startsWith("%PDF")) {
    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: "File does not have a valid PDF header signature.",
    };
  }

  let parserInstance: { getText: () => Promise<{ text?: string }>; destroy?: () => Promise<void> } | null = null;
  try {
    const pdfModule = await import("pdf-parse");
    if (pdfModule.PDFParse) {
      parserInstance = new pdfModule.PDFParse({ data: buffer });
      const result = await parserInstance.getText();
      const cleaned = cleanExtractedText(result?.text || "");
      if (cleaned.length < 5) {
        return {
          success: false,
          text: "",
          status: "failed",
          errorMessage:
            "PDF contains no machine-readable text. It may be an image-only scan. Please paste text manually.",
        };
      }
      return {
        success: true,
        text: cleaned,
        status: "completed",
      };
    } else if (typeof pdfModule.default === "function") {
      const result = await pdfModule.default(buffer);
      const cleaned = cleanExtractedText(result?.text || "");
      if (cleaned.length < 5) {
        return {
          success: false,
          text: "",
          status: "failed",
          errorMessage:
            "PDF contains no machine-readable text. It may be an image-only scan. Please paste text manually.",
        };
      }
      return {
        success: true,
        text: cleaned,
        status: "completed",
      };
    }

    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: "Could not initialize PDF parser engine.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: `PDF extraction error: ${message}`,
    };
  } finally {
    if (parserInstance && typeof parserInstance.destroy === "function") {
      try {
        await parserInstance.destroy();
      } catch {
        // ignore destroy errors
      }
    }
  }
}

/**
 * Server-side extraction of text from Word (.docx) documents.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<TextExtractionResult> {
  if (!buffer || buffer.length === 0) {
    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: "The uploaded DOCX file is empty (0 bytes).",
    };
  }

  // Quick signature check for zip/docx (PK\x03\x04)
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: "File does not appear to be a valid ZIP/DOCX archive.",
    };
  }

  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const cleaned = cleanExtractedText(result?.value || "");

    if (cleaned.length < 5) {
      return {
        success: false,
        text: "",
        status: "failed",
        errorMessage:
          "Word document contained no readable text body. Please enter text manually.",
      };
    }

    return {
      success: true,
      text: cleaned,
      status: "completed",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      text: "",
      status: "failed",
      errorMessage: `DOCX extraction error: ${message}`,
    };
  }
}

/**
 * Universal text extraction router based on MIME type.
 */
export async function extractResumeText(
  buffer: Buffer,
  mimeType: string
): Promise<TextExtractionResult> {
  if (mimeType === "application/pdf") {
    return extractTextFromPdf(buffer);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return extractTextFromDocx(buffer);
  }

  return {
    success: false,
    text: "",
    status: "failed",
    errorMessage: `Unsupported MIME type: ${mimeType}. Only PDF and DOCX are supported.`,
  };
}
