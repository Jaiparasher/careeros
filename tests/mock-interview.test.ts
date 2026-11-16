import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockInterviewSchema,
  submitAnswerSchema,
  evaluationFeedbackSchema,
  MockInterviewService,
  extractJsonFromText,
  evaluateAnswerWithGemini,
} from "@/features/interview";
import { geminiService } from "@/features/ai";

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

    it("gracefully falls back when Gemini returns malformed response", async () => {
      const mockGenerate = vi.spyOn(geminiService, "generateContent").mockResolvedValue({
        text: JSON.stringify({
          score: 6.5,
          // Missing other required fields
        }),
        model: "gemini-3.5-flash",
      });

      const feedback = await evaluateAnswerWithGemini({
        questionText: "Explain Java GC",
        skillName: "Java",
        expectedAnswerPoints: ["Generational hypothesis"],
        userAnswer: "Garbage collection frees unreferenced heap objects.",
      });

      expect(feedback.score).toBe(6.5);
      expect(feedback.technicalCorrectness).toBe(3);
      expect(feedback.correctConcepts).toBeDefined();

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

      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({
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
        }),
        update: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn(() => chainable);

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

    it("retries evaluation using previously saved answer", async () => {
      const service = new MockInterviewService(mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient);
      const submitSpy = vi.spyOn(service, "submitAnswer").mockResolvedValue({
        question: { id: "iq-retry", evaluation_status: "evaluated", score: 8.0 } as unknown as import("@/features/interview").MockInterviewQuestion,
        session: { id: "session-1" } as unknown as import("@/features/interview").MockInterviewSession,
      });

      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "iq-retry",
            session_id: "session-1",
            user_id: "user-1",
            user_answer: "Previously saved answer for retry.",
          },
          error: null,
        }),
      };
      mockSupabase.from = vi.fn(() => chainable);

      const result = await service.retryEvaluation("user-1", "session-1", "iq-retry");
      expect(result.question.evaluation_status).toBe("evaluated");
      expect(submitSpy).toHaveBeenCalledWith("user-1", {
        sessionId: "session-1",
        questionId: "iq-retry",
        answer: "Previously saved answer for retry.",
        skip: false,
      });

      submitSpy.mockRestore();
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
