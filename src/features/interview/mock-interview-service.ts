import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CreateMockInterviewInput,
  type SubmitAnswerInput,
  type MockInterviewSession,
  type MockInterviewQuestion,
  type EvaluationFeedback,
} from "./mock-interview-schema";
import { evaluateAnswerWithGemini } from "./mock-evaluator";
import { aiRateLimiter, AiServiceError, geminiService } from "@/features/ai";

interface QueryResultWithMaybeSingle {
  maybeSingle?: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>;
  single?: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>;
}

const TYPE_SKILL_MAP: Record<string, string[]> = {
  "Java Backend": [
    "Java",
    "Spring Boot",
    "Spring Framework / Spring Core",
    "Spring Security",
    "Hibernate and JPA",
    "Microservices",
    "REST APIs",
    "SQL",
    "MySQL",
    "PostgreSQL / pgvector (project experience)",
    "Apache Kafka",
    "Docker",
    "DBMS Fundamentals",
  ],
  "Full Stack": [
    "Java",
    "Spring Boot",
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "REST APIs",
    "SQL",
    "MongoDB",
    "Redux / Redux Toolkit",
  ],
  "Project-Based": [
    "Lovable AI Builder Project Deep Dive",
    "TCS E-Procurement Project Deep Dive",
    "Spring AI, RAG and Tool Calling",
    "JWT and Token Authentication",
    "WebSockets and Server-Sent Events",
    "Microservices",
    "Docker",
    "CI/CD and Deployment",
  ],
  "DSA": [
    "Java",
    "DBMS Fundamentals",
    "Low-Level Design",
    "High-Level Design",
    "Operating Systems",
    "Computer Networks",
  ],
  "Technical": [
    "Java",
    "Spring Boot",
    "SQL",
    "DBMS Fundamentals",
    "Microservices",
    "REST APIs",
    "Operating Systems",
    "Computer Networks",
    "Low-Level Design",
  ],
  "Mixed": [],
};

/**
 * Parses numeric interview question and session scores strictly within [0, 10].
 * Handles numbers, PostgreSQL numeric strings ("8.50"), and returns null for invalid/out-of-range values.
 */
export function parseScore(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num < 0 || num > 10) return null;
    return num;
  }
  if (typeof val === "number") {
    if (!Number.isFinite(val) || val < 0 || val > 10) return null;
    return val;
  }
  return null;
}

export class MockInterviewService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createSession(
    userId: string,
    input: CreateMockInterviewInput
  ): Promise<MockInterviewSession> {
    const questionCount = Number(input.questionCount) || 5;
    const durationTarget = questionCount * 3; // ~3 mins per question

    // 1. Determine target skills
    let targetSkills = input.skills && input.skills.length > 0 ? input.skills : [];
    if (targetSkills.length === 0 && input.interviewType) {
      targetSkills = TYPE_SKILL_MAP[input.interviewType] || [];
    }

    // 2. Query question bank for eligible questions
    let query = this.supabase
      .from("interview_question_bank")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (targetSkills.length > 0) {
      query = query.in("skill_name", targetSkills);
    }

    if (input.difficulty && input.difficulty !== "mixed") {
      const diffMap: Record<string, string> = {
        easy: "basic",
        medium: "intermediate",
        hard: "advanced",
      };
      const dbDiff = diffMap[input.difficulty] || input.difficulty;
      query = query.eq("difficulty", dbDiff);
    }

    const { data: bankQuestions, error: bankError } = await query;
    if (bankError) {
      throw new Error(`Failed to load interview question bank: ${bankError.message}`);
    }

    // If no questions matched strict criteria, fallback to any active question
    let pool = bankQuestions && bankQuestions.length > 0 ? [...bankQuestions] : [];
    if (pool.length < questionCount) {
      const { data: fallbackPool } = await this.supabase
        .from("interview_question_bank")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .limit(50);
      if (fallbackPool && fallbackPool.length > 0) {
        pool = fallbackPool;
      }
    }

    if (pool.length === 0) {
      throw new Error(
        "No questions available in the interview question bank. Please seed questions first."
      );
    }

    // 3. Balance questions across distinct skills
    const questionsBySkill = new Map<string, typeof pool>();
    for (const q of pool) {
      const skill = q.skill_name || "General";
      if (!questionsBySkill.has(skill)) {
        questionsBySkill.set(skill, []);
      }
      questionsBySkill.get(skill)!.push(q);
    }

    // Shuffle questions within each skill bucket
    for (const [, list] of questionsBySkill.entries()) {
      list.sort(() => Math.random() - 0.5);
    }

    const selectedBankQuestions: typeof pool = [];
    const skillKeys = Array.from(questionsBySkill.keys()).sort(() => Math.random() - 0.5);

    let round = 0;
    while (selectedBankQuestions.length < questionCount) {
      let addedInRound = false;
      for (const skill of skillKeys) {
        const list = questionsBySkill.get(skill)!;
        if (round < list.length && selectedBankQuestions.length < questionCount) {
          selectedBankQuestions.push(list[round]);
          addedInRound = true;
        }
      }
      if (!addedInRound) break;
      round++;
    }

    // If still short, fill from remaining pool
    if (selectedBankQuestions.length < questionCount) {
      const existingIds = new Set(selectedBankQuestions.map((q) => q.id));
      for (const q of pool) {
        if (!existingIds.has(q.id)) {
          selectedBankQuestions.push(q);
          if (selectedBankQuestions.length === questionCount) break;
        }
      }
    }

    // Map difficulty for backward-compatible check constraint ('beginner','intermediate','advanced')
    const difficultyForDb = input.difficulty === "easy"
      ? "beginner"
      : input.difficulty === "hard"
        ? "advanced"
        : "intermediate";

    // 4. Create interview_session row
    const sessionInsertPayload: Record<string, unknown> = {
      user_id: userId,
      category: input.interviewType || "Technical",
      difficulty: difficultyForDb,
      duration_target_minutes: durationTarget,
      status: "in_progress",
      interview_type: input.interviewType || "Technical",
      selected_skills: targetSkills,
      total_questions: selectedBankQuestions.length,
      provider: "gemini",
      model: geminiService.getModel(),
      prompt_version: "mock-eval-v1",
    };

    let sessionRecord: MockInterviewSession | null = null;
    const { data: newSession, error: sessionError } = await this.supabase
      .from("interview_sessions")
      .insert(sessionInsertPayload)
      .select()
      .single();

    if (sessionError) {
      // If extended columns fail due to migration pending, try basic schema
      const fallbackPayload = {
        user_id: userId,
        category: input.interviewType || "Technical",
        difficulty: difficultyForDb,
        duration_target_minutes: durationTarget,
        status: "in_progress",
        provider: "gemini",
        model: geminiService.getModel(),
        prompt_version: "mock-eval-v1",
      };
      const { data: fallbackSession, error: fallbackError } = await this.supabase
        .from("interview_sessions")
        .insert(fallbackPayload)
        .select()
        .single();

      if (fallbackError || !fallbackSession) {
        throw new Error(`Failed to create interview session: ${fallbackError?.message || sessionError.message}`);
      }
      sessionRecord = fallbackSession as MockInterviewSession;
    } else {
      sessionRecord = newSession as MockInterviewSession;
    }

    // 5. Insert questions into interview_questions
    const questionInserts = selectedBankQuestions.map((q, idx) => ({
      user_id: userId,
      session_id: sessionRecord!.id,
      sequence_number: idx + 1,
      question_text: q.question_title ? `${q.question_title}\n\n${q.question_prompt}` : q.question_prompt,
      question_bank_id: q.id,
      skill_name: q.skill_name,
      topic: q.topic,
      difficulty: q.difficulty,
      evaluation_status: "pending",
    }));

    const { data: insertedQuestions, error: qError } = await this.supabase
      .from("interview_questions")
      .insert(questionInserts)
      .select();

    if (qError) {
      // Fallback for base columns if migration 0010 not applied yet
      const fallbackQuestions = selectedBankQuestions.map((q, idx) => ({
        user_id: userId,
        session_id: sessionRecord!.id,
        sequence_number: idx + 1,
        question_text: q.question_title ? `${q.question_title}\n\n${q.question_prompt}` : q.question_prompt,
      }));
      const { data: fbQuestions, error: fbQError } = await this.supabase
        .from("interview_questions")
        .insert(fallbackQuestions)
        .select();

      if (fbQError || !fbQuestions) {
        throw new Error(`Failed to initialize interview questions: ${fbQError?.message || qError.message}`);
      }
      sessionRecord.questions = fbQuestions as MockInterviewQuestion[];
    } else {
      sessionRecord.questions = insertedQuestions as MockInterviewQuestion[];
    }

    return sessionRecord;
  }

  async getSession(
    userId: string,
    sessionId: string
  ): Promise<MockInterviewSession | null> {
    const { data: session, error } = await this.supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error || !session) {
      return null;
    }

    const { data: questions } = await this.supabase
      .from("interview_questions")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .order("sequence_number", { ascending: true });

    return {
      ...session,
      questions: questions || [],
    };
  }

  async listSessions(userId: string): Promise<MockInterviewSession[]> {
    const { data: sessions, error } = await this.supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !sessions) {
      return [];
    }

    return sessions;
  }

  async submitAnswer(
    userId: string,
    input: SubmitAnswerInput,
    options?: { isRetry?: boolean }
  ): Promise<{ question: MockInterviewQuestion; session: MockInterviewSession }> {
    const { sessionId, questionId, answer = "", skip = false } = input;
    const isRetry = Boolean(options?.isRetry);

    // 1. Fetch question
    const { data: qRecord, error: qErr } = await this.supabase
      .from("interview_questions")
      .select("*")
      .eq("id", questionId)
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .single();

    if (qErr || !qRecord) {
      throw new Error("Interview question not found or access denied.");
    }

    // 2. Fetch session
    const { data: session, error: sErr } = await this.supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sErr || !session) {
      throw new Error("Interview session not found.");
    }

    // 2b. Session status guard (M-02)
    if (session.status === "completed" || session.status === "abandoned") {
      throw new Error("Cannot submit answer to a completed or abandoned interview session.");
    }

    // 2c. Question evaluation status guard (M-02)
    if (qRecord.evaluation_status === "evaluating") {
      throw new Error("Question is currently being evaluated. Please wait.");
    }
    if (qRecord.evaluation_status === "evaluated") {
      throw new Error("Question has already been evaluated. Use retry if you wish to re-evaluate.");
    }
    if (qRecord.evaluation_status === "skipped") {
      throw new Error("Cannot submit answer to a skipped question.");
    }
    if (!isRetry && qRecord.evaluation_status === "failed") {
      throw new Error("Question evaluation previously failed. Use retry if you wish to re-evaluate.");
    }
    if (isRetry && qRecord.evaluation_status !== "failed") {
      throw new Error("Only failed evaluations can be retried.");
    }

    // 3. Fetch linked question bank entry (for rubric and expected points)
    let rubricPoints: string[] = [];
    let sampleAnswer: string | null = null;
    let skillName = qRecord.skill_name || session.category || "General";
    let topic = qRecord.topic || "";

    if (qRecord.question_bank_id) {
      const res = await this.supabase
        .from("interview_question_bank")
        .select("expected_answer_points, sample_answer, skill_name, topic, follow_up_questions")
        .eq("id", qRecord.question_bank_id)
        .single();

      const bankEntry = res?.data;
      if (bankEntry) {
        rubricPoints = Array.isArray(bankEntry.expected_answer_points)
          ? bankEntry.expected_answer_points
          : [];
        sampleAnswer = bankEntry.sample_answer;
        skillName = bankEntry.skill_name || skillName;
        topic = bankEntry.topic || topic;
      }
    }

    // 4. Handle SKIP
    if (skip) {
      const updateData: Record<string, unknown> = {
        user_answer: "[Skipped by candidate]",
        score: 0,
        technical_correctness: 1,
        completeness: 1,
        clarity: 1,
        practical_depth: 1,
        tradeoff_awareness: 1,
        strengths: "None - question skipped.",
        gaps: "Question was skipped by candidate.",
        improved_answer: sampleAnswer || "Review expected technical points.",
        evaluation_status: "skipped",
        evaluated_at: new Date().toISOString(),
      };

      // Atomic conditional update: only update if still pending or failed
      const skipQuery = this.supabase
        .from("interview_questions")
        .update(updateData)
        .eq("id", questionId)
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .select();

      const skipExecutor = skipQuery as unknown as QueryResultWithMaybeSingle;
      const { data: qRes, error: uErr } =
        typeof skipExecutor.maybeSingle === "function"
          ? await skipExecutor.maybeSingle()
          : typeof skipExecutor.single === "function"
            ? await skipExecutor.single()
            : await (skipQuery as unknown as Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>);

      if (uErr || !qRes) {
        const { data: checkQ } = await this.supabase
          .from("interview_questions")
          .select("evaluation_status")
          .eq("id", questionId)
          .eq("session_id", sessionId)
          .eq("user_id", userId)
          .single();

        if (checkQ?.evaluation_status === "evaluating") {
          throw new Error("Question is currently being evaluated. Please wait.");
        }
        if (checkQ?.evaluation_status === "evaluated") {
          throw new Error("Question has already been evaluated. Use retry if you wish to re-evaluate.");
        }
        if (checkQ?.evaluation_status === "skipped") {
          throw new Error("Cannot submit answer to a skipped question.");
        }
        throw new Error(`Failed to update skipped question: ${uErr?.message || "Concurrent update conflict."}`);
      }

      const updatedSession = await this.checkAndFinalizeSession(userId, sessionId);
      return { question: qRes as unknown as MockInterviewQuestion, session: updatedSession };
    }

    // 5. Handle SUBMIT ANSWER (or RETRY)
    // Atomic state claim: only ONE request can transition from eligible status to 'evaluating'
    // - A new submission may claim only an initial pending question (or NULL for legacy rows).
    // - A retry may claim only a failed question.
    // - A question already evaluating, evaluated, or skipped must never be claimed.
    let claimQuery = this.supabase
      .from("interview_questions")
      .update({
        user_answer: answer.trim(),
        evaluation_status: "evaluating",
      })
      .eq("id", questionId)
      .eq("session_id", sessionId)
      .eq("user_id", userId);

    if (isRetry) {
      // Retries can ONLY claim questions in 'failed' status
      claimQuery = claimQuery.eq("evaluation_status", "failed");
    } else if (qRecord.evaluation_status === null) {
      // Legacy pre-migration row where evaluation_status is NULL
      claimQuery =
        typeof claimQuery.is === "function"
          ? claimQuery.is("evaluation_status", null)
          : claimQuery.eq("evaluation_status", null as unknown as string);
    } else {
      // Normal submission can ONLY claim questions in 'pending' status
      claimQuery = claimQuery.eq("evaluation_status", "pending");
    }

    const claimExecutor = claimQuery.select() as unknown as QueryResultWithMaybeSingle;
    const { data: claimedRecord, error: claimErr } =
      typeof claimExecutor.maybeSingle === "function"
        ? await claimExecutor.maybeSingle()
        : typeof claimExecutor.single === "function"
          ? await claimExecutor.single()
          : await (claimQuery as unknown as Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>);

    if (claimErr || !claimedRecord) {
      // Concurrency check: another concurrent request claimed or completed the question
      const { data: freshQ } = await this.supabase
        .from("interview_questions")
        .select("evaluation_status")
        .eq("id", questionId)
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .single();

      if (freshQ?.evaluation_status === "evaluating") {
        throw new Error("Question is currently being evaluated. Please wait.");
      }
      if (freshQ?.evaluation_status === "evaluated") {
        throw new Error("Question has already been evaluated. Use retry if you wish to re-evaluate.");
      }
      if (freshQ?.evaluation_status === "skipped") {
        throw new Error("Cannot submit answer to a skipped question.");
      }
      throw new Error(isRetry ? "Only failed evaluations can be retried." : "Question is not eligible for evaluation.");
    }

    let evaluation: EvaluationFeedback;
    try {
      const rateLimit = aiRateLimiter.check(userId);
      if (!rateLimit.allowed) {
        throw new AiServiceError(
          `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before retrying.`,
          "RATE_LIMITED",
          429
        );
      }

      evaluation = await evaluateAnswerWithGemini({
        questionText: qRecord.question_text,
        skillName,
        topic,
        expectedAnswerPoints: rubricPoints,
        sampleAnswer,
        userAnswer: answer.trim(),
      });
    } catch (err: unknown) {
      // Mark as failed so user can see retry button
      await this.supabase
        .from("interview_questions")
        .update({
          evaluation_status: "failed",
        })
        .eq("id", questionId)
        .eq("user_id", userId);

      throw err;
    }

    // Format strengths and gaps for database storage
    const strengthsText = evaluation.correctConcepts.length > 0
      ? evaluation.correctConcepts.join("; ")
      : "Basic response attempted.";

    const gapsText = [
      ...evaluation.missingConcepts.map((m) => `Missing: ${m}`),
      ...evaluation.incorrectStatements.map((i) => `Correction: ${i}`),
    ].join("; ") || "Minor refinements only.";

    const primaryFollowUp =
      evaluation.followUpQuestions[0] ||
      "How would you handle edge cases for this implementation in production?";

    const fullUpdatePayload: Record<string, unknown> = {
      user_answer: answer.trim(),
      score: evaluation.score,
      technical_correctness: evaluation.technicalCorrectness,
      completeness: evaluation.completeness,
      clarity: evaluation.clarity,
      practical_depth: evaluation.practicalDepth,
      tradeoff_awareness: evaluation.tradeoffAwareness,
      strengths: strengthsText,
      gaps: gapsText,
      improved_answer: evaluation.idealAnswer,
      follow_up_question: primaryFollowUp,
      incorrect_statements: evaluation.incorrectStatements.join("; "),
      clarity_assessment: evaluation.clarityAssessment,
      depth_assessment: evaluation.depthAssessment,
      improvement_advice: evaluation.improvementAdvice,
      follow_up_questions_json: evaluation.followUpQuestions,
      evaluation_status: "evaluated",
      evaluated_at: new Date().toISOString(),
    };

    const { data: evaluatedQuestion, error: evalErr } = await this.supabase
      .from("interview_questions")
      .update(fullUpdatePayload)
      .eq("id", questionId)
      .eq("user_id", userId)
      .select()
      .single();

    if (evalErr) {
      // If extended columns error, update base columns
      const basePayload = {
        user_answer: answer.trim(),
        technical_correctness: evaluation.technicalCorrectness,
        completeness: evaluation.completeness,
        clarity: evaluation.clarity,
        practical_depth: evaluation.practicalDepth,
        tradeoff_awareness: evaluation.tradeoffAwareness,
        strengths: strengthsText,
        gaps: gapsText,
        improved_answer: evaluation.idealAnswer,
        follow_up_question: primaryFollowUp,
      };
      const { data: baseQ, error: baseErr } = await this.supabase
        .from("interview_questions")
        .update(basePayload)
        .eq("id", questionId)
        .eq("user_id", userId)
        .select()
        .single();

      if (baseErr || !baseQ) {
        throw new Error(`Failed to persist evaluation: ${baseErr?.message || evalErr.message}`);
      }
      const updatedSession = await this.checkAndFinalizeSession(userId, sessionId);
      const enrichedBaseQ = {
        ...baseQ,
        score: evaluation.score,
        evaluation_status: "evaluated",
        incorrect_statements: evaluation.incorrectStatements.join("; "),
        clarity_assessment: evaluation.clarityAssessment,
        depth_assessment: evaluation.depthAssessment,
        improvement_advice: evaluation.improvementAdvice,
        follow_up_questions_json: evaluation.followUpQuestions,
        evaluated_at: new Date().toISOString(),
      };
      return { question: enrichedBaseQ as MockInterviewQuestion, session: updatedSession };
    }

    const updatedSession = await this.checkAndFinalizeSession(userId, sessionId);
    return {
      question: evaluatedQuestion as MockInterviewQuestion,
      session: updatedSession,
    };
  }

  async retryEvaluation(
    userId: string,
    sessionId: string,
    questionId: string
  ): Promise<{ question: MockInterviewQuestion; session: MockInterviewSession }> {
    // 1. Rate limiter check (M-01) - reject rate-limited retry upfront before ANY DB mutation or AI call
    const rateLimit = aiRateLimiter.check(userId);
    if (!rateLimit.allowed) {
      throw new AiServiceError(
        `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before retrying.`,
        "RATE_LIMITED",
        429
      );
    }

    // 2. Guard against retry on completed or abandoned session (M-02)
    const { data: session, error: sErr } = await this.supabase
      .from("interview_sessions")
      .select("id, status")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sErr || !session) {
      throw new Error("Interview session not found.");
    }

    if (session.status === "completed" || session.status === "abandoned") {
      throw new Error("Cannot retry evaluation on a completed or abandoned interview session.");
    }

    // 3. Fetch and guard question record (M-02)
    const { data: qRecord, error: qErr } = await this.supabase
      .from("interview_questions")
      .select("*")
      .eq("id", questionId)
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .single();

    if (qErr || !qRecord || !qRecord.user_answer) {
      throw new Error("No submitted answer found to retry.");
    }

    if (qRecord.evaluation_status === "skipped") {
      throw new Error("Cannot retry evaluation on a skipped question.");
    }

    if (qRecord.evaluation_status !== "failed") {
      throw new Error("Only failed evaluations can be retried.");
    }

    // 4. Concurrency-safe retry delegation (M-02)
    // Directly delegate to submitAnswer with isRetry: true.
    // submitAnswer will atomically transition evaluation_status from 'failed' -> 'evaluating'.
    return this.submitAnswer(
      userId,
      {
        sessionId,
        questionId,
        answer: qRecord.user_answer,
        skip: false,
      },
      { isRetry: true }
    );
  }

  async checkAndFinalizeSession(
    userId: string,
    sessionId: string
  ): Promise<MockInterviewSession> {
    const session = await this.getSession(userId, sessionId);
    if (!session || !session.questions || session.questions.length === 0) {
      return session!;
    }

    // Check if all questions are either evaluated or skipped
    const allCompleted = session.questions.every(
      (q) =>
        q.user_answer !== null &&
        (q.evaluation_status === "evaluated" || q.evaluation_status === "skipped")
    );

    if (allCompleted && session.status !== "completed") {
      return this.finalizeInterview(userId, sessionId);
    }

    return session;
  }

  async finalizeInterview(
    userId: string,
    sessionId: string
  ): Promise<MockInterviewSession> {
    const session = await this.getSession(userId, sessionId);
    if (!session || !session.questions) {
      throw new Error("Session not found.");
    }

    const questions = session.questions;
    let totalScore = 0;
    let scoredCount = 0;
    let attemptedCount = 0;
    let skippedCount = 0;

    const skillScores = new Map<string, { total: number; count: number }>();

    for (const q of questions) {
      const skill = q.skill_name || session.category || "General";
      if (!skillScores.has(skill)) {
        skillScores.set(skill, { total: 0, count: 0 });
      }

      if (q.user_answer === "[Skipped by candidate]" || q.evaluation_status === "skipped") {
        skippedCount++;
      } else if (q.user_answer) {
        attemptedCount++;
        // Parse score safely (handles both number and PostgreSQL numeric(4,2) string)
        const parsedScore = parseScore(q.score);
        const qScore =
          parsedScore !== null
            ? parsedScore
            : q.technical_correctness
              ? ((Number(q.technical_correctness) +
                Number(q.completeness || 3) +
                Number(q.clarity || 3) +
                Number(q.practical_depth || 3) +
                Number(q.tradeoff_awareness || 3)) / 25) * 10
              : 0;

        totalScore += qScore;
        scoredCount++;
        const sEntry = skillScores.get(skill)!;
        sEntry.total += qScore;
        sEntry.count++;
      }
    }

    const overallScore = scoredCount > 0 ? Number((totalScore / scoredCount).toFixed(1)) : 0;
    const overallPercentage = Math.round((overallScore / 10) * 100);

    const skillBreakdown = Array.from(skillScores.entries()).map(([skill, data]) => ({
      skill,
      averageScore: data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0,
      questionCount: data.count,
    }));

    const strongAreas = skillBreakdown
      .filter((s) => s.averageScore >= 7.0 && s.questionCount > 0)
      .map((s) => s.skill);

    const weakAreas = skillBreakdown
      .filter((s) => s.averageScore < 7.0 && s.questionCount > 0)
      .map((s) => s.skill);

    const recommendedRevisions = questions
      .filter((q) => {
        const parsed = parseScore(q.score);
        const qScore = parsed !== null ? parsed : (Number(q.technical_correctness) || 0) * 2;
        return qScore < 7;
      })
      .map((q) => ({
        topic: q.topic || q.question_text.slice(0, 40),
        skill: q.skill_name || session.category,
        reason: q.gaps || "Needs revision based on interview evaluation.",
      }))
      .slice(0, 5);

    const summaryJson = {
      overallPercentage,
      attemptedCount,
      skippedCount,
      unansweredCount: questions.length - (attemptedCount + skippedCount),
      skillBreakdown,
      strongAreas,
      weakAreas,
      recommendedRevisions,
    };

    const overallFeedback = `Interview finished with an overall score of ${overallScore}/10 (${overallPercentage}%). ${strongAreas.length > 0 ? `Demonstrated solid competency in: ${strongAreas.join(", ")}. ` : ""
      }${weakAreas.length > 0 ? `Targeted areas for improvement: ${weakAreas.join(", ")}.` : "Consistent performance across evaluated questions."}`;

    // Update session
    const updatePayload: Record<string, unknown> = {
      status: "completed",
      completed_at: new Date().toISOString(),
      overall_feedback: overallFeedback,
      overall_score: overallScore,
      summary_json: summaryJson,
    };

    const { error: finalizeErr } = await this.supabase
      .from("interview_sessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (finalizeErr) {
      // Base fallback if extended columns fail
      await this.supabase
        .from("interview_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          overall_feedback: overallFeedback,
        })
        .eq("id", sessionId)
        .eq("user_id", userId);
    }

    return (await this.getSession(userId, sessionId))!;
  }
}
