import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .default("http://localhost:54321"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .default("placeholder-anon-key"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
  };

export const aiEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY must not be empty").optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
});

export function getAiConfig() {
  const rawKey = process.env.GEMINI_API_KEY?.split("#")[0].trim();
  const apiKey = rawKey && rawKey.length > 0 ? rawKey : undefined;
  const rawModel = process.env.GEMINI_MODEL?.split("#")[0].trim();
  const model = rawModel && rawModel.length > 0 ? rawModel : "gemini-2.5-flash";
  return {
    apiKey,
    model,
    isConfigured: Boolean(apiKey && apiKey.length > 0),
  };
}


