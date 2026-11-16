import { GoogleGenAI } from "@google/genai";
import { getAiConfig } from "@/lib/env";
import {
  aiGenerateOptionsSchema,
  type AiGenerateOptions,
  type AiErrorCode,
} from "./schema";

export interface AiGenerateResult {
  text: string;
  model: string;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export class AiServiceError extends Error {
  code: AiErrorCode;
  status: number;
  details?: unknown;

  constructor(message: string, code: AiErrorCode, status: number, details?: unknown) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function sanitizeErrorMessage(message: string, apiKey?: string): string {
  let sanitized = message;
  if (apiKey && apiKey.length > 4) {
    sanitized = sanitized.replaceAll(apiKey, "[REDACTED_API_KEY]");
  }
  // Redact URL query param keys like ?key=AIza... or &key=AIza...
  sanitized = sanitized.replace(/key=[A-Za-z0-9_\-]+/gi, "key=[REDACTED]");
  // Redact Bearer tokens
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, "Bearer [REDACTED]");
  return sanitized;
}

export function normalizeAiError(err: unknown, apiKey?: string): AiServiceError {
  if (err instanceof AiServiceError) {
    return err;
  }

  const rawMessage = err instanceof Error ? err.message : String(err);
  const sanitizedMessage = sanitizeErrorMessage(rawMessage, apiKey);
  const lowerMsg = sanitizedMessage.toLowerCase();

  // Timeout check
  if (
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("aborted") ||
    lowerMsg.includes("ai_request_timeout")
  ) {
    return new AiServiceError(
      "AI request timed out. Please try again.",
      "TIMEOUT",
      504
    );
  }

  // Quota / Rate limit check
  if (
    lowerMsg.includes("429") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("resource has been exhausted") ||
    lowerMsg.includes("rate limit")
  ) {
    return new AiServiceError(
      "Gemini API rate limit or quota exceeded. Please check your Google AI Studio quota or try again later.",
      "QUOTA_EXCEEDED",
      429
    );
  }

  // Authentication check
  if (
    lowerMsg.includes("api_key_invalid") ||
    lowerMsg.includes("api key not valid") ||
    lowerMsg.includes("unauthenticated") ||
    lowerMsg.includes("permission denied") ||
    lowerMsg.includes("401") ||
    lowerMsg.includes("403")
  ) {
    return new AiServiceError(
      "Gemini API authentication failed. Please verify your GEMINI_API_KEY configuration.",
      "MISSING_API_KEY",
      503
    );
  }

  // Content safety / blocked check
  if (
    lowerMsg.includes("safety") ||
    lowerMsg.includes("blocked") ||
    lowerMsg.includes("harm_category") ||
    lowerMsg.includes("candidate was blocked")
  ) {
    return new AiServiceError(
      "The request was blocked by content safety filters.",
      "CONTENT_FILTERED",
      400
    );
  }

  // Generic provider error
  return new AiServiceError(
    "Failed to communicate with AI provider.",
    "PROVIDER_ERROR",
    502
  );
}

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private apiKey?: string;
  private defaultModel: string;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    client?: GoogleGenAI;
  }) {
    this.apiKey = options?.apiKey;
    this.defaultModel = options?.model ?? "";
    if (options?.client) {
      this.client = options.client;
    } else if (options?.apiKey) {
      this.client = new GoogleGenAI({ apiKey: options.apiKey });
    }
  }

  isConfigured(): boolean {
    const config = getAiConfig();
    return Boolean(this.apiKey || config.apiKey);
  }

  getModel(): string {
    const config = getAiConfig();
    return this.defaultModel || config.model || "gemini-2.5-flash";
  }

  private getClient(): GoogleGenAI {
    const config = getAiConfig();
    const key = this.apiKey ?? config.apiKey;
    if (!key) {
      this.client = null;
      throw new AiServiceError(
        "Gemini API key is not configured on the server. Please set the GEMINI_API_KEY environment variable.",
        "MISSING_API_KEY",
        503
      );
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: key });
    }
    return this.client;
  }

  async generateContent(rawOptions: AiGenerateOptions): Promise<AiGenerateResult> {
    const parsed = aiGenerateOptionsSchema.safeParse(rawOptions);
    if (!parsed.success) {
      throw new AiServiceError(
        `Invalid AI request payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
        "INVALID_REQUEST",
        400,
        parsed.error.issues
      );
    }

    const options = parsed.data;
    const client = this.getClient();
    const model = this.getModel();
    const timeoutMs = options.timeoutMs ?? 30_000;

    const controller = new AbortController();
    let timer: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error("AI_REQUEST_TIMEOUT"));
      }, timeoutMs);
    });

    try {
      const responsePromise = client.models.generateContent({
        model,
        contents: options.prompt,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
          abortSignal: controller.signal,
        },
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;

      if (finishReason === "SAFETY") {
        throw new AiServiceError(
          "The request was blocked by content safety filters.",
          "CONTENT_FILTERED",
          400
        );
      }

      const text = response.text ?? "";

      const usage = response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount ?? 0,
            completionTokens: response.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: response.usageMetadata.totalTokenCount ?? 0,
          }
        : undefined;

      return {
        text,
        model,
        finishReason,
        usage,
      };
    } catch (err: unknown) {
      if (timer) clearTimeout(timer);
      throw normalizeAiError(err, this.apiKey ?? getAiConfig().apiKey);
    }
  }
}

export const geminiService = new GeminiService();
