import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  aiEnvSchema,
  getAiConfig,
  env,
} from "@/lib/env";
import {
  InMemoryRateLimiter,
  aiRateLimiter,
  GeminiService,
  sanitizeErrorMessage,
  normalizeAiError,
  verifyPromptSchema,
  aiGenerateOptionsSchema,
  MAX_PROMPT_LENGTH,
  MAX_VERIFY_PROMPT_LENGTH,
} from "@/features/ai";
import { GET, POST } from "@/app/api/ai/verify/route";
import { NextRequest } from "next/server";

// Mock Supabase server client for route handler tests
let mockUser: { id: string; email: string } | null = null;
let mockAuthError: Error | null = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => {
        if (mockAuthError) {
          return { data: { user: null }, error: mockAuthError };
        }
        return { data: { user: mockUser }, error: null };
      }),
    },
  })),
}));

describe("Phase 4 Batch 1: Gemini AI Integration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    mockUser = null;
    mockAuthError = null;
    aiRateLimiter.reset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // 1. Environment & Configuration Security
  // --------------------------------------------------------------------------
  describe("1. Environment & Configuration Security", () => {
    it("validates GEMINI_API_KEY and GEMINI_MODEL via aiEnvSchema", () => {
      const valid = aiEnvSchema.safeParse({
        GEMINI_API_KEY: "test-key-12345",
        GEMINI_MODEL: "gemini-2.5-flash",
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.GEMINI_API_KEY).toBe("test-key-12345");
        expect(valid.data.GEMINI_MODEL).toBe("gemini-2.5-flash");
      }
    });

    it("defaults GEMINI_MODEL to gemini-2.5-flash when omitted", () => {
      const result = aiEnvSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.GEMINI_MODEL).toBe("gemini-2.5-flash");
      }
    });

    it("returns isConfigured: false when GEMINI_API_KEY is not set", () => {
      delete process.env.GEMINI_API_KEY;
      const config = getAiConfig();
      expect(config.isConfigured).toBe(false);
      expect(config.apiKey).toBeUndefined();
    });

    it("returns isConfigured: true and trims key when GEMINI_API_KEY is present", () => {
      process.env.GEMINI_API_KEY = "  sk-gemini-secret-test  ";
      const config = getAiConfig();
      expect(config.isConfigured).toBe(true);
      expect(config.apiKey).toBe("sk-gemini-secret-test");
    });

    it("SECURITY CHECK: client-facing env object never contains GEMINI_API_KEY", () => {
      process.env.GEMINI_API_KEY = "super-secret-key-123";
      // The public env object imported by client components
      expect((env as Record<string, unknown>).GEMINI_API_KEY).toBeUndefined();
      expect((env as Record<string, unknown>).NEXT_PUBLIC_GEMINI_API_KEY).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Request Payload Validation & Limits
  // --------------------------------------------------------------------------
  describe("2. Request Payload Validation & Limits", () => {
    it("accepts valid generation options", () => {
      const valid = aiGenerateOptionsSchema.safeParse({
        prompt: "Summarize Java 21 virtual threads",
        temperature: 0.7,
        maxOutputTokens: 500,
        systemInstruction: "You are a technical interviewer.",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects an empty prompt", () => {
      const invalid = aiGenerateOptionsSchema.safeParse({
        prompt: "   ",
      });
      expect(invalid.success).toBe(false);
    });

    it(`enforces maximum prompt length limit (${MAX_PROMPT_LENGTH} characters)`, () => {
      const oversizedPrompt = "A".repeat(MAX_PROMPT_LENGTH + 1);
      const invalid = aiGenerateOptionsSchema.safeParse({
        prompt: oversizedPrompt,
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain(`${MAX_PROMPT_LENGTH} characters or less`);
      }
    });

    it(`enforces verification prompt length limit (${MAX_VERIFY_PROMPT_LENGTH} characters)`, () => {
      const oversizedVerify = "B".repeat(MAX_VERIFY_PROMPT_LENGTH + 1);
      const invalid = verifyPromptSchema.safeParse({
        prompt: oversizedVerify,
      });
      expect(invalid.success).toBe(false);
    });

    it("allows optional or empty verification prompt", () => {
      const empty = verifyPromptSchema.safeParse({});
      expect(empty.success).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. In-Memory Rate Limiter
  // --------------------------------------------------------------------------
  describe("3. In-Memory Rate Limiter", () => {
    it("allows requests up to configured limit", () => {
      const limiter = new InMemoryRateLimiter({ defaultLimit: 3, defaultWindowMs: 10_000 });
      const id = "user-test-1";

      const r1 = limiter.check(id);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = limiter.check(id);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = limiter.check(id);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request exceeds limit
      const r4 = limiter.check(id);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("maintains separate limits for different users", () => {
      const limiter = new InMemoryRateLimiter({ defaultLimit: 2, defaultWindowMs: 10_000 });
      limiter.check("user-a");
      limiter.check("user-a");
      expect(limiter.check("user-a").allowed).toBe(false);

      // user-b still has full quota
      expect(limiter.check("user-b").allowed).toBe(true);
    });

    it("resets limit when requested", () => {
      const limiter = new InMemoryRateLimiter({ defaultLimit: 1, defaultWindowMs: 10_000 });
      limiter.check("user-c");
      expect(limiter.check("user-c").allowed).toBe(false);

      limiter.reset("user-c");
      expect(limiter.check("user-c").allowed).toBe(true);
    });

    it("prunes expired records", () => {
      const limiter = new InMemoryRateLimiter({ defaultLimit: 1, defaultWindowMs: 50 });
      limiter.check("user-d", 1, 50);
      expect(limiter.getRecordCount()).toBe(1);

      // Simulate passage of time
      limiter.prune(Date.now() + 100);
      expect(limiter.getRecordCount()).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Gemini Service & Error Normalization
  // --------------------------------------------------------------------------
  describe("4. Gemini Service & Error Normalization", () => {
    it("throws MISSING_API_KEY error when initialized without key", async () => {
      delete process.env.GEMINI_API_KEY;
      const service = new GeminiService({ apiKey: undefined });

      await expect(
        service.generateContent({ prompt: "Hello" })
      ).rejects.toMatchObject({
        code: "MISSING_API_KEY",
        status: 503,
      });
    });

    it("throws INVALID_REQUEST error when given invalid options", async () => {
      const service = new GeminiService({ apiKey: "mock-key" });
      await expect(
        service.generateContent({ prompt: "" })
      ).rejects.toMatchObject({
        code: "INVALID_REQUEST",
        status: 400,
      });
    });

    it("successfully generates content with mocked GoogleGenAI client", async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: "CareerOS AI connection verified.",
        candidates: [{ finishReason: "STOP" }],
        usageMetadata: {
          promptTokenCount: 12,
          candidatesTokenCount: 6,
          totalTokenCount: 18,
        },
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as import("@google/genai").GoogleGenAI;

      const service = new GeminiService({
        apiKey: "valid-mock-key",
        client: mockClient,
      });

      const result = await service.generateContent({
        prompt: "Verify connection",
      });

      expect(result.text).toBe("CareerOS AI connection verified.");
      expect(result.finishReason).toBe("STOP");
      expect(result.usage).toEqual({
        promptTokens: 12,
        completionTokens: 6,
        totalTokens: 18,
      });
    });

    it("handles content safety filters (finishReason: SAFETY)", async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: "",
        candidates: [{ finishReason: "SAFETY" }],
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as import("@google/genai").GoogleGenAI;

      const service = new GeminiService({
        apiKey: "valid-mock-key",
        client: mockClient,
      });

      await expect(
        service.generateContent({ prompt: "Generate harmful content" })
      ).rejects.toMatchObject({
        code: "CONTENT_FILTERED",
        status: 400,
      });
    });

    it("maps 429 / quota exceeded error correctly", () => {
      const err = new Error("Resource has been exhausted (e.g. check quota): 429 Too Many Requests");
      const normalized = normalizeAiError(err);
      expect(normalized.code).toBe("QUOTA_EXCEEDED");
      expect(normalized.status).toBe(429);
      expect(normalized.message).toContain("quota");
    });

    it("maps 401 / permission denied error correctly", () => {
      const err = new Error("API_KEY_INVALID: API key not valid. Please pass a valid API key.");
      const normalized = normalizeAiError(err);
      expect(normalized.code).toBe("MISSING_API_KEY");
      expect(normalized.status).toBe(503);
      expect(normalized.message).toContain("authentication failed");
    });

    it("maps timeout errors correctly", () => {
      const err = new Error("AI_REQUEST_TIMEOUT");
      const normalized = normalizeAiError(err);
      expect(normalized.code).toBe("TIMEOUT");
      expect(normalized.status).toBe(504);
    });

    it("maps unexpected provider errors safely without exposing internal details", () => {
      const err = new Error("Database connection refused in internal gateway at 10.0.0.1:5432");
      const normalized = normalizeAiError(err);
      expect(normalized.code).toBe("PROVIDER_ERROR");
      expect(normalized.status).toBe(502);
      expect(normalized.message).toBe("Failed to communicate with AI provider.");
    });

    it("SECURITY CHECK: redacts API keys and secret query strings from error messages", () => {
      const secret = "AIzaSySecretApiKey123456789";
      const dirty = `Failed call to https://generativelanguage.googleapis.com/v1beta/models?key=${secret} using key=${secret}`;
      const clean = sanitizeErrorMessage(dirty, secret);
      expect(clean).not.toContain(secret);
      expect(clean).toContain("[REDACTED_API_KEY]");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Protected Endpoint Integration (/api/ai/verify)
  // --------------------------------------------------------------------------
  describe("5. Protected Endpoint (/api/ai/verify)", () => {
    it("GET: rejects unauthenticated requests with 401 UNAUTHORIZED", async () => {
      mockUser = null;
      const res = await GET();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("GET: returns configuration status for authenticated user", async () => {
      mockUser = { id: "test-user-id", email: "user@example.com" };
      process.env.GEMINI_API_KEY = "test-key";

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.model).toBeDefined();
    });

    it("POST: rejects unauthenticated requests with 401 UNAUTHORIZED", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/ai/verify", {
        method: "POST",
        body: JSON.stringify({ prompt: "ping" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("POST: returns 503 MISSING_API_KEY if server has no GEMINI_API_KEY configured", async () => {
      mockUser = { id: "test-user-id", email: "user@example.com" };
      delete process.env.GEMINI_API_KEY;

      const req = new NextRequest("http://localhost:3000/api/ai/verify", {
        method: "POST",
        body: JSON.stringify({ prompt: "ping" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.error.code).toBe("MISSING_API_KEY");
      expect(json.error.message).toContain("GEMINI_API_KEY");
    });

    it("POST: returns 400 INVALID_REQUEST for oversized prompt", async () => {
      mockUser = { id: "test-user-id", email: "user@example.com" };
      process.env.GEMINI_API_KEY = "test-key";

      const req = new NextRequest("http://localhost:3000/api/ai/verify", {
        method: "POST",
        body: JSON.stringify({ prompt: "X".repeat(MAX_VERIFY_PROMPT_LENGTH + 10) }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("INVALID_REQUEST");
    });

    it("POST: returns 400 INVALID_REQUEST for malformed JSON body", async () => {
      mockUser = { id: "test-user-id", email: "user@example.com" };
      process.env.GEMINI_API_KEY = "test-key";

      const req = new NextRequest("http://localhost:3000/api/ai/verify", {
        method: "POST",
        body: "{ malformed json",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("INVALID_REQUEST");
    });

    it("POST: enforces in-memory rate limiting across repeated requests", async () => {
      mockUser = { id: "heavy-user-123", email: "heavy@example.com" };
      process.env.GEMINI_API_KEY = "test-key";

      // Mock generateContent on the service
      const spy = vi
        .spyOn(GeminiService.prototype, "generateContent")
        .mockResolvedValue({
          text: "Echo response",
          model: "gemini-2.5-flash",
          usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 },
        });

      // Send requests up to limit (10)
      for (let i = 0; i < 10; i++) {
        const req = new NextRequest("http://localhost:3000/api/ai/verify", {
          method: "POST",
          body: JSON.stringify({ prompt: "test" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
      }

      // 11th request must be rate limited (429)
      const reqLimit = new NextRequest("http://localhost:3000/api/ai/verify", {
        method: "POST",
        body: JSON.stringify({ prompt: "test" }),
      });
      const resLimit = await POST(reqLimit);
      expect(resLimit.status).toBe(429);
      const jsonLimit = await resLimit.json();
      expect(jsonLimit.error.code).toBe("RATE_LIMITED");
      expect(resLimit.headers.get("Retry-After")).toBeDefined();

      spy.mockRestore();
    });

    it("POST: successfully generates response and NEVER leaks API key in response", async () => {
      const secretKey = "test-secret-key-xyz-789";
      process.env.GEMINI_API_KEY = secretKey;
      mockUser = { id: "safe-user", email: "safe@example.com" };

      const spy = vi
        .spyOn(GeminiService.prototype, "generateContent")
        .mockResolvedValue({
          text: "CareerOS AI connection verified.",
          model: "gemini-2.5-flash",
          usage: { promptTokens: 4, completionTokens: 5, totalTokens: 9 },
        });

      const req = new NextRequest("http://localhost:3000/api/ai/verify", {
        method: "POST",
        body: JSON.stringify({ prompt: "Say hello" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.message).toBe("CareerOS AI connection verified.");
      expect(json.model).toBe("gemini-2.5-flash");

      // Verify zero leak of secretKey
      const responseString = JSON.stringify(json);
      expect(responseString).not.toContain(secretKey);

      spy.mockRestore();
    });
  });
});
