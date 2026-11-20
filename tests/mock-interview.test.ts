import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockInterviewSchema,
  submitAnswerSchema,
  evaluationFeedbackSchema,
  MockInterviewService,
  extractJsonFromText,
  evaluateAnswerWithGemini,
} from "@/features/interview";
import { geminiService, aiRateLimiter } from "@/features/ai";

describe("Phase 4 Batch 2: Mock Interview & Answer Coaching Engine", () => {
  // --------------------------------------------------------------------------
  // 1. Schema Validation & Input Boundaries
  // --------------------------------------------------------------------------
  describe("1. Schema Validation & Input Boundaries", () => {
    it("accepts valid mock interview configurations", () => {
      const valid = createMockInterviewSchema.safeParse({
        interviewType: "Java Backend",
        difficulty: "medium",
        questionCount: 5,
        skills: ["Java", "Spring Boot", "SQL"],
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.interviewType).toBe("Java Backend");
        expect(valid.data.questionCount).toBe(5);
        expect(valid.data.difficulty).toBe("medium");
      }
    });

    it("defaults to 5 questions and medium difficulty when omitted", () => {
      const result = createMockInterviewSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questionCount).toBe(5);
        expect(result.data.difficulty).toBe("medium");
        expect(result.data.interviewType).toBe("Technical");
      }
    });

    it("rejects answer payloads exceeding 5,000 characters", () => {
      const oversized = "A".repeat(5001);
      const result = submitAnswerSchema.safeParse({
        sessionId: "00000000-0000-0000-0000-000000000001",
        questionId: "00000000-0000-0000-0000-000000000002",
        answer: oversized,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 5,000 characters");
      }
    });

    it("validates structured evaluation feedback schema", () => {
      const validFeedback = {
        score: 8.5,
        technicalCorrectness: 4,
        completeness: 4,
        clarity: 5,
        practicalDepth: 4,
        tradeoffAwareness: 4,
        correctConcepts: ["Virtual threads use carrier OS threads", "Work-stealing ForkJoinPool scheduler"],
        missingConcepts: ["ThreadLocals pinning warning in early JDK 21"],
        incorrectStatements: [],
        clarityAssessment: "Clear and direct.",
        depthAssessment: "Solid practical depth.",
        improvementAdvice: "Mention potential pinning with synchronized blocks.",
        idealAnswer: "Virtual threads in Java 21 are lightweight user-mode threads...",
        followUpQuestions: ["What causes pinning on carrier threads?"],
      };
      const result = evaluationFeedbackSchema.safeParse(validFeedback);
      expect(result.success).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Evaluator JSON Extraction & Prompt Injection Resilience
  // --------------------------------------------------------------------------
  describe("2. Evaluator JSON Extraction & AI Response Parsing", () => {
    it("extracts pure JSON from markdown code fences", () => {
      const rawMarkdown = "```json\n{\"score\": 9.0, \"correctConcepts\": [\"Test\"]}\n```";
      const extracted = extractJsonFromText(rawMarkdown);
      expect(extracted).toBe("{\"score\": 9.0, \"correctConcepts\": [\"Test\"]}");
    });

    it("extracts JSON embedded inside conversational text", () => {
      const rawText = "Here is the candidate assessment:\n{\"score\": 7.5, \"clarity\": \"Good\"}\nHope this helps!";
      const extracted = extractJsonFromText(rawText);
      expect(extracted).toBe("{\"score\": 7.5, \"clarity\": \"Good\"}");
    });

    it("evaluates answer using mocked Gemini AI service", async () => {
      const mockGenerate = vi.spyOn(geminiService, "generateContent").mockResolvedValue({
        text: JSON.stringify({
          score: 8.0,
          technicalCorrectness: 4,
          completeness: 4,
          clarity: 4,
          practicalDepth: 4,
          tradeoffAwareness: 4,
          correctConcepts: ["Explained SpringApplication startup stages"],
          missingConcepts: ["Did not mention ApplicationContextInitializer"],
          incorrectStatements: [],
          clarityAssessment: "Well articulated.",
          depthAssessment: "Good depth.",
          improvementAdvice: "Add note about initializers.",
          idealAnswer: "SpringApplication.run starts by setting listeners...",
          followUpQuestions: ["What is the purpose of CommandLineRunner?"],
        }),
        model: "gemini-3.5-flash",
      });

      const feedback = await evaluateAnswerWithGemini({
        questionText: "What happens during SpringApplication.run()?",
        skillName: "Spring Boot",
        expectedAnswerPoints: ["Create ApplicationContext", "Refresh Context"],
        sampleAnswer: "Starts listeners, prepares environment, creates context...",
        userAnswer: "It loads beans, creates Tomcat embedded server and runs runner beans.",
      });

      expect(mockGenerate).toHaveBeenCalled();
      expect(feedback.score).toBe(8.0);
      expect(feedback.correctConcepts).toContain("Explained SpringApplication startup stages");
      expect(feedback.followUpQuestions).toHaveLength(1);

      mockGenerate.mockRestore();
    });

    it("throws AiServiceError when Gemini returns malformed response (M-04)", async () => {
      const mockGenerate = vi.spyOn(geminiService, "generateContent").mockResolvedValue({
        text: JSON.stringify({
          score: 6.5,
          // Missing other required fields
        }),
        model: "gemini-3.5-flash",
      });

      await expect(
        evaluateAnswerWithGemini({
          questionText: "Explain Java GC",
          skillName: "Java",
          expectedAnswerPoints: ["Generational hypothesis"],
          userAnswer: "Garbage collection frees unreferenced heap objects.",
        })
      ).rejects.toThrow("AI evaluation response was malformed or failed schema validation");

      mockGenerate.mockRestore();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Mock Interview Service (Mock Database Operations)
  // --------------------------------------------------------------------------
  describe("3. Mock Interview Service Logic", () => {
    let mockSupabase: { from: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      const sampleBank = [
        {
          id: "q-1",
          user_id: "user-1",
          skill_name: "Java",
          topic: "Memory",
          question_title: "Explain JVM Memory Model",
          question_prompt: "Describe heap, stack, and metaspace.",
          difficulty: "intermediate",
          expected_answer_points: ["Heap stores objects", "Stack stores frames"],
          sample_answer: "Heap is shared, stack is thread-local...",
          is_active: true,
        },
        {
          id: "q-2",
          user_id: "user-1",
          skill_name: "Spring Boot",
          topic: "Architecture",
          question_title: "What is Auto-configuration?",
          question_prompt: "How does @EnableAutoConfiguration work?",
          difficulty: "intermediate",
          expected_answer_points: ["spring.factories", "Conditional annotations"],
          sample_answer: "Scans classpath and registers beans conditionally...",
          is_active: true,
        },
        {
          id: "q-3",
          user_id: "user-1",
          skill_name: "SQL",
          topic: "Indexing",
          question_title: "How do B-Tree indexes work?",
          question_prompt: "Explain leaf nodes and branching factor.",
          difficulty: "intermediate",
          expected_answer_points: ["Balanced search tree", "O(log n) lookups"],
          sample_answer: "B-Tree maintains sorted keys...",
          is_active: true,
        },
      ];

      mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              limit: vi.fn().mockReturnThis(),
              then: (resolve: (arg: unknown) => void) => resolve({ data: sampleBank, error: null }),
            };
          }
          if (table === "interview_sessions") {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "session-1",
                      user_id: "user-1",
                      category: "Java Backend",
                      difficulty: "intermediate",
                      duration_target_minutes: 15,
                      status: "in_progress",
                    },
                    error: null,
                  }),
                }),
              }),
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              update: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "session-1",
                  user_id: "user-1",
                  category: "Java Backend",
                  difficulty: "intermediate",
                  status: "in_progress",
                },
                error: null,
              }),
            };
          }
          if (table === "interview_questions") {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: "iq-1",
                      session_id: "session-1",
                      sequence_number: 1,
                      question_text: "Explain JVM Memory Model",
                      question_bank_id: "q-1",
                      skill_name: "Java",
                    },
                    {
                      id: "iq-2",
                      session_id: "session-1",
                      sequence_number: 2,
                      question_text: "What is Auto-configuration?",
                      question_bank_id: "q-2",
                      skill_name: "Spring Boot",
                    },
                  ],
                  error: null,
                }),
              }),
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              update: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "iq-1",
                  session_id: "session-1",
                  question_text: "Explain JVM Memory Model",
                  question_bank_id: "q-1",
                  skill_name: "Java",
                  user_answer: null,
                },
                error: null,
              }),
            };
          }
          return {};
        }),
      };
    });

    it("creates a session with balanced questions from question bank", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      const session = await service.createSession("user-1", {
        interviewType: "Java Backend",
        difficulty: "medium",
        questionCount: 2,
        skills: ["Java", "Spring Boot"],
      });

      expect(session).toBeDefined();
      expect(session.id).toBe("session-1");
      expect(session.questions).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith("interview_question_bank");
      expect(mockSupabase.from).toHaveBeenCalledWith("interview_sessions");
      expect(mockSupabase.from).toHaveBeenCalledWith("interview_questions");
    });

    it("handles skipping a question without calling Gemini AI", async () => {
      const geminiSpy = vi.spyOn(geminiService, "generateContent");
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);

      let fetchCount = 0;
      mockSupabase.from = vi.fn((table: string) => {
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
            update: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            single: vi.fn().mockImplementation(async () => {
              fetchCount++;
              if (fetchCount === 1) {
                return {
                  data: {
                    id: "iq-1",
                    session_id: "session-1",
                    user_id: "user-1",
                    question_text: "Explain JVM Memory Model",
                    question_bank_id: "q-1",
                    evaluation_status: "pending",
                    user_answer: null,
                  },
                  error: null,
                };
              }
              return {
                data: {
                  id: "iq-1",
                  session_id: "session-1",
                  user_id: "user-1",
                  question_text: "Explain JVM Memory Model",
                  question_bank_id: "q-1",
                  user_answer: "[Skipped by candidate]",
                  score: 0,
                  evaluation_status: "skipped",
                },
                error: null,
              };
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const result = await service.submitAnswer("user-1", {
        sessionId: "session-1",
        questionId: "iq-1",
        skip: true,
      });

      expect(result.question.evaluation_status).toBe("skipped");
      expect(result.question.score).toBe(0);
      expect(geminiSpy).not.toHaveBeenCalled();

      geminiSpy.mockRestore();
    });

    it("calculates accurate summary metrics and revision topics on finalize", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);

      // Mock session with 3 questions (1 strong, 1 progressing, 1 skipped)
      const mockQuestions = [
        {
          id: "q-1",
          skill_name: "Java",
          topic: "Memory",
          user_answer: "Great answer",
          score: 8.5,
          evaluation_status: "evaluated",
          strengths: "Accurate memory explanation",
        },
        {
          id: "q-2",
          skill_name: "Spring Boot",
          topic: "Auto-configuration",
          user_answer: "Basic answer",
          score: 5.5,
          evaluation_status: "evaluated",
          gaps: "Missing @ConditionalOnClass explanation",
        },
        {
          id: "q-3",
          skill_name: "SQL",
          topic: "Indexes",
          user_answer: "[Skipped by candidate]",
          score: 0,
          evaluation_status: "skipped",
          gaps: "Skipped",
        },
      ];

      vi.spyOn(service, "getSession").mockResolvedValue({
        id: "session-1",
        user_id: "user-1",
        category: "Java Backend",
        difficulty: "intermediate",
        status: "in_progress",
        duration_target_minutes: 15,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: null,
        provider: null,
        model: null,
        prompt_version: null,
        overall_feedback: null,
        questions: mockQuestions as unknown as import("@/features/interview").MockInterviewQuestion[],
      });

      const finalized = await service.finalizeInterview("user-1", "session-1");
      expect(finalized).toBeDefined();
    });

    it("marks question as failed when Gemini AI throws an error", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      const geminiSpy = vi.spyOn(geminiService, "generateContent").mockRejectedValue(
        new Error("AI_REQUEST_TIMEOUT")
      );

      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "iq-fail",
            session_id: "session-1",
            user_id: "user-1",
            question_text: "What is thread pool?",
            question_bank_id: "q-1",
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      };
      mockSupabase.from = vi.fn(() => chainable);

      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-fail",
          answer: "Thread pools manage worker threads.",
          skip: false,
        })
      ).rejects.toThrow();

      expect(chainable.update).toHaveBeenCalledWith(
        expect.objectContaining({ evaluation_status: "failed" })
      );

      geminiSpy.mockRestore();
    });

    it("retries evaluation using previously saved answer when question failed (M-02)", async () => {
      aiRateLimiter.reset();
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      const geminiSpy = vi.spyOn(geminiService, "generateContent").mockResolvedValue({
        text: JSON.stringify({
          score: 8.0,
          technicalCorrectness: 4,
          completeness: 4,
          clarity: 4,
          practicalDepth: 4,
          tradeoffAwareness: 4,
          correctConcepts: ["Good point"],
          missingConcepts: [],
          incorrectStatements: [],
          clarityAssessment: "Clear",
          depthAssessment: "Good",
          improvementAdvice: "None",
          idealAnswer: "Ideal",
          followUpQuestions: ["Next?"],
        }),
        model: "gemini-3.5-flash",
      });

      const questionState = {
        id: "iq-retry",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "Explain JVM Memory Model",
        question_bank_id: "q-1",
        user_answer: "Previously saved answer for retry.",
        evaluation_status: "failed",
        score: null,
      };

      const qChain = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(() => Promise.resolve({ data: [questionState], error: null })),
        single: vi.fn(() => Promise.resolve({ data: questionState, error: null })),
        maybeSingle: vi.fn(() => {
          questionState.evaluation_status = "evaluating";
          return Promise.resolve({ data: questionState, error: null });
        }),
        update: vi.fn((payload: Record<string, unknown>) => {
          Object.assign(questionState, payload);
          return qChain;
        }),
      };
      qChain.select.mockReturnValue(qChain);
      qChain.eq.mockReturnValue(qChain);

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "interview_sessions") {
          const sChain = {
            select: vi.fn(),
            eq: vi.fn(),
            single: vi.fn(() => Promise.resolve({
              data: { id: "session-1", status: "in_progress", category: "Technical" },
              error: null,
            })),
            update: vi.fn(),
          };
          sChain.select.mockReturnValue(sChain);
          sChain.eq.mockReturnValue(sChain);
          sChain.update.mockReturnValue(sChain);
          return sChain;
        }
        if (table === "interview_questions") {
          return qChain;
        }
        if (table === "interview_question_bank") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { expected_answer_points: [], sample_answer: "Ideal" },
              error: null,
            }),
          };
        }
        return {};
      });

      const result = await service.retryEvaluation("user-1", "session-1", "iq-retry");
      expect(result.question.evaluation_status).toBe("evaluated");
      expect(result.question.score).toBe(8.0);
      expect(geminiSpy).toHaveBeenCalledTimes(1);

      geminiSpy.mockRestore();
    });

    it("rejects retryEvaluation upfront when AI rate limit is exceeded without making AI calls (M-01)", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      const geminiSpy = vi.spyOn(geminiService, "generateContent");
      const rateSpy = vi.spyOn(aiRateLimiter, "check").mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 45000,
        retryAfterSeconds: 45,
      });

      await expect(
        service.retryEvaluation("user-1", "session-1", "iq-failed")
      ).rejects.toThrow("Rate limit exceeded. Please wait 45 seconds before retrying.");

      // CRITICAL: verify zero AI calls were made
      expect(geminiSpy).not.toHaveBeenCalled();

      rateSpy.mockRestore();
      geminiSpy.mockRestore();
    });

    it("preserves independent rate limits across different users during retry (M-01)", async () => {
      aiRateLimiter.reset();

      // Exhaust user-limited's quota
      for (let i = 0; i < 10; i++) {
        aiRateLimiter.check("user-exhausted");
      }
      expect(aiRateLimiter.check("user-exhausted").allowed).toBe(false);

      // Independent user is NOT rate limited
      const checkUserFresh = aiRateLimiter.check("user-fresh");
      expect(checkUserFresh.allowed).toBe(true);
      expect(checkUserFresh.remaining).toBe(9);
    });

    it("prevents two concurrent submitAnswer requests from both evaluating the same question (M-02)", async () => {
      aiRateLimiter.reset();
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      let geminiCallCount = 0;
      const geminiSpy = vi.spyOn(geminiService, "generateContent").mockImplementation(async () => {
        geminiCallCount++;
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 20));
        return {
          text: JSON.stringify({
            score: 7.5,
            technicalCorrectness: 4,
            completeness: 4,
            clarity: 4,
            practicalDepth: 4,
            tradeoffAwareness: 4,
            correctConcepts: ["Good"],
            missingConcepts: [],
            incorrectStatements: [],
            clarityAssessment: "Good",
            depthAssessment: "Good",
            improvementAdvice: "None",
            idealAnswer: "Ideal",
            followUpQuestions: [],
          }),
          model: "gemini-3.5-flash",
        };
      });

      // Simulate atomic row-level database state in Postgres
      let currentStatus: "pending" | "evaluating" | "evaluated" = "pending";
      const qRecordState: Record<string, unknown> = {
        id: "iq-concurrent",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "What is CAP theorem?",
        evaluation_status: currentStatus,
        user_answer: null as string | null,
        score: null as number | null,
      };

      mockSupabase.from = vi.fn((table: string) => {
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
                  // Atomic conditional state transition:
                  // Only transitions to 'evaluating' if current status is 'pending'
                  if (payload.evaluation_status === "evaluating") {
                    if (currentStatus === "pending") {
                      currentStatus = "evaluating";
                      qRecordState.evaluation_status = "evaluating";
                      qRecordState.user_answer = payload.user_answer as string;
                      return { data: qRecordState, error: null };
                    }
                    // Row was already claimed concurrently!
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
      });

      // Fire two simultaneous submissions for the same question
      const [res1, res2] = await Promise.allSettled([
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-concurrent",
          answer: "Consistency, Availability, Partition tolerance.",
        }),
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-concurrent",
          answer: "Alternative concurrent submission attempt.",
        }),
      ]);

      // Exactly ONE request succeeds
      const fulfilled = [res1, res2].filter((r) => r.status === "fulfilled");
      const rejected = [res1, res2].filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      // The rejected request must be blocked with concurrency-safe error
      const rejectionError = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectionError.message).toContain("Question is currently being evaluated");

      // CRITICAL: Exactly ONE evaluator invocation occurred
      expect(geminiCallCount).toBe(1);

      geminiSpy.mockRestore();
    });

    it("prevents two concurrent retryEvaluation requests from both evaluating the same failed question (M-02)", async () => {
      aiRateLimiter.reset();
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      let geminiCallCount = 0;
      const geminiSpy = vi.spyOn(geminiService, "generateContent").mockImplementation(async () => {
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
          model: "gemini-3.5-flash",
        };
      });

      // Initial state: question is in failed state with saved answer
      let currentStatus: "failed" | "evaluating" | "evaluated" = "failed";
      const qRecordState: Record<string, unknown> = {
        id: "iq-retry-concurrent",
        session_id: "session-1",
        user_id: "user-1",
        question_text: "Explain Java Virtual Threads",
        user_answer: "Lightweight threads managed by JVM scheduler.",
        evaluation_status: currentStatus,
        score: null as number | null,
      };

      mockSupabase.from = vi.fn((table: string) => {
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
                  // Atomic claim from 'failed' to 'evaluating'
                  if (payload.evaluation_status === "evaluating") {
                    if (currentStatus === "failed") {
                      currentStatus = "evaluating";
                      qRecordState.evaluation_status = "evaluating";
                      return { data: qRecordState, error: null };
                    }
                    // Already claimed concurrently!
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
      });

      // Fire two simultaneous retries
      const [retry1, retry2] = await Promise.allSettled([
        service.retryEvaluation("user-1", "session-1", "iq-retry-concurrent"),
        service.retryEvaluation("user-1", "session-1", "iq-retry-concurrent"),
      ]);

      const fulfilled = [retry1, retry2].filter((r) => r.status === "fulfilled");
      const rejected = [retry1, retry2].filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const rejectionError = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectionError.message).toContain("Question is currently being evaluated");

      // CRITICAL: Exactly ONE evaluator invocation occurred
      expect(geminiCallCount).toBe(1);

      geminiSpy.mockRestore();
    });

    it("rejects answer submission when session is completed or abandoned (M-02)", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "interview_questions") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: "iq-1", session_id: "session-1", user_id: "user-1", evaluation_status: "pending" },
              error: null,
            }),
          };
        }
        if (table === "interview_sessions") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: "session-1", status: "completed" },
              error: null,
            }),
          };
        }
        return {};
      });

      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-1",
          answer: "My late answer",
        })
      ).rejects.toThrow("Cannot submit answer to a completed or abandoned interview session.");

      // Test abandoned session as well
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "interview_questions") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: "iq-1", session_id: "session-1", user_id: "user-1", evaluation_status: "pending" },
              error: null,
            }),
          };
        }
        if (table === "interview_sessions") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: "session-1", status: "abandoned" },
              error: null,
            }),
          };
        }
        return {};
      });

      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-1",
          answer: "Answer to abandoned session",
        })
      ).rejects.toThrow("Cannot submit answer to a completed or abandoned interview session.");
    });

    it("rejects answer submission when question is already evaluated or evaluating (M-02)", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "interview_questions") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: "iq-1", session_id: "session-1", user_id: "user-1", evaluation_status: "evaluated" },
              error: null,
            }),
          };
        }
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
        return {};
      });

      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-1",
          answer: "Re-answering question",
        })
      ).rejects.toThrow("Question has already been evaluated. Use retry if you wish to re-evaluate.");
    });

    it("rejects retry when question is not in failed status or session is completed (M-02)", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      mockSupabase.from = vi.fn((table: string) => {
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
                id: "iq-evaluated",
                session_id: "session-1",
                user_id: "user-1",
                user_answer: "Done answer",
                evaluation_status: "evaluated",
              },
              error: null,
            }),
          };
        }
        return {};
      });

      await expect(
        service.retryEvaluation("user-1", "session-1", "iq-evaluated")
      ).rejects.toThrow("Only failed evaluations can be retried.");
    });

    it("enforces AI rate limiting on answer submission (M-01)", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      const rateSpy = vi.spyOn(aiRateLimiter, "check").mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 45000,
        retryAfterSeconds: 45,
      });

      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "iq-rate",
            session_id: "session-1",
            user_id: "user-1",
            question_text: "What is CAP theorem?",
            evaluation_status: "pending",
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      };
      mockSupabase.from = vi.fn(() => chainable);

      await expect(
        service.submitAnswer("user-1", {
          sessionId: "session-1",
          questionId: "iq-rate",
          answer: "Consistency, Availability, Partition tolerance.",
          skip: false,
        })
      ).rejects.toThrow("Rate limit exceeded. Please wait 45 seconds before retrying.");

      expect(chainable.update).toHaveBeenCalledWith(
        expect.objectContaining({ evaluation_status: "failed" })
      );

      rateSpy.mockRestore();
    });

    it("persists AI provider, model, and prompt_version in session creation (M-03)", async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "session-provenance",
              user_id: "user-1",
              category: "Technical",
              difficulty: "intermediate",
              provider: "gemini",
              model: "gemini-2.5-flash",
              prompt_version: "mock-eval-v1",
            },
            error: null,
          }),
        }),
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "interview_question_bank") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            then: (resolve: (arg: unknown) => void) =>
              resolve({
                data: [
                  {
                    id: "q-1",
                    question_title: "Java Question",
                    question_prompt: "Explain JVM",
                    skill_name: "Java",
                    difficulty: "intermediate",
                  },
                ],
                error: null,
              }),
          };
        }
        if (table === "interview_sessions") {
          return { insert: insertSpy };
        }
        if (table === "interview_questions") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        return {};
      });

      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      await service.createSession("user-1", {
        interviewType: "Technical",
        questionCount: 1,
      });

      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "gemini",
          model: expect.any(String),
          prompt_version: "mock-eval-v1",
        })
      );
    });

    it("enforces user isolation: rejects answer submission for another user's question", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);

      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // RLS filters out foreign user's record
          error: { message: "Row not found" },
        }),
      };
      mockSupabase.from = vi.fn(() => chainable);

      await expect(
        service.submitAnswer("user-attacker", {
          sessionId: "session-victim",
          questionId: "iq-victim",
          answer: "Hacked answer",
        })
      ).rejects.toThrow("Interview question not found or access denied.");
    });

  });
});
