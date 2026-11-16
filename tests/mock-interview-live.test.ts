import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MockInterviewService } from "@/features/interview/mock-interview-service";
import { geminiService } from "@/features/ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Phase 4 Batch 2 Live Smoke Test (Supabase + Gemini)", () => {
  let authedClient: SupabaseClient;
  let testUserId: string;
  let service: MockInterviewService;
  let createdSessionId: string | null = null;

  beforeAll(async () => {
    const rawClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: auth, error: authErr } = await rawClient.auth.signInWithPassword({
      email: "test@gmail.com",
      password: "Test123",
    });

    if (authErr || !auth.user || !auth.session) {
      throw new Error(`Auth failed: ${authErr?.message}`);
    }

    testUserId = auth.user.id;
    authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${auth.session.access_token}` } },
    });
    service = new MockInterviewService(authedClient);
  });

  afterAll(async () => {
    if (createdSessionId && authedClient) {
      // Clean up test session and related questions
      await authedClient.from("interview_questions").delete().eq("session_id", createdSessionId);
      await authedClient.from("interview_sessions").delete().eq("id", createdSessionId);
    }
  });

  it("verifies live Gemini AI service is configured and operational", () => {
    expect(geminiService.isConfigured()).toBe(true);
    expect(geminiService.getModel()).toBeTruthy();
  });

  it("creates a mock interview session selecting real questions from question bank", async () => {
    const session = await service.createSession(testUserId, {
      interviewType: "Java Backend",
      difficulty: "medium",
      questionCount: 3,
      skills: ["Java", "Spring Boot", "SQL"],
    });

    expect(session).toBeDefined();
    expect(session.id).toBeTruthy();
    expect(session.user_id).toBe(testUserId);
    expect(session.status).toBe("in_progress");

    createdSessionId = session.id;

    // Verify session details and questions loaded
    const loaded = await service.getSession(testUserId, session.id);
    expect(loaded).toBeDefined();
    expect(loaded?.questions).toBeDefined();
    expect(loaded?.questions?.length).toBe(3);
    expect(loaded?.questions?.[0].question_text).toBeTruthy();
  }, 15000);

  it("evaluates a candidate answer using live Gemini AI with rubric and feedback scoring", async () => {
    if (!createdSessionId) throw new Error("No session created");
    const session = await service.getSession(testUserId, createdSessionId);
    if (!session || !session.questions || session.questions.length === 0) {
      throw new Error("No questions in session");
    }

    const targetQuestion = session.questions[0];
    const candidateAnswer =
      "In Java backend architecture, Spring Boot uses dependency injection and inversion of control. " +
      "The application context manages bean lifecycles. For database access, Spring Data JPA / Hibernate provides " +
      "ORM abstractions, while transactions are managed using the @Transactional annotation to ensure ACID compliance.";

    const result = await service.submitAnswer(testUserId, {
      sessionId: createdSessionId,
      questionId: targetQuestion.id,
      answer: candidateAnswer,
      skip: false,
    });

    expect(result.question.user_answer).toBe(candidateAnswer);
    expect(result.question.technical_correctness).toBeGreaterThanOrEqual(1);
    expect(result.question.completeness).toBeGreaterThanOrEqual(1);
    expect(result.question.strengths).toBeTruthy();
    expect(result.question.improved_answer).toBeTruthy();
  }, 45000);

  it("handles skipping a question without calling Gemini AI", async () => {
    if (!createdSessionId) throw new Error("No session created");
    const session = await service.getSession(testUserId, createdSessionId);
    if (!session || !session.questions || session.questions.length < 2) {
      throw new Error("Not enough questions");
    }

    const targetQuestion = session.questions[1];
    const result = await service.submitAnswer(testUserId, {
      sessionId: createdSessionId,
      questionId: targetQuestion.id,
      answer: "",
      skip: true,
    });

    expect(result.question.user_answer).toBe("[Skipped by candidate]");
    expect(result.question.score).toBe(0);
    expect(result.question.strengths).toContain("skipped");
  }, 15000);

  it("finalizes interview session and calculates summary metrics & recommendations", async () => {
    if (!createdSessionId) throw new Error("No session created");

    const finalized = await service.finalizeInterview(testUserId, createdSessionId);
    expect(finalized.status).toBe("completed");
    expect(finalized.completed_at).toBeTruthy();
    expect(finalized.overall_feedback).toBeTruthy();
  }, 15000);
});
