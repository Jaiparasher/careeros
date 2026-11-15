import { describe, it, expect } from "vitest";
import { envSchema } from "@/lib/env";

describe("Environment Schema Validation (envSchema)", () => {
  it("accepts valid Supabase URL and anon key", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://my-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SUPABASE_URL).toBe("https://my-project.supabase.co");
      expect(result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(
        "eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
      );
    }
  });

  it("applies defaults when values are omitted", () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SUPABASE_URL).toBe("http://localhost:54321");
      expect(result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("placeholder-anon-key");
    }
  });

  it("rejects an invalid URL format", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "not-a-valid-url",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "valid-key",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("must be a valid URL");
    }
  });

  it("rejects an empty string for anon key", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://my-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    });

    expect(result.success).toBe(false);
  });
});
