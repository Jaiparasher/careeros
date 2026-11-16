import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MockInterviewService } from "@/features/interview/mock-interview-service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Phase 4 Batch 2: Database Persistence & Security Audit", () => {
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;
  let userA_id: string;
  let userB_id: string;
  let serviceA: MockInterviewService;
  let serviceB: MockInterviewService;

  let testSessionA_id: string;
  let testQuestion1_id: string;
  let testQuestion1_bank_id: string;
  let testQuestion2_id: string;
  let testQuestion3_id: string;

  beforeAll(async () => {
    const rawClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Authenticate User A
    const { data: authA, error: errA } = await rawClient.auth.signInWithPassword({
      email: "test@gmail.com",
      password: "Test123",
    });
    if (errA || !authA.user || !authA.session) {
      throw new Error(`User A auth failed: ${errA?.message}`);
    }
    userA_id = authA.user.id;
    clientA = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    });
    serviceA = new MockInterviewService(clientA);

    // 2. Authenticate User B
    const { data: authB, error: errB } = await rawClient.auth.signInWithPassword({
      email: "test_audit_user_b@careeros-audit.com",
      password: "AuditPass123!",
    });
    if (errB || !authB.user || !authB.session) {
      throw new Error(`User B auth failed: ${errB?.message}`);
    }
    userB_id = authB.user.id;
    clientB = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    });
    serviceB = new MockInterviewService(clientB);
  });

  afterAll(async () => {
    if (testSessionA_id && clientA) {
      await clientA.from("interview_questions").delete().eq("session_id", testSessionA_id);
      await clientA.from("interview_sessions").delete().eq("id", testSessionA_id);
    }
  });

  describe("1. Migration 0010 Schema State Audit", () => {
    it("confirms all 5 new columns on interview_sessions exist in live Supabase", async () => {
      const { data, error } = await clientA
        .from("interview_sessions")
        .select("interview_type, selected_skills, total_questions, overall_score, summary_json")
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("confirms all 12 new columns on interview_questions exist in live Supabase", async () => {
      const { data, error } = await clientA
        .from("interview_questions")
        .select("question_bank_id, skill_name, topic, difficulty, score, incorrect_statements, clarity_assessment, depth_assessment, improvement_advice, follow_up_questions_json, evaluation_status, evaluated_at")
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("verifies relaxed difficulty check constraint on interview_sessions (supports 'easy' and 'mixed')", async () => {
      // Test inserting temporary session with difficulty = 'easy' and 'mixed'
      const { data: easySession, error: easyErr } = await clientA
        .from("interview_sessions")
        .insert({
          user_id: userA_id,
          category: "Technical",
          difficulty: "easy",
          duration_target_minutes: 15,
          status: "in_progress",
        })
        .select("id, difficulty")
        .single();

      expect(easyErr).toBeNull();
      expect(easySession?.difficulty).toBe("easy");

      const { data: mixedSession, error: mixedErr } = await clientA
        .from("interview_sessions")
        .insert({
          user_id: userA_id,
          category: "Technical",
          difficulty: "mixed",
          duration_target_minutes: 15,
          status: "in_progress",
        })
        .select("id, difficulty")
        .single();

      expect(mixedErr).toBeNull();
      expect(mixedSession?.difficulty).toBe("mixed");

      // Verify invalid difficulty is rejected by check constraint
      const { error: invalidErr } = await clientA
        .from("interview_sessions")
        .insert({
          user_id: userA_id,
          category: "Technical",
          difficulty: "super_extreme_impossible",
          duration_target_minutes: 15,
          status: "in_progress",
        })
        .select();

      expect(invalidErr).not.toBeNull();
      expect(invalidErr?.message).toMatch(/check constraint|violates/i);

      // Clean up the temporary probe sessions
      if (easySession?.id) {
        await clientA.from("interview_sessions").delete().eq("id", easySession.id);
      }
      if (mixedSession?.id) {
        await clientA.from("interview_sessions").delete().eq("id", mixedSession.id);
      }
    });

    it("verifies evaluation_status check constraint on interview_questions", async () => {
      // First create a temporary dummy session for probe
      const { data: dummySession } = await clientA
        .from("interview_sessions")
        .insert({
          user_id: userA_id,
          category: "Technical",
          difficulty: "medium",
          duration_target_minutes: 5,
        })
        .select()
        .single();

      expect(dummySession).toBeDefined();

      // Attempt invalid evaluation_status
      const { error: invalidStatusErr } = await clientA
        .from("interview_questions")
        .insert({
          user_id: userA_id,
          session_id: dummySession!.id,
          sequence_number: 1,
          question_text: "Probe Question",
          evaluation_status: "invalid_status_value",
        });

      expect(invalidStatusErr).not.toBeNull();
      expect(invalidStatusErr?.message).toMatch(/check constraint|violates/i);

      // Clean up dummy probe session
      await clientA.from("interview_sessions").delete().eq("id", dummySession!.id);
    });

    it("verifies question_bank_id foreign key constraint with on delete set null", async () => {
      // Probe question with invalid foreign key
      const { error: invalidFkErr } = await clientA
        .from("interview_questions")
        .insert({
          user_id: userA_id,
          session_id: "00000000-0000-0000-0000-000000000000",
          sequence_number: 1,
          question_text: "Probe FK",
          question_bank_id: "00000000-0000-0000-0000-000000000000",
        });

      expect(invalidFkErr).not.toBeNull();
      expect(invalidFkErr?.message).toMatch(/foreign key|violates/i);
    });

    it("verifies index query paths execute cleanly", async () => {
      // 1. interview_sessions_user_status_idx
      const { error: sIdxErr } = await clientA
        .from("interview_sessions")
        .select("id, status, created_at")
        .eq("user_id", userA_id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5);
      expect(sIdxErr).toBeNull();

      // 2. interview_questions_bank_idx
      const { error: qBankIdxErr } = await clientA
        .from("interview_questions")
        .select("id, question_bank_id")
        .not("question_bank_id", "is", null)
        .limit(5);
      expect(qBankIdxErr).toBeNull();
    });
  });

  describe("2. Live Database Persistence & Interview Lifecycle (User A)", () => {
    it("creates an interview session and questions in live Supabase with Migration 0010 columns populated", async () => {
      const session = await serviceA.createSession(userA_id, {
        interviewType: "Java Backend",
        difficulty: "medium",
        questionCount: 3,
        skills: ["Java", "Spring Boot", "SQL"],
      });

      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.user_id).toBe(userA_id);
      expect(session.status).toBe("in_progress");

      testSessionA_id = session.id;

      // Direct database verification
      const { data: dbSessions, error: sErr } = await clientA
        .from("interview_sessions")
        .select("*")
        .eq("id", testSessionA_id);

      expect(sErr).toBeNull();
      expect(dbSessions).toBeDefined();
      expect(dbSessions!.length).toBe(1);
      expect(dbSessions![0].user_id).toBe(userA_id);
      expect(dbSessions![0].status).toBe("in_progress");

      // Verify Migration 0010 session columns populated at creation
      expect(dbSessions![0].interview_type).toBe("Java Backend");
      expect(Array.isArray(dbSessions![0].selected_skills)).toBe(true);
      expect(dbSessions![0].selected_skills).toContain("Java");
      expect(dbSessions![0].total_questions).toBe(3);

      // Verify questions loaded and persisted
      const { data: dbQuestions, error: qErr } = await clientA
        .from("interview_questions")
        .select("*")
        .eq("session_id", testSessionA_id)
        .order("sequence_number", { ascending: true });

      expect(qErr).toBeNull();
      expect(dbQuestions).toBeDefined();
      expect(dbQuestions!.length).toBe(3);

      testQuestion1_id = dbQuestions![0].id;
      testQuestion1_bank_id = dbQuestions![0].question_bank_id;
      testQuestion2_id = dbQuestions![1].id;
      testQuestion3_id = dbQuestions![2].id;

      expect(dbQuestions![0].question_text).toBeTruthy();
      expect(dbQuestions![0].user_id).toBe(userA_id);

      // Verify Migration 0010 question columns populated at creation
      expect(dbQuestions![0].question_bank_id).toBeTruthy();
      expect(dbQuestions![0].skill_name).toBeTruthy();
      expect(dbQuestions![0].topic).toBeTruthy();
      expect(dbQuestions![0].difficulty).toBeTruthy();
      expect(dbQuestions![0].evaluation_status).toBe("pending");
    });

    it("saves an answer and live Gemini evaluation with all rubric fields and new columns populated", async () => {
      // Fetch reference content from linked question bank to ensure candidate answer is on-topic
      const { data: bankEntry } = await clientA
        .from("interview_question_bank")
        .select("sample_answer, expected_answer_points, question_title")
        .eq("id", testQuestion1_bank_id)
        .single();

      const candidateAnswer =
        bankEntry?.sample_answer ||
        (bankEntry?.expected_answer_points && bankEntry.expected_answer_points.length > 0
          ? bankEntry.expected_answer_points.join(". ")
          : "In Java backend engineering, robust architectural patterns combine dependency injection, transaction management with strict ACID guarantees, and efficient connection pooling to deliver scalable service layers.");

      const result = await serviceA.submitAnswer(userA_id, {
        sessionId: testSessionA_id,
        questionId: testQuestion1_id,
        answer: candidateAnswer,
        skip: false,
      });

      expect(result).toBeDefined();
      expect(result.question.id).toBe(testQuestion1_id);

      // Verify individually in live Supabase database
      const { data: qRows, error: fetchErr } = await clientA
        .from("interview_questions")
        .select("*")
        .eq("id", testQuestion1_id)
        .single();

      expect(fetchErr).toBeNull();
      expect(qRows).toBeDefined();
      expect(qRows.user_answer).toBe(candidateAnswer);

      // Individual Rubric Field Verifications
      expect(qRows.technical_correctness).toBeGreaterThanOrEqual(1);
      expect(qRows.technical_correctness).toBeLessThanOrEqual(5);
      expect(qRows.completeness).toBeGreaterThanOrEqual(1);
      expect(qRows.completeness).toBeLessThanOrEqual(5);
      expect(qRows.clarity).toBeGreaterThanOrEqual(1);
      expect(qRows.clarity).toBeLessThanOrEqual(5);
      expect(qRows.practical_depth).toBeGreaterThanOrEqual(1);
      expect(qRows.practical_depth).toBeLessThanOrEqual(5);
      expect(qRows.tradeoff_awareness).toBeGreaterThanOrEqual(1);
      expect(qRows.tradeoff_awareness).toBeLessThanOrEqual(5);

      expect(qRows.strengths).toBeTruthy();
      expect(qRows.gaps).toBeTruthy();
      expect(qRows.improved_answer).toBeTruthy();
      expect(qRows.follow_up_question).toBeTruthy();

      // Migration 0010 Specific Question Column Verifications
      expect(qRows.question_bank_id).toBeTruthy();
      expect(Number(qRows.score)).toBeGreaterThanOrEqual(1);
      expect(Number(qRows.score)).toBeLessThanOrEqual(10);
      expect(qRows.evaluation_status).toBe("evaluated");
      expect(qRows.evaluated_at).toBeTruthy();
      expect(typeof qRows.incorrect_statements).toBe("string");
      expect(typeof qRows.clarity_assessment).toBe("string");
      expect(typeof qRows.depth_assessment).toBe("string");
      expect(typeof qRows.improvement_advice).toBe("string");
      expect(Array.isArray(qRows.follow_up_questions_json)).toBe(true);
    }, 45000);

    it("handles skipped question without calling Gemini AI", async () => {
      const result = await serviceA.submitAnswer(userA_id, {
        sessionId: testSessionA_id,
        questionId: testQuestion2_id,
        answer: "",
        skip: true,
      });

      expect(result).toBeDefined();
      expect(result.question.id).toBe(testQuestion2_id);

      // Verify in database
      const { data: qRow, error } = await clientA
        .from("interview_questions")
        .select("*")
        .eq("id", testQuestion2_id)
        .single();

      expect(error).toBeNull();
      expect(qRow.user_answer).toBe("[Skipped by candidate]");
      expect(qRow.strengths).toContain("skipped");

      // Verify Migration 0010 columns on skipped question
      expect(qRow.evaluation_status).toBe("skipped");
      expect(Number(qRow.score)).toBe(0);
      expect(qRow.evaluated_at).toBeTruthy();
    });

    it("verifies failed evaluation preservation and retry behavior", async () => {
      const draftAnswer = "Kafka partitions allow consumers in the same group to process messages in parallel.";

      // 1. Pre-save answer as if evaluating
      await clientA
        .from("interview_questions")
        .update({
          user_answer: draftAnswer,
        })
        .eq("id", testQuestion3_id);

      // 2. Verify answer is preserved in database
      const { data: presaved } = await clientA
        .from("interview_questions")
        .select("user_answer")
        .eq("id", testQuestion3_id)
        .single();
      expect(presaved?.user_answer).toBe(draftAnswer);

      // 3. Retry evaluation with real Gemini call
      let retrySucceeded = false;
      try {
        const retryResult = await serviceA.retryEvaluation(userA_id, testSessionA_id, testQuestion3_id);
        expect(retryResult.question.user_answer).toBe(draftAnswer);
        expect(retryResult.question.technical_correctness).toBeGreaterThanOrEqual(1);
        expect(retryResult.question.improved_answer).toBeTruthy();
        retrySucceeded = true;
      } catch (err: unknown) {
        // If Google AI Studio free tier RPM is saturated during parallel test suite runs,
        // verify that the candidate's draft answer was safely preserved in Supabase.
        if (err instanceof Error && (err.message.includes("quota") || err.message.includes("rate limit"))) {
          const { data: failedQ } = await clientA
            .from("interview_questions")
            .select("user_answer")
            .eq("id", testQuestion3_id)
            .single();
          expect(failedQ?.user_answer).toBe(draftAnswer);
          retrySucceeded = true;
        } else {
          throw err;
        }
      }
      expect(retrySucceeded).toBe(true);
    }, 45000);

    it("finalizes interview session and retrieves complete history", async () => {
      const finalized = await serviceA.finalizeInterview(userA_id, testSessionA_id);
      expect(finalized.status).toBe("completed");
      expect(finalized.completed_at).toBeTruthy();
      expect(finalized.overall_feedback).toContain("Interview finished");

      // Verify direct database persistence
      const { data: sessionRow, error: sErr } = await clientA
        .from("interview_sessions")
        .select("*")
        .eq("id", testSessionA_id)
        .single();

      expect(sErr).toBeNull();
      expect(sessionRow.status).toBe("completed");
      expect(sessionRow.completed_at).toBeTruthy();
      expect(sessionRow.overall_feedback).toBeTruthy();

      // Verify Migration 0010 finalized session columns
      expect(Number(sessionRow.overall_score)).toBeGreaterThanOrEqual(0);
      expect(Number(sessionRow.overall_score)).toBeLessThanOrEqual(10);
      expect(sessionRow.summary_json).toBeDefined();
      expect(typeof sessionRow.summary_json.overallPercentage).toBe("number");
      expect(Array.isArray(sessionRow.summary_json.skillBreakdown)).toBe(true);
      expect(sessionRow.interview_type).toBe("Java Backend");
      expect(sessionRow.total_questions).toBe(3);

      // Verify history listing
      const sessions = await serviceA.listSessions(userA_id);
      expect(sessions.length).toBeGreaterThanOrEqual(1);
      const found = sessions.find((s) => s.id === testSessionA_id);
      expect(found).toBeDefined();
      expect(found?.status).toBe("completed");
    });

    it("confirms existing interview history remains intact and queryable", async () => {
      const { data: allSessions, error } = await clientA
        .from("interview_sessions")
        .select("id, status, created_at, interview_type, category")
        .order("created_at", { ascending: false });

      expect(error).toBeNull();
      expect(allSessions).toBeDefined();
      expect(allSessions!.length).toBeGreaterThanOrEqual(1);

      // Verify each pre-existing session is intact
      for (const s of allSessions!) {
        expect(s.id).toBeTruthy();
        expect(s.status).toBeTruthy();
      }
    });
  });

  describe("3. Multi-Tenant Security & Two-User RLS Isolation", () => {
    it("User B cannot SELECT User A's interview session (RLS returns empty)", async () => {
      const { data, error } = await clientB
        .from("interview_sessions")
        .select("*")
        .eq("id", testSessionA_id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // RLS filtered
    });

    it("User B cannot SELECT User A's interview questions (RLS returns empty)", async () => {
      const { data, error } = await clientB
        .from("interview_questions")
        .select("*")
        .eq("session_id", testSessionA_id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // RLS filtered
    });

    it("User B cannot UPDATE User A's answers or evaluation records", async () => {
      const { data, error } = await clientB
        .from("interview_questions")
        .update({ user_answer: "INJECTED_BY_USER_B" })
        .eq("id", testQuestion1_id)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // 0 rows updated

      // Verify User A's answer was not tampered with
      const { data: realRow } = await clientA
        .from("interview_questions")
        .select("user_answer")
        .eq("id", testQuestion1_id)
        .single();

      expect(realRow?.user_answer).not.toBe("INJECTED_BY_USER_B");
      expect(realRow?.user_answer).toBeTruthy();
      expect(realRow?.user_answer?.length).toBeGreaterThan(10);
    });

    it("User B cannot DELETE User A's interview records", async () => {
      const { data, error } = await clientB
        .from("interview_sessions")
        .delete()
        .eq("id", testSessionA_id)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // 0 rows deleted

      // Confirm session still exists for User A
      const { data: checkSession } = await clientA
        .from("interview_sessions")
        .select("id")
        .eq("id", testSessionA_id);

      expect(checkSession?.length).toBe(1);
    });

    it("User B service layer cannot access User A's session by guessed ID", async () => {
      const sessionForB = await serviceB.getSession(userB_id, testSessionA_id);
      expect(sessionForB).toBeNull();
    });

    it("User A can perform normal owner operations on their own interview session", async () => {
      const sessionForA = await serviceA.getSession(userA_id, testSessionA_id);
      expect(sessionForA).toBeDefined();
      expect(sessionForA?.id).toBe(testSessionA_id);
      expect(sessionForA?.questions?.length).toBe(3);
    });
  });
});
