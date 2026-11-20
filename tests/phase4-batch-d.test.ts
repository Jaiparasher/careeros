import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateRecommendationsInputSchema,
  isValidCalendarDate,
} from "@/features/planner/recommendation-schema";
import {
  StudyRecommendationService,
  deriveModuleCategory,
} from "@/features/planner/recommendation-service";
import {
  MockInterviewService,
  parseScore,
} from "@/features/interview/mock-interview-service";
import { GeminiService, MAX_PROMPT_LENGTH, aiRateLimiter } from "@/features/ai";
import {
  buildAnalysisPrompt,
  generateAiResumeJdAnalysis,
} from "@/features/resumes/ai-analyzer";
import { taskCategorySchema } from "@/features/planner/schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

describe("Phase 4 Remediation: Batch D Targeted Corrections Verification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    aiRateLimiter.reset();
  });

  describe("1. L-01: Next.js server-only Module Protection", () => {
    it("verifies server-only package is installed and imported in server-only modules", () => {
      const pkgPath = path.resolve(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      expect(pkg.dependencies["server-only"]).toBeDefined();

      const filesToCheck = [
        "src/features/ai/gemini-service.ts",
        "src/features/resumes/ai-analyzer.ts",
        "src/features/interview/mock-evaluator.ts",
        "src/features/planner/recommendation-advisor.ts",
      ];

      for (const relPath of filesToCheck) {
        const fullPath = path.resolve(process.cwd(), relPath);
        const content = fs.readFileSync(fullPath, "utf-8");
        expect(content).toContain('import "server-only";');
      }
    });
  });

  describe("2. L-02: Timeout, Cancellation, and Promise Lifecycle", () => {
    it("aborts the underlying fetch signal on timeout", async () => {
      let capturedSignal: AbortSignal | undefined;
      const mockGenerateContent = vi.fn().mockImplementation((opts: { config?: { abortSignal?: AbortSignal } }) => {
        capturedSignal = opts.config?.abortSignal;
        return new Promise((resolve) => setTimeout(resolve, 500));
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as GoogleGenAI;

      const service = new GeminiService({
        apiKey: "test-api-key",
        client: mockClient,
      });

      await expect(
        service.generateContent({
          prompt: "Test prompt",
          timeoutMs: 50,
        })
      ).rejects.toThrow("AI request timed out. Please try again.");

      expect(capturedSignal?.aborted).toBe(true);
    });

    it("prevents timed-out requests from triggering an automatic retry", async () => {
      const mockGenerateContent = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 300));
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as GoogleGenAI;

      const service = new GeminiService({
        apiKey: "test-api-key",
        client: mockClient,
      });

      await expect(
        service.generateContent({
          prompt: "Test prompt",
          timeoutMs: 40,
        })
      ).rejects.toThrow("AI request timed out. Please try again.");

      // Exactly 1 call was made; no retry occurred after timeout
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("handles late rejection after timeout without unhandled rejection", async () => {
      let rejectLateCall: (err: Error) => void;
      const latePromise = new Promise((_, reject) => {
        rejectLateCall = reject;
      });

      const mockGenerateContent = vi.fn().mockReturnValue(latePromise);

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as GoogleGenAI;

      const service = new GeminiService({
        apiKey: "test-api-key",
        client: mockClient,
      });

      await expect(
        service.generateContent({
          prompt: "Late rejection test",
          timeoutMs: 20,
        })
      ).rejects.toThrow("AI request timed out. Please try again.");

      // Trigger late rejection on underlying promise — should not crash process or produce unhandled error
      rejectLateCall!(new Error("Late network connection dropped"));
    });

    it("returns successful response when request completes before timeout and clears timer", async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: "Successful response text",
        candidates: [{ finishReason: "STOP" }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as GoogleGenAI;

      const service = new GeminiService({
        apiKey: "test-api-key",
        client: mockClient,
      });

      const res = await service.generateContent({
        prompt: "Quick prompt",
        timeoutMs: 5000,
      });

      expect(res.text).toBe("Successful response text");
      expect(res.usage?.totalTokens).toBe(30);
    });

    it("cancels backoff sleep immediately and prevents retry provider call when aborted", async () => {
      let callCount = 0;
      const mockGenerateContent = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error("503 Service Unavailable"));
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as GoogleGenAI;

      const service = new GeminiService({
        apiKey: "test-api-key",
        client: mockClient,
      });

      await expect(
        service.generateContent({
          prompt: "Test prompt",
          timeoutMs: 60,
        })
      ).rejects.toThrow("AI request timed out. Please try again.");

      // Provider call was made exactly once; backoff was cancelled before retry could occur
      expect(callCount).toBe(1);
    });
  });

  describe("3. L-04: Numeric Score Parsing and State Transitions", () => {
    it("parseScore handles valid numbers within [0, 10]", () => {
      expect(parseScore(0)).toBe(0);
      expect(parseScore(10)).toBe(10);
      expect(parseScore(8.5)).toBe(8.5);
      expect(parseScore(5)).toBe(5);
    });

    it("parseScore handles database string representations", () => {
      expect(parseScore("8.50")).toBe(8.5);
      expect(parseScore("0")).toBe(0);
      expect(parseScore("10.00")).toBe(10);
      expect(parseScore("7.25")).toBe(7.25);
    });

    it("parseScore returns null for null, undefined, empty, whitespace, and malformed strings", () => {
      expect(parseScore(null)).toBeNull();
      expect(parseScore(undefined)).toBeNull();
      expect(parseScore("")).toBeNull();
      expect(parseScore("   ")).toBeNull();
      expect(parseScore("abc")).toBeNull();
      expect(parseScore("8.5.5")).toBeNull();
      expect(parseScore(NaN)).toBeNull();
    });

    it("parseScore returns null for out-of-range and non-finite values", () => {
      expect(parseScore(-1)).toBeNull();
      expect(parseScore(-0.1)).toBeNull();
      expect(parseScore(10.1)).toBeNull();
      expect(parseScore(15)).toBeNull();
      expect(parseScore("15.00")).toBeNull();
      expect(parseScore("-2.0")).toBeNull();
      expect(parseScore(Infinity)).toBeNull();
      expect(parseScore(-Infinity)).toBeNull();
    });

    it("rejects retry when question status is skipped", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: "session-1", status: "in_progress" },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: "q-1",
                          session_id: "session-1",
                          user_id: "user-1",
                          user_answer: "[Skipped by candidate]",
                          evaluation_status: "skipped",
                        },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.retryEvaluation("user-1", "session-1", "q-1")
      ).rejects.toThrow("Cannot retry evaluation on a skipped question.");
    });

    it("rejects submitting answer when question is already evaluated", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: "session-1", status: "in_progress" },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: "q-1",
                          session_id: "session-1",
                          user_id: "user-1",
                          evaluation_status: "evaluated",
                        },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "q-1",
          answer: "My answer",
        })
      ).rejects.toThrow("Question has already been evaluated. Use retry if you wish to re-evaluate.");
    });

    it("rejects answer submission or retry when session is completed or abandoned", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: "session-1", status: "completed" },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: "q-1",
                          session_id: "session-1",
                          user_id: "user-1",
                          evaluation_status: "pending",
                        },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "q-1",
          answer: "Test answer",
        })
      ).rejects.toThrow("Cannot submit answer to a completed or abandoned interview session.");
    });

    it("rejects retry when session is abandoned", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: "session-1", status: "abandoned" },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: "q-1",
                          session_id: "session-1",
                          user_id: "user-1",
                          user_answer: "Previous answer",
                          evaluation_status: "failed",
                        },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.retryEvaluation("user-1", "session-1", "q-1")
      ).rejects.toThrow("Cannot retry evaluation on a completed or abandoned interview session.");
    });

    it("allows a new submission from 'pending' to claim the question", async () => {
      let geminiCallCount = 0;
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockImplementation(async () => {
        geminiCallCount++;
        return {
          text: JSON.stringify({
            score: 8.5,
            technicalCorrectness: 4,
            completeness: 4,
            clarity: 4,
            practicalDepth: 4,
            tradeoffAwareness: 4,
            correctConcepts: ["Good answer"],
            missingConcepts: [],
            incorrectStatements: [],
            clarityAssessment: "Clear",
            depthAssessment: "Good depth",
            improvementAdvice: "None",
            idealAnswer: "Ideal",
            followUpQuestions: [],
          }),
          model: "gemini-2.5-flash",
        };
      });

      let currentStatus: "pending" | "evaluating" | "evaluated" = "pending";
      const qRecordState: Record<string, unknown> = {
        id: "iq-new-claim",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "What is Spring IoC?",
        evaluation_status: currentStatus,
      };

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress", category: "Technical" },
                error: null,
              }),
              update: vi.fn().mockReturnThis(),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockResolvedValue({ data: [qRecordState], error: null }),
              single: vi.fn().mockImplementation(async () => ({
                data: { ...qRecordState, evaluation_status: currentStatus },
                error: null,
              })),
              update: vi.fn((payload: Record<string, unknown>) => {
                return {
                  eq: vi.fn().mockReturnThis(),
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockImplementation(async () => {
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                  maybeSingle: vi.fn().mockImplementation(async () => {
                    if (payload.evaluation_status === "evaluating") {
                      if (currentStatus === "pending") {
                        currentStatus = "evaluating";
                        qRecordState.evaluation_status = "evaluating";
                        return { data: qRecordState, error: null };
                      }
                      return { data: null, error: null };
                    }
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                };
              }),
            };
          }
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { expected_answer_points: [], sample_answer: "Sample" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      const res = await service.submitAnswer("user-1", {
        sessionId: "session-1",
        questionId: "iq-new-claim",
        answer: "Inversion of Control delegates object creation to the container.",
      });

      expect(res.question.evaluation_status).toBe("evaluated");
      expect(geminiCallCount).toBe(1);

      geminiSpy.mockRestore();
    });

    it("rejects a new submission from 'evaluating' without calling Gemini", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent");
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress" },
                error: null,
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "q-1", session_id: "session-1", user_id: "user-1", evaluation_status: "evaluating" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "q-1",
          answer: "Trying to submit while evaluating",
        })
      ).rejects.toThrow("Question is currently being evaluated. Please wait.");

      expect(geminiSpy).not.toHaveBeenCalled();
      geminiSpy.mockRestore();
    });

    it("rejects a new submission from 'failed'; it must use the retry path", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent");
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress" },
                error: null,
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "q-1", session_id: "session-1", user_id: "user-1", evaluation_status: "failed" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "q-1",
          answer: "Direct submit on failed question",
        })
      ).rejects.toThrow("Question evaluation previously failed. Use retry if you wish to re-evaluate.");

      expect(geminiSpy).not.toHaveBeenCalled();
      geminiSpy.mockRestore();
    });

    it("allows a retry from 'failed' to claim the question", async () => {
      let geminiCallCount = 0;
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockImplementation(async () => {
        geminiCallCount++;
        return {
          text: JSON.stringify({
            score: 7.5,
            technicalCorrectness: 4,
            completeness: 3,
            clarity: 4,
            practicalDepth: 3,
            tradeoffAwareness: 3,
            correctConcepts: ["Retry evaluated"],
            missingConcepts: [],
            incorrectStatements: [],
            clarityAssessment: "Good",
            depthAssessment: "Moderate",
            improvementAdvice: "Add more examples",
            idealAnswer: "Ideal",
            followUpQuestions: [],
          }),
          model: "gemini-2.5-flash",
        };
      });

      let currentStatus: "failed" | "evaluating" | "evaluated" = "failed";
      const qRecordState: Record<string, unknown> = {
        id: "iq-retry-claim",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "Explain garbage collection in Java.",
        user_answer: "Automatic memory management by JVM.",
        evaluation_status: currentStatus,
      };

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress", category: "Technical" },
                error: null,
              }),
              update: vi.fn().mockReturnThis(),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockResolvedValue({ data: [qRecordState], error: null }),
              single: vi.fn().mockImplementation(async () => ({
                data: { ...qRecordState, evaluation_status: currentStatus },
                error: null,
              })),
              update: vi.fn((payload: Record<string, unknown>) => {
                return {
                  eq: vi.fn().mockReturnThis(),
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockImplementation(async () => {
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                  maybeSingle: vi.fn().mockImplementation(async () => {
                    if (payload.evaluation_status === "evaluating") {
                      if (currentStatus === "failed") {
                        currentStatus = "evaluating";
                        qRecordState.evaluation_status = "evaluating";
                        return { data: qRecordState, error: null };
                      }
                      return { data: null, error: null };
                    }
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                };
              }),
            };
          }
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { expected_answer_points: [], sample_answer: "Sample" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      const res = await service.retryEvaluation("user-1", "session-1", "iq-retry-claim");

      expect(res.question.evaluation_status).toBe("evaluated");
      expect(geminiCallCount).toBe(1);

      geminiSpy.mockRestore();
    });

    it("rejects a retry from 'pending' or 'evaluating'", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent");
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress" },
                error: null,
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "q-1",
                  session_id: "session-1",
                  user_id: "user-1",
                  user_answer: "Existing answer",
                  evaluation_status: "pending",
                },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.retryEvaluation("user-1", "session-1", "q-1")
      ).rejects.toThrow("Only failed evaluations can be retried.");

      expect(geminiSpy).not.toHaveBeenCalled();
      geminiSpy.mockRestore();
    });

    it("rejects a retry from 'evaluating' without calling Gemini", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent");
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress" },
                error: null,
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "q-1",
                  session_id: "session-1",
                  user_id: "user-1",
                  user_answer: "Existing answer",
                  evaluation_status: "evaluating",
                },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);
      await expect(
        service.retryEvaluation("user-1", "session-1", "q-1")
      ).rejects.toThrow("Only failed evaluations can be retried.");

      expect(geminiSpy).not.toHaveBeenCalled();
      geminiSpy.mockRestore();
    });

    it("preserves atomic question claim under concurrent submissions (mocked concurrency test)", async () => {
      let geminiCallCount = 0;
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockImplementation(async () => {
        geminiCallCount++;
        await new Promise((r) => setTimeout(r, 20));
        return {
          text: JSON.stringify({
            score: 9.0,
            technicalCorrectness: 5,
            completeness: 5,
            clarity: 4,
            practicalDepth: 4,
            tradeoffAwareness: 4,
            correctConcepts: ["Concurrent submit handled"],
            missingConcepts: [],
            incorrectStatements: [],
            clarityAssessment: "Excellent",
            depthAssessment: "Deep",
            improvementAdvice: "None",
            idealAnswer: "Ideal",
            followUpQuestions: [],
          }),
          model: "gemini-2.5-flash",
        };
      });

      let currentStatus: "pending" | "evaluating" | "evaluated" = "pending";
      const qRecordState: Record<string, unknown> = {
        id: "iq-concurrent-submit",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "What is an idempotent API?",
        user_answer: null,
        evaluation_status: currentStatus,
      };

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress", category: "Technical" },
                error: null,
              }),
              update: vi.fn().mockReturnThis(),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockResolvedValue({ data: [qRecordState], error: null }),
              single: vi.fn().mockImplementation(async () => ({
                data: { ...qRecordState, evaluation_status: currentStatus },
                error: null,
              })),
              update: vi.fn((payload: Record<string, unknown>) => {
                return {
                  eq: vi.fn().mockReturnThis(),
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockImplementation(async () => {
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                  maybeSingle: vi.fn().mockImplementation(async () => {
                    if (payload.evaluation_status === "evaluating") {
                      if (currentStatus === "pending") {
                        currentStatus = "evaluating";
                        qRecordState.evaluation_status = "evaluating";
                        return { data: qRecordState, error: null };
                      }
                      // Claimed concurrently by first caller
                      return { data: null, error: null };
                    }
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                };
              }),
            };
          }
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { expected_answer_points: [], sample_answer: "Sample" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);

      const [res1, res2] = await Promise.allSettled([
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-concurrent-submit",
          answer: "An API where multiple identical requests have the same effect as a single request.",
        }),
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-concurrent-submit",
          answer: "Duplicate concurrent submission attempt.",
        }),
      ]);

      const fulfilled = [res1, res2].filter((r) => r.status === "fulfilled");
      const rejected = [res1, res2].filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect(geminiCallCount).toBe(1);

      geminiSpy.mockRestore();
    });

    it("preserves atomic question claim under concurrent retries (mocked concurrency test)", async () => {
      let geminiCallCount = 0;
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockImplementation(async () => {
        geminiCallCount++;
        await new Promise((r) => setTimeout(r, 20));
        return {
          text: JSON.stringify({
            score: 8.0,
            technicalCorrectness: 4,
            completeness: 4,
            clarity: 4,
            practicalDepth: 4,
            tradeoffAwareness: 4,
            correctConcepts: ["Retry success"],
            missingConcepts: [],
            incorrectStatements: [],
            clarityAssessment: "Good",
            depthAssessment: "Good",
            improvementAdvice: "None",
            idealAnswer: "Ideal",
            followUpQuestions: [],
          }),
          model: "gemini-2.5-flash",
        };
      });

      let currentStatus: "failed" | "evaluating" | "evaluated" = "failed";
      const qRecordState: Record<string, unknown> = {
        id: "iq-concurrent-retry",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "What is an atomic compare-and-swap?",
        user_answer: "Hardware-level atomic instruction.",
        evaluation_status: currentStatus,
      };

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { id: "session-1", status: "in_progress", category: "Technical" },
                error: null,
              }),
              update: vi.fn().mockReturnThis(),
            };
          }
          if (table === "interview_questions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockResolvedValue({ data: [qRecordState], error: null }),
              single: vi.fn().mockImplementation(async () => ({
                data: { ...qRecordState, evaluation_status: currentStatus },
                error: null,
              })),
              update: vi.fn((payload: Record<string, unknown>) => {
                return {
                  eq: vi.fn().mockReturnThis(),
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockImplementation(async () => {
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                  maybeSingle: vi.fn().mockImplementation(async () => {
                    if (payload.evaluation_status === "evaluating") {
                      if (currentStatus === "failed") {
                        currentStatus = "evaluating";
                        qRecordState.evaluation_status = "evaluating";
                        return { data: qRecordState, error: null };
                      }
                      return { data: null, error: null };
                    }
                    Object.assign(qRecordState, payload);
                    return { data: qRecordState, error: null };
                  }),
                };
              }),
            };
          }
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { expected_answer_points: [], sample_answer: "Sample" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new MockInterviewService(mockSupabase);

      const [res1, res2] = await Promise.allSettled([
        service.retryEvaluation("user-1", "session-1", "iq-concurrent-retry"),
        service.retryEvaluation("user-1", "session-1", "iq-concurrent-retry"),
      ]);

      const fulfilled = [res1, res2].filter((r) => r.status === "fulfilled");
      const rejected = [res1, res2].filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect(geminiCallCount).toBe(1);

      geminiSpy.mockRestore();
    });
  });

  describe("4. L-05: Prompt Boundary Measurement and Zero Fabrication", () => {
    it("enforces MAX_PROMPT_LENGTH at the final combined prompt boundary", () => {
      // Test with massive input strings
      const hugeResume = "A".repeat(50_000);
      const hugeJd = "B".repeat(50_000);
      const hugeCompany = "C".repeat(1_000);
      const hugeRole = "D".repeat(1_000);

      const finalPrompt = buildAnalysisPrompt({
        resumeText: hugeResume,
        resumeVersion: "v1",
        jdText: hugeJd,
        company: hugeCompany,
        roleTitle: hugeRole,
      });

      expect(finalPrompt.length).toBeLessThanOrEqual(MAX_PROMPT_LENGTH);
    });

    it("throws AiServiceError on completely empty or malformed model responses without fabricating reports", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockResolvedValue({
        text: "This is not JSON at all, completely conversational text without json objects.",
        model: "gemini-2.5-flash",
      });

      await expect(
        generateAiResumeJdAnalysis({
          resumeText: "Java engineer",
          resumeVersion: "v1",
          jdText: "Looking for Java dev",
          company: "Acme",
          roleTitle: "SDE",
        })
      ).rejects.toThrow("AI analysis response was malformed or could not be parsed as valid JSON.");

      geminiSpy.mockRestore();
    });

    it("throws AiServiceError on schema-invalid JSON without fabricating placeholder fallback fields", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockResolvedValue({
        // Valid JSON but completely missing required schema keys
        text: JSON.stringify({ randomField: 123 }),
        model: "gemini-2.5-flash",
      });

      await expect(
        generateAiResumeJdAnalysis({
          resumeText: "Java engineer",
          resumeVersion: "v1",
          jdText: "Looking for Java dev",
          company: "Acme",
          roleTitle: "SDE",
        })
      ).rejects.toThrow("AI analysis response was malformed or failed schema validation");

      geminiSpy.mockRestore();
    });
  });

  describe("5. L-06: Strict Real Calendar Date Validation", () => {
    it("accepts valid calendar dates", () => {
      expect(isValidCalendarDate("2026-02-28")).toBe(true);
      expect(isValidCalendarDate("2026-11-20")).toBe(true);
      expect(isValidCalendarDate("2026-12-31")).toBe(true);
      expect(isValidCalendarDate("2026-01-01")).toBe(true);
    });

    it("accepts real leap-year day 2028-02-29", () => {
      expect(isValidCalendarDate("2028-02-29")).toBe(true);
      expect(isValidCalendarDate("2024-02-29")).toBe(true);
    });

    it("rejects non-leap-year February 29th (2026-02-29, 2027-02-29)", () => {
      expect(isValidCalendarDate("2026-02-29")).toBe(false);
      expect(isValidCalendarDate("2027-02-29")).toBe(false);
      expect(isValidCalendarDate("2025-02-29")).toBe(false);
    });

    it("rejects impossible calendar dates (2026-02-31, 2026-04-31, 2026-13-01, 2026-00-10)", () => {
      expect(isValidCalendarDate("2026-02-30")).toBe(false);
      expect(isValidCalendarDate("2026-02-31")).toBe(false);
      expect(isValidCalendarDate("2026-04-31")).toBe(false); // April has 30 days
      expect(isValidCalendarDate("2026-06-31")).toBe(false); // June has 30 days
      expect(isValidCalendarDate("2026-09-31")).toBe(false); // September has 30 days
      expect(isValidCalendarDate("2026-11-31")).toBe(false); // November has 30 days
      expect(isValidCalendarDate("2026-13-01")).toBe(false); // Invalid month 13
      expect(isValidCalendarDate("2026-00-10")).toBe(false); // Invalid month 00
      expect(isValidCalendarDate("2026-05-00")).toBe(false); // Invalid day 00
      expect(isValidCalendarDate("2026-05-32")).toBe(false); // Invalid day 32
    });

    it("enforces calendarDateSchema on recommendation action inputs", () => {
      const valid = generateRecommendationsInputSchema.safeParse({ targetDate: "2026-02-28" });
      expect(valid.success).toBe(true);

      const leapValid = generateRecommendationsInputSchema.safeParse({ targetDate: "2028-02-29" });
      expect(leapValid.success).toBe(true);

      const impossible = generateRecommendationsInputSchema.safeParse({ targetDate: "2026-02-31" });
      expect(impossible.success).toBe(false);

      const nonLeap = generateRecommendationsInputSchema.safeParse({ targetDate: "2027-02-29" });
      expect(nonLeap.success).toBe(false);
    });
  });

  describe("6. L-07: Supported Category Taxonomy & Batch Candidate Deduplication", () => {
    it("maps representative modules to supported categories in taskCategorySchema", () => {
      const supportedCategories = taskCategorySchema.options;

      const javaCat = deriveModuleCategory({ course_name: "Java Masterclass", title: "Concurrency" });
      expect(supportedCategories).toContain(javaCat);
      expect(javaCat).toBe("java");

      const springCat = deriveModuleCategory({ course_name: "Spring Boot in Action", title: "Microservices with Spring" });
      expect(supportedCategories).toContain(springCat);
      expect(springCat).toBe("spring_boot");

      const designCat = deriveModuleCategory({ course_name: "System Design Interview", title: "Distributed Architecture" });
      expect(supportedCategories).toContain(designCat);
      expect(designCat).toBe("system_design");

      const csCat = deriveModuleCategory({ course_name: "Computer Science", title: "Operating Systems Fundamentals" });
      expect(supportedCategories).toContain(csCat);
      expect(csCat).toBe("cs_fundamentals");

      const unknownCat = deriveModuleCategory({ course_name: "Specialized Topic", title: "Uncommon Subject" });
      expect(supportedCategories).toContain(unknownCat);
      expect(unknownCat).toBe("other");
    });

    it("prevents duplicate candidates within the same generated recommendation batch", async () => {
      const geminiSpy = vi.spyOn(GeminiService.prototype, "generateContent").mockResolvedValue({
        text: JSON.stringify({
          advisorHeadline: "Test",
          recommendations: [],
        }),
        model: "gemini-2.5-flash",
      });
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "profiles") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { daily_available_minutes: 60, target_roles: ["Java Developer"] },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "study_plans") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                          data: { id: "plan-1", status: "active" },
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "study_tasks") {
            const queryBuilder: Record<string, unknown> = {};
            queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
            queryBuilder.order = vi.fn().mockReturnValue(queryBuilder);
            queryBuilder.then = (resolve: (val: unknown) => unknown) =>
              Promise.resolve({ data: [], error: null }).then(resolve);
            return {
              select: vi.fn().mockReturnValue(queryBuilder),
            };
          }
          if (table === "dsa_revision_schedules") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "learning_topics") {
            const builder: Record<string, unknown> = {};
            builder.order = vi.fn().mockReturnValue(builder);
            builder.then = (resolve: (val: unknown) => unknown) =>
              Promise.resolve({
                data: [
                  // Two topics with identical names
                  { id: "top-1", name: "Spring Security", category: "Spring", priority: "high", assessment_status: "needs_work", confidence_score: 1 },
                  { id: "top-2", name: "Spring Security", category: "Spring", priority: "high", assessment_status: "needs_work", confidence_score: 1 },
                ],
                error: null,
              }).then(resolve);

            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(builder),
              }),
            };
          }
          if (table === "learning_modules") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new StudyRecommendationService(mockSupabase);
      const res = await service.generateRecommendations("user-1", { targetDate: "2026-11-20" });

      // Only one recommendation for "Spring Security" should be present; the duplicate must be deduplicated
      const springSecRecs = res.recommendations.filter((r) => r.title.includes("Spring Security"));
      expect(springSecRecs.length).toBe(1);

      geminiSpy.mockRestore();
    });
  });

  describe("7. L-09: Sidebar Product Status Accuracy", () => {
    it("displays accurate product status in sidebar instead of misleading phase labels", () => {
      const sidebarPath = path.resolve(process.cwd(), "src/components/layout/sidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8");

      expect(content).toContain("Workspace Ready");
      expect(content).not.toContain("Phase 1 Active");
      expect(content).not.toContain("Phase 4 Active");
    });

    it("verifies in-memory rate limiter documentation explains multi-instance serverless constraints", () => {
      const limiterPath = path.resolve(process.cwd(), "src/features/ai/rate-limiter.ts");
      const content = fs.readFileSync(limiterPath, "utf-8");

      expect(content).toContain("Serverless / Multi-Instance Limitation (Finding L-09)");
      expect(content).toContain("Monolithic / Zero-Dependency");
      expect(content).toContain("Distributed Production Evolution Path");
    });
  });
});
