import { z } from "zod";

export const MAX_PROMPT_LENGTH = 10_000;
export const MAX_VERIFY_PROMPT_LENGTH = 1_000;

export const verifyPromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .max(MAX_VERIFY_PROMPT_LENGTH, `Verification prompt must be ${MAX_VERIFY_PROMPT_LENGTH} characters or less`)
    .optional(),
});

export const aiGenerateOptionsSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt cannot be empty")
    .max(MAX_PROMPT_LENGTH, `Prompt must be ${MAX_PROMPT_LENGTH} characters or less`),
  systemInstruction: z
    .string()
    .trim()
    .max(4_000, "System instruction must be 4,000 characters or less")
    .optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().max(8_192).optional(),
  timeoutMs: z.number().int().positive().max(120_000).optional(),
});

export const aiErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "MISSING_API_KEY",
  "RATE_LIMITED",
  "INVALID_REQUEST",
  "TIMEOUT",
  "CONTENT_FILTERED",
  "QUOTA_EXCEEDED",
  "PROVIDER_ERROR",
]);

export const aiErrorResponseSchema = z.object({
  error: z.object({
    code: aiErrorCodeSchema,
    message: z.string(),
    status: z.number().int(),
    details: z.unknown().optional(),
  }),
});

export type VerifyPromptInput = z.infer<typeof verifyPromptSchema>;
export type AiGenerateOptions = z.infer<typeof aiGenerateOptionsSchema>;
export type AiErrorCode = z.infer<typeof aiErrorCodeSchema>;
export type AiErrorResponse = z.infer<typeof aiErrorResponseSchema>;
