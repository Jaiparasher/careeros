import type { SupabaseClient } from "@supabase/supabase-js";
import { aiRateLimiter } from "@/features/ai";
import {
  type StudyActionCandidate,
  type RecommendationSessionResult,
  type AcceptRecommendationInput,
} from "./recommendation-schema";
import { rankAndExplainStudyCandidates } from "./recommendation-advisor";
import {
  getUserStudyCapacity,
  getActivePlan,
  getDayAgenda,
  type StudyTaskItem,
} from "./service";
import { getDueRevisions } from "../dsa/service";
import { getUserTopics, getUserModules } from "../learning/service";

/**
 * Maps course/module metadata to an exact valid member of taskCategorySchema:
 * "dsa" | "java" | "spring_boot" | "cs_fundamentals" | "system_design" | "other"
 */
export function deriveModuleCategory(module: {
  course_key?: string | null;
  course_name?: string | null;
  title?: string | null;
}): "java" | "spring_boot" | "cs_fundamentals" | "system_design" | "dsa" | "other" {
  const descriptor = `${module.course_key || ""} ${module.course_name || ""} ${module.title || ""}`.toLowerCase();
  if (descriptor.includes("spring")) return "spring_boot";
  if (descriptor.includes("java")) return "java";
  if (descriptor.includes("design") || descriptor.includes("architecture")) return "system_design";
  if (descriptor.includes("dsa") || descriptor.includes("algo") || descriptor.includes("data structure") || descriptor.includes("grind")) return "dsa";
  if (descriptor.includes("cs") || descriptor.includes("fundamental") || descriptor.includes("os") || descriptor.includes("network") || descriptor.includes("dbms") || descriptor.includes("sql")) return "cs_fundamentals";
  return "other";
}

export class StudyRecommendationService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Deterministically collects eligible learning and revision candidates,
   * checks study capacity, and uses Gemini to rank and explain up to 3 high-impact recommendations.
   */
  async generateRecommendations(
    userId: string,
    options?: { targetDate?: string }
  ): Promise<RecommendationSessionResult> {
    // 1. Enforce sliding window rate limit
    const rateCheck = aiRateLimiter.check(userId);
    if (!rateCheck.allowed) {
      throw new Error(`AI rate limit exceeded. Please try again in ${rateCheck.retryAfterSeconds} seconds.`);
    }

    const todayStr = options?.targetDate || new Date().toISOString().slice(0, 10);

    // 2. Fetch user capacity and active plan
    const { dailyAvailableMinutes, targetRoles } = await getUserStudyCapacity(this.supabase, userId);
    const activePlan = await getActivePlan(this.supabase, userId);

    // 3. Fetch today's agenda to calculate current planned minutes and prevent duplicates
    const agenda = await getDayAgenda(this.supabase, userId, todayStr, activePlan?.id);
    const currentPlannedMinutes = agenda.totalPlannedMinutes || 0;
    const remainingCapacityMinutes = Math.max(0, dailyAvailableMinutes - currentPlannedMinutes);

    // Collect already scheduled IDs and titles for today to prevent duplicates
    const scheduledQuestionIds = new Set<string>();
    const scheduledTopicIds = new Set<string>();
    const scheduledInterviewIds = new Set<string>();
    const scheduledTaskTitles = new Set<string>();
    agenda.tasks.forEach((t) => {
      if (t.question_id) scheduledQuestionIds.add(t.question_id);
      if (t.learning_topic_id) scheduledTopicIds.add(t.learning_topic_id);
      if (t.interview_question_id) scheduledInterviewIds.add(t.interview_question_id);
      if (t.title) scheduledTaskTitles.add(t.title.trim().toLowerCase());
    });

    const candidates: StudyActionCandidate[] = [];
    const seenCandidateTitles = new Set<string>();
    const seenCandidateEntityIds = new Set<string>();

    const addCandidateIfUnique = (candidate: StudyActionCandidate): boolean => {
      const normalizedTitle = candidate.title.trim().toLowerCase();
      if (scheduledTaskTitles.has(normalizedTitle) || seenCandidateTitles.has(normalizedTitle)) {
        return false;
      }
      if (seenCandidateEntityIds.has(candidate.entityId)) {
        return false;
      }
      seenCandidateTitles.add(normalizedTitle);
      seenCandidateEntityIds.add(candidate.entityId);
      candidates.push(candidate);
      return true;
    };

    // 4. Source A: Due and Overdue DSA Revisions
    try {
      const dueRevisions = await getDueRevisions(this.supabase, userId, todayStr);
      for (const rev of dueRevisions) {
        if (scheduledQuestionIds.has(rev.question_id)) continue;

        const candidateTitle = `Revise DSA: ${rev.question.title}`;
        const scheduledDate = new Date(rev.scheduled_for);
        const todayDate = new Date(todayStr);
        const diffTime = todayDate.getTime() - scheduledDate.getTime();
        const overdueDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        const difficultyWeight =
          rev.question.difficulty === "hard" ? 15 : rev.question.difficulty === "medium" ? 10 : 5;
        const urgencyScore = 100 + overdueDays * 15 + difficultyWeight;

        addCandidateIfUnique({
          id: `dsa_rev_${rev.id}`,
          type: "dsa_revision",
          title: candidateTitle,
          topicOrSkill: rev.question.patterns?.[0] || "Algorithms",
          estimatedMinutes: 25,
          urgencyScore,
          category: "dsa",
          context: `Spaced revision ${overdueDays > 0 ? `${overdueDays} days overdue` : "due today"}. Difficulty: ${rev.question.difficulty}.`,
          entityId: rev.question_id,
          metadata: { revisionScheduleId: rev.id, overdueDays },
        });
      }
    } catch {
      // DSA revision fetch error handled gracefully
    }

    // 5. Source B: Learning Roadmap Weak or Unassessed Topics
    try {
      const topics = await getUserTopics(this.supabase, userId);
      const weakTopics = topics.filter(
        (t) =>
          (t.assessment_status === "needs_work" ||
            t.assessment_status === "not_assessed" ||
            (t.confidence_score !== null && t.confidence_score <= 2)) &&
          !scheduledTopicIds.has(t.id)
      );

      for (const t of weakTopics) {
        let category: "java" | "spring_boot" | "cs_fundamentals" | "system_design" = "cs_fundamentals";
        if (t.category.toLowerCase().includes("java")) category = "java";
        else if (t.category.toLowerCase().includes("spring")) category = "spring_boot";
        else if (t.category.toLowerCase().includes("design")) category = "system_design";

        const priorityScore = t.priority === "high" ? 25 : t.priority === "medium" ? 15 : 5;
        const assessmentScore = t.assessment_status === "needs_work" ? 50 : 35;
        const urgencyScore = assessmentScore + priorityScore;

        addCandidateIfUnique({
          id: `topic_${t.id}`,
          type: "weak_topic",
          title: `Strengthen Concept: ${t.name}`,
          topicOrSkill: t.name,
          estimatedMinutes: 30,
          urgencyScore,
          category,
          context: `Learning gap in ${t.category}. Assessment: ${t.assessment_status}. Priority: ${t.priority}.`,
          entityId: t.id,
        });
      }
    } catch {
      // Topics fetch error handled gracefully
    }

    // 6. Source C: Incomplete Learning Modules
    try {
      const modules = await getUserModules(this.supabase, userId);
      const incomplete = modules.filter((m) => m.completion_percent < 100);

      for (const m of incomplete) {
        const remainingPct = 100 - m.completion_percent;
        const urgencyScore = 40 + Math.round(remainingPct * 0.3);
        const category = deriveModuleCategory(m);

        addCandidateIfUnique({
          id: `module_${m.id}`,
          type: "incomplete_module",
          title: `Progress Module: ${m.title}`,
          topicOrSkill: m.course_name,
          estimatedMinutes: 40,
          urgencyScore,
          category,
          context: `${m.course_name} Module #${m.module_number}, currently ${m.completion_percent}% complete.`,
          entityId: m.id,
        });
      }
    } catch {
      // Modules fetch error handled gracefully
    }

    // 7. Source D: Core Interview Question Bank Concept (if candidate pool has room)
    if (candidates.length < 5) {
      try {
        const { data: qRows } = await this.supabase
          .from("interview_question_bank")
          .select("id, question_title, skill_name, topic, difficulty")
          .eq("user_id", userId)
          .eq("is_active", true)
          .limit(8);

        (qRows || []).forEach((q) => {
          if (!scheduledInterviewIds.has(q.id)) {
            addCandidateIfUnique({
              id: `iq_${q.id}`,
              type: "interview_question",
              title: `Interview Defense: ${q.question_title}`,
              topicOrSkill: q.skill_name,
              estimatedMinutes: 20,
              urgencyScore: 35,
              category: "interview_question",
              context: `Technical question in ${q.skill_name} (${q.topic}), difficulty: ${q.difficulty}.`,
              entityId: q.id,
            });
          }
        });
      } catch {
        // Question bank query handled gracefully
      }
    }

    // 8. Pass candidate pool to Gemini for intelligent ranking and explanation
    const rankResult = await rankAndExplainStudyCandidates({
      targetRoles,
      dailyAvailableMinutes,
      remainingCapacityMinutes,
      candidates,
    });

    return {
      advisorHeadline: rankResult.advisorHeadline,
      generationSource: rankResult.generationSource,
      fallbackReason: rankResult.fallbackReason,
      dailyAvailableMinutes,
      currentPlannedMinutes,
      remainingCapacityMinutes,
      targetRoles,
      recommendations: rankResult.recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Explicitly accepts a single recommendation and deterministically schedules it as a task in study_tasks.
   * Guarantees database-enforced idempotency: atomic RPC execution and conflict recovery prevent duplicates.
   */
  async acceptRecommendation(
    userId: string,
    input: AcceptRecommendationInput,
    planId?: string
  ): Promise<StudyTaskItem> {
    const plannedFor = input.plannedFor || new Date().toISOString().slice(0, 10);
    const idempotencyKey =
      input.idempotencyKey ||
      `rec:${input.type}:${input.entityId || input.title}:${plannedFor}`;

    // 1. Resolve study plan ID if not supplied
    let resolvedPlanId = planId;
    if (!resolvedPlanId) {
      const activePlan = await getActivePlan(this.supabase, userId);
      resolvedPlanId = activePlan?.id;
    }

    const description = [
      input.reason ? `Advisor Reason: ${input.reason}` : null,
      input.expectedOutcome ? `Expected Outcome: ${input.expectedOutcome}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const isValidUuid = (val?: string) =>
      typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const questionId = input.type === "dsa_revision" && isValidUuid(input.entityId) ? input.entityId : null;
    const topicId = input.type === "weak_topic" && isValidUuid(input.entityId) ? input.entityId : null;
    const interviewId = input.type === "interview_question" && isValidUuid(input.entityId) ? input.entityId : null;

    // 2. Primary Path: Attempt atomic stored procedure (Migration 0012)
    try {
      const { data: rpcData, error: rpcErr } = await this.supabase.rpc("accept_study_recommendation", {
        p_title: input.title,
        p_description: description || null,
        p_category: input.category,
        p_planned_for: plannedFor,
        p_estimated_minutes: input.estimatedMinutes || 30,
        p_priority: input.priority || "normal",
        p_study_plan_id: resolvedPlanId || null,
        p_question_id: questionId,
        p_learning_topic_id: topicId,
        p_interview_question_id: interviewId,
        p_idempotency_key: idempotencyKey,
        p_notes: "Generated by CareerOS Adaptive Study Advisor",
      });

      if (!rpcErr && rpcData) {
        return rpcData as StudyTaskItem;
      }
    } catch {
      // If RPC is unavailable or throws, fall through to table operation
    }

    // 3. Fallback Path: Direct table operations with check-then-insert and conflict recovery
    let duplicateCheckQuery = this.supabase
      .from("study_tasks")
      .select("id, title, planned_for, status")
      .eq("user_id", userId)
      .eq("planned_for", plannedFor);

    if (input.type === "dsa_revision" && questionId) {
      duplicateCheckQuery = duplicateCheckQuery.eq("question_id", questionId);
    } else if (input.type === "weak_topic" && topicId) {
      duplicateCheckQuery = duplicateCheckQuery.eq("learning_topic_id", topicId);
    } else if (input.type === "interview_question" && interviewId) {
      duplicateCheckQuery = duplicateCheckQuery.eq("interview_question_id", interviewId);
    } else {
      duplicateCheckQuery = duplicateCheckQuery.eq("title", input.title);
    }

    const { data: existingTasks } = await duplicateCheckQuery;
    if (existingTasks && existingTasks.length > 0) {
      const { data: fullTask } = await this.supabase
        .from("study_tasks")
        .select("*")
        .eq("id", existingTasks[0]!.id)
        .single();
      return fullTask as StudyTaskItem;
    }

    const taskPayload: Record<string, unknown> = {
      user_id: userId,
      title: input.title,
      description: description || null,
      category: input.category,
      planned_for: plannedFor,
      estimated_minutes: input.estimatedMinutes || 30,
      priority: input.priority || "normal",
      status: "pending",
      notes: "Generated by CareerOS Adaptive Study Advisor",
      idempotency_key: idempotencyKey,
    };

    if (resolvedPlanId) {
      taskPayload.study_plan_id = resolvedPlanId;
    }
    if (questionId) taskPayload.question_id = questionId;
    if (topicId) taskPayload.learning_topic_id = topicId;
    if (interviewId) taskPayload.interview_question_id = interviewId;

    const { data, error } = await this.supabase
      .from("study_tasks")
      .insert(taskPayload)
      .select()
      .single();

    if (error) {
      // 3a. Handle PostgreSQL unique constraint violation (code 23505)
      // When a concurrent request inserted the exact same idempotency_key simultaneously
      if (
        error.code === "23505" ||
        error.message?.includes("idempotency") ||
        error.message?.includes("duplicate key")
      ) {
        const { data: conflictTask } = await this.supabase
          .from("study_tasks")
          .select("*")
          .eq("user_id", userId)
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();

        if (conflictTask) {
          return conflictTask as StudyTaskItem;
        }
      }

      // 3b. Graceful fallback if idempotency_key column does not exist yet (Migration 0012 pending)
      if (error.code === "42703" || error.message?.includes("idempotency_key")) {
        delete taskPayload.idempotency_key;
        const { data: retryData, error: retryErr } = await this.supabase
          .from("study_tasks")
          .insert(taskPayload)
          .select()
          .single();

        if (retryErr || !retryData) {
          throw new Error(`Failed to create accepted study task: ${retryErr?.message}`);
        }
        return retryData as StudyTaskItem;
      }

      throw new Error(`Failed to create accepted study task: ${error.message}`);
    }

    return data as StudyTaskItem;
  }

  /**
   * Batch accepts multiple recommendations and deterministically schedules all of them.
   */
  async acceptAllRecommendations(
    userId: string,
    recommendations: AcceptRecommendationInput[],
    plannedFor?: string
  ): Promise<StudyTaskItem[]> {
    const createdTasks: StudyTaskItem[] = [];
    const activePlan = await getActivePlan(this.supabase, userId);

    for (const rec of recommendations) {
      const task = await this.acceptRecommendation(
        userId,
        { ...rec, plannedFor: plannedFor || rec.plannedFor },
        activePlan?.id
      );
      createdTasks.push(task);
    }

    return createdTasks;
  }
}
