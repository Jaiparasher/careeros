import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  rawGeminiAdvisorOutputSchema,
  acceptRecommendationInputSchema,
  type StudyActionCandidate,
} from "@/features/planner/recommendation-schema";
import {
  extractJsonFromAdvisorText,
  rankAndExplainStudyCandidates,
} from "@/features/planner/recommendation-advisor";
import { StudyRecommendationService } from "@/features/planner/recommendation-service";
import { geminiService, aiRateLimiter } from "@/features/ai";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Phase 4 Batch 4 Unit Tests: AI Study Recommendations & Adaptive Advisor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Schema & JSON Extraction Validation", () => {
    it("extracts clean JSON from raw text with markdown fences", () => {
      const raw = "```json\n{\"advisorHeadline\": \"Test Headline\", \"recommendations\": []}\n```";
      expect(extractJsonFromAdvisorText(raw)).toBe(
        "{\"advisorHeadline\": \"Test Headline\", \"recommendations\": []}"
      );
    });

    it("extracts JSON embedded inside prose without fences", () => {
      const raw = "Here are recommendations:\n{\"advisorHeadline\": \"Focus Today\", \"recommendations\": []}\nHope this helps!";
      expect(extractJsonFromAdvisorText(raw)).toBe(
        "{\"advisorHeadline\": \"Focus Today\", \"recommendations\": []}"
      );
    });

    it("validates valid advisor output schema", () => {
      const payload = {
        advisorHeadline: "Overdue Concurrency & Spring Gaps",
        recommendations: [
          {
            candidateId: "dsa_rev_1",
            priority: "high",
            reason: "This problem is 3 days overdue and critical for Java backend interviews.",
            expectedOutcome: "Master lock-free synchronization patterns.",
            suggestedDurationMinutes: 25,
          },
        ],
      };
      const result = rawGeminiAdvisorOutputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("enforces maximum 3 recommendations at schema boundary", () => {
      const payload = {
        advisorHeadline: "Overloaded Recommendations",
        recommendations: [
          { candidateId: "c1", priority: "high", reason: "Reason 1111111111", expectedOutcome: "Outcome 11111111", suggestedDurationMinutes: 20 },
          { candidateId: "c2", priority: "high", reason: "Reason 2222222222", expectedOutcome: "Outcome 22222222", suggestedDurationMinutes: 20 },
          { candidateId: "c3", priority: "medium", reason: "Reason 3333333333", expectedOutcome: "Outcome 33333333", suggestedDurationMinutes: 20 },
          { candidateId: "c4", priority: "low", reason: "Reason 4444444444", expectedOutcome: "Outcome 44444444", suggestedDurationMinutes: 20 },
        ],
      };
      const result = rawGeminiAdvisorOutputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at most 3");
      }
    });

    it("validates acceptRecommendationInputSchema rejecting invalid inputs", () => {
      const invalid = {
        candidateId: "",
        type: "unknown_type",
        title: "T",
      };
      const result = acceptRecommendationInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("2. Deterministic Candidate Ranking & Hallucination Defense", () => {
    const mockCandidates: StudyActionCandidate[] = [
      {
        id: "dsa_rev_1",
        type: "dsa_revision",
        title: "Revise LRU Cache",
        topicOrSkill: "Linked List / Hash Table",
        estimatedMinutes: 30,
        urgencyScore: 135, // Overdue revision (high urgency)
        category: "dsa",
        context: "2 days overdue",
        entityId: "q_lru_123",
      },
      {
        id: "topic_spring_sec",
        type: "weak_topic",
        title: "Strengthen Spring Security",
        topicOrSkill: "Spring Security",
        estimatedMinutes: 35,
        urgencyScore: 75, // Weak topic
        category: "spring_boot",
        context: "Needs work, confidence 1/5",
        entityId: "top_sec_456",
      },
      {
        id: "module_kafka",
        type: "incomplete_module",
        title: "Progress Kafka Streams",
        topicOrSkill: "Event-Driven Architecture",
        estimatedMinutes: 40,
        urgencyScore: 55, // Incomplete module
        category: "spring_boot",
        context: "40% complete",
        entityId: "mod_kafka_789",
      },
      {
        id: "module_docker",
        type: "incomplete_module",
        title: "Progress Docker Containers",
        topicOrSkill: "DevOps",
        estimatedMinutes: 40,
        urgencyScore: 45,
        category: "other",
        context: "20% complete",
        entityId: "mod_docker_101",
      },
    ];

    it("returns empty array when candidate pool is empty", async () => {
      const result = await rankAndExplainStudyCandidates({
        targetRoles: ["Java Backend Developer"],
        dailyAvailableMinutes: 120,
        remainingCapacityMinutes: 120,
        candidates: [],
      });
      expect(result.recommendations).toEqual([]);
      expect(result.generationSource).toBe("gemini");
    });

    it("rejects hallucinated candidate IDs generated by AI and filters strictly to valid candidates", async () => {
      // Mock Gemini returning 1 valid ID and 1 hallucinated ID not present in candidates
      geminiService.generateContent = vi.fn().mockResolvedValue({
        text: JSON.stringify({
          advisorHeadline: "Targeted Revision",
          recommendations: [
            {
              candidateId: "dsa_rev_1", // VALID
              priority: "high",
              reason: "LRU cache is critical for system design and coding rounds.",
              expectedOutcome: "Master O(1) get and put implementation.",
            },
            {
              candidateId: "hallucinated_quantum_algo_999", // HALLUCINATED!
              priority: "high",
              reason: "Invented study action not in user curriculum.",
              expectedOutcome: "Unknown outcome with more characters.",
            },
          ],
        }),
      } as unknown as Awaited<ReturnType<typeof geminiService.generateContent>>);

      const result = await rankAndExplainStudyCandidates({
        targetRoles: ["Java Backend Developer"],
        dailyAvailableMinutes: 120,
        remainingCapacityMinutes: 120,
        candidates: mockCandidates,
      });

      expect(result.generationSource).toBe("gemini");
      expect(result.fallbackReason).toBeNull();
      expect(result.recommendations.length).toBe(1);
      expect(result.recommendations[0]?.candidateId).toBe("dsa_rev_1");
      expect(result.recommendations[0]?.title).toBe("Revise LRU Cache");
      expect(result.recommendations[0]?.source).toBe("gemini");
      // Hallucinated ID must be rejected!
      expect(result.recommendations.find((r) => r.candidateId === "hallucinated_quantum_algo_999")).toBeUndefined();
    });

    it("falls back to deterministic urgency ranking if Gemini times out", async () => {
      geminiService.generateContent = vi.fn().mockRejectedValue(new Error("AI_REQUEST_TIMEOUT: Gemini request timed out"));

      const result = await rankAndExplainStudyCandidates({
        targetRoles: ["Java Backend Developer"],
        dailyAvailableMinutes: 120,
        remainingCapacityMinutes: 120,
        candidates: mockCandidates,
      });

      expect(result.generationSource).toBe("deterministic_fallback");
      expect(result.fallbackReason).toContain("timed out");
      expect(result.recommendations.length).toBe(3);
      expect(result.recommendations[0]?.candidateId).toBe("dsa_rev_1"); // score 135
      expect(result.recommendations[1]?.candidateId).toBe("topic_spring_sec"); // score 75
      expect(result.recommendations[2]?.candidateId).toBe("module_kafka"); // score 55
      expect(result.recommendations[0]?.source).toBe("deterministic_fallback");
      expect(result.recommendations[0]?.priority).toBe("high");
      expect(result.recommendations[0]?.isAccepted).toBe(false);
    });

    it("falls back to deterministic ranking if GEMINI_API_KEY is not configured", async () => {
      geminiService.generateContent = vi.fn().mockRejectedValue(new Error("GEMINI_API_KEY is not configured"));

      const result = await rankAndExplainStudyCandidates({
        targetRoles: ["Java Backend Developer"],
        dailyAvailableMinutes: 120,
        remainingCapacityMinutes: 120,
        candidates: mockCandidates,
      });

      expect(result.generationSource).toBe("deterministic_fallback");
      expect(result.fallbackReason).toContain("Gemini API key is not configured");
      expect(result.recommendations.length).toBe(3);
      expect(result.recommendations[0]?.source).toBe("deterministic_fallback");
    });

    it("falls back to deterministic ranking if Gemini returns malformed JSON", async () => {
      geminiService.generateContent = vi.fn().mockResolvedValue({
        text: "Sorry, I cannot generate recommendations right now. Here is some text {not valid json",
      } as unknown as Awaited<ReturnType<typeof geminiService.generateContent>>);

      const result = await rankAndExplainStudyCandidates({
        targetRoles: ["Java Backend Developer"],
        dailyAvailableMinutes: 120,
        remainingCapacityMinutes: 120,
        candidates: mockCandidates,
      });

      expect(result.generationSource).toBe("deterministic_fallback");
      expect(result.fallbackReason).toContain("malformed JSON");
      expect(result.recommendations.length).toBe(3);
    });

    it("falls back to deterministic ranking if Gemini output violates schema constraints", async () => {
      // More than 3 recommendations violates .max(3) schema rule
      geminiService.generateContent = vi.fn().mockResolvedValue({
        text: JSON.stringify({
          advisorHeadline: "Overloaded",
          recommendations: [
            { candidateId: "c1", priority: "high", reason: "Reason 11111111", expectedOutcome: "Outcome 111111" },
            { candidateId: "c2", priority: "high", reason: "Reason 22222222", expectedOutcome: "Outcome 222222" },
            { candidateId: "c3", priority: "medium", reason: "Reason 33333333", expectedOutcome: "Outcome 333333" },
            { candidateId: "c4", priority: "low", reason: "Reason 44444444", expectedOutcome: "Outcome 444444" },
          ],
        }),
      } as unknown as Awaited<ReturnType<typeof geminiService.generateContent>>);

      const result = await rankAndExplainStudyCandidates({
        targetRoles: ["Java Backend Developer"],
        dailyAvailableMinutes: 120,
        remainingCapacityMinutes: 120,
        candidates: mockCandidates,
      });

      expect(result.generationSource).toBe("deterministic_fallback");
      expect(result.fallbackReason).toContain("schema constraints");
      expect(result.recommendations.length).toBe(3);
    });
  });

  describe("3. Deterministic Task Scheduling & Duplicate Prevention", () => {
    it("creates a study task only upon explicit user acceptance", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "task-uuid-1",
          user_id: "user-1",
          title: "Revise DSA: LRU Cache",
          category: "dsa",
          planned_for: "2026-11-16",
          status: "pending",
          estimated_minutes: 25,
          priority: "high",
        },
        error: null,
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "study_tasks") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: mockSingle,
                }),
              }),
            };
          }
          if (table === "study_plans") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              limit: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "plan-uuid-1", status: "active" },
                error: null,
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new StudyRecommendationService(mockSupabase);

      const createdTask = await service.acceptRecommendation("user-1", {
        candidateId: "dsa_rev_1",
        type: "dsa_revision",
        title: "Revise DSA: LRU Cache",
        category: "dsa",
        entityId: "q_lru_123",
        priority: "high",
        estimatedMinutes: 25,
        reason: "Overdue revision",
        expectedOutcome: "Master LRU Cache",
        plannedFor: "2026-11-16",
      });

      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBe("task-uuid-1");
      expect(createdTask.title).toBe("Revise DSA: LRU Cache");
    });

    it("guarantees idempotency: returns existing task if user double-clicks accept", async () => {
      const mockExisting = [{ id: "existing-task-999", title: "Revise DSA: LRU Cache", status: "pending" }];

      const createChain = (data: unknown, error: unknown = null) => {
        const obj: Record<string, unknown> = { data, error };
        obj.select = vi.fn().mockReturnValue(obj);
        obj.eq = vi.fn().mockReturnValue(obj);
        obj.order = vi.fn().mockReturnValue(obj);
        obj.limit = vi.fn().mockReturnValue(obj);
        obj.single = vi.fn().mockResolvedValue({
          data: Array.isArray(data) ? data[0] : data,
          error,
        });
        obj.maybeSingle = vi.fn().mockResolvedValue({
          data: Array.isArray(data) ? data[0] : data,
          error,
        });
        return obj;
      };

      const tasksChain = createChain(mockExisting);
      tasksChain.insert = vi.fn(); // MUST NOT BE CALLED!

      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "function not found" } }),
        from: vi.fn((table: string) => {
          if (table === "study_tasks") return tasksChain;
          return createChain(null);
        }),
      } as unknown as SupabaseClient;

      const service = new StudyRecommendationService(mockSupabase);

      const task = await service.acceptRecommendation("user-1", {
        candidateId: "dsa_rev_1",
        type: "dsa_revision",
        title: "Revise DSA: LRU Cache",
        category: "dsa",
        entityId: "q_lru_123",
        priority: "high",
        estimatedMinutes: 25,
        plannedFor: "2026-11-16",
      });

      expect(task).toBeDefined();
      expect(task.id).toBe("existing-task-999");
      // insert was not called on study_tasks because it already existed!
      expect(tasksChain.insert).not.toHaveBeenCalled();
    });

    it("safely recovers from concurrent unique constraint conflict (error 23505) and returns existing task", async () => {
      const conflictTask = {
        id: "task-concurrent-winner",
        user_id: "user-1",
        title: "Revise DSA: LRU Cache",
        planned_for: "2026-11-16",
        idempotency_key: "rec:dsa_revision:q_lru_123:2026-11-16",
        status: "pending",
      };

      const createChain = (data: unknown, error: unknown = null) => {
        const obj: Record<string, unknown> = { data, error };
        obj.select = vi.fn().mockReturnValue(obj);
        obj.eq = vi.fn().mockReturnValue(obj);
        obj.order = vi.fn().mockReturnValue(obj);
        obj.limit = vi.fn().mockReturnValue(obj);
        obj.single = vi.fn().mockResolvedValue({
          data: Array.isArray(data) ? data[0] : data,
          error,
        });
        obj.maybeSingle = vi.fn().mockResolvedValue({
          data: Array.isArray(data) ? data[0] : data,
          error,
        });
        return obj;
      };

      let selectCount = 0;
      const tasksChain: Record<string, unknown> = {
        select: vi.fn().mockImplementation(() => {
          selectCount++;
          // First select is read-check (empty array)
          // Second select is conflict-recovery (returns the winning task)
          return createChain(selectCount === 1 ? [] : conflictTask);
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: "23505",
                message: 'duplicate key value violates unique constraint "study_tasks_user_idempotency_idx"',
              },
            }),
          }),
        }),
      };

      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "function not found" } }),
        from: vi.fn((table: string) => {
          if (table === "study_tasks") return tasksChain;
          return createChain(null);
        }),
      } as unknown as SupabaseClient;

      const service = new StudyRecommendationService(mockSupabase);

      const task = await service.acceptRecommendation("user-1", {
        candidateId: "dsa_rev_1",
        type: "dsa_revision",
        title: "Revise DSA: LRU Cache",
        category: "dsa",
        entityId: "q_lru_123",
        priority: "high",
        estimatedMinutes: 25,
        plannedFor: "2026-11-16",
      });

      expect(task).toBeDefined();
      expect(task.id).toBe("task-concurrent-winner");
    });

    it("respects sliding window rate limit and throws friendly error when limit exceeded", async () => {
      // Mock rate limiter returning allowed: false
      const checkSpy = vi.spyOn(aiRateLimiter, "check").mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
        retryAfterSeconds: 30,
      });

      const mockSupabase = {} as unknown as SupabaseClient;
      const service = new StudyRecommendationService(mockSupabase);

      await expect(service.generateRecommendations("user-rate-limited")).rejects.toThrow(
        "AI rate limit exceeded. Please try again in 30 seconds."
      );

      checkSpy.mockRestore();
    });
  });
});
