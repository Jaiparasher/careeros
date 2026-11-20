import type { SupabaseClient } from "@supabase/supabase-js";
import {
  generateSprintSchedule,
  evaluateCapacity,
  type SprintScheduleResult,
  type CapacityEvaluation,
} from "./workload";
import { syncGrind75Collection } from "../dsa/grind75-sync";
import { type CreateCustomTaskInput } from "./schema";

export interface StudyPlanRecord {
  id: string;
  user_id: string;
  name: string;
  plan_type: "30_day_sprint" | "priority_extension" | "custom";
  starts_on: string;
  target_ends_on: string;
  status: "draft" | "active" | "completed" | "paused" | "archived";
  target_role: string | null;
  daily_available_minutes: number;
  settings: Record<string, unknown>;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyTaskItem {
  id: string;
  user_id: string;
  study_plan_id: string | null;
  title: string;
  description: string | null;
  category: string;
  planned_for: string;
  estimated_minutes: number;
  priority: "low" | "normal" | "high";
  status: "pending" | "in_progress" | "completed" | "deferred";
  question_id: string | null;
  learning_topic_id: string | null;
  interview_question_id: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  dsa_question?: {
    id: string;
    title: string;
    difficulty: string;
    patterns?: string[];
    url: string | null;
    collection_order: number | null;
  } | null;
  interview_question?: {
    id: string;
    question_title: string;
    difficulty: string;
    skill_name: string;
    topic: string;
  } | null;
}

export interface DayAgendaResult {
  date: string;
  dailyAvailableMinutes: number;
  totalPlannedMinutes: number;
  completedMinutes: number;
  capacity: CapacityEvaluation;
  tasks: StudyTaskItem[];
}

export async function getUserStudyCapacity(
  supabase: SupabaseClient,
  userId: string
): Promise<{ dailyAvailableMinutes: number; targetRoles: string[] }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_available_minutes, target_roles")
    .eq("id", userId)
    .single();

  return {
    dailyAvailableMinutes: profile?.daily_available_minutes || 120,
    targetRoles: profile?.target_roles || ["Java Backend Engineer", "Full Stack Engineer"],
  };
}

export async function getActivePlan(
  supabase: SupabaseClient,
  userId: string
): Promise<StudyPlanRecord | null> {
  const { data, error } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active study plan: ${error.message}`);
  }

  return (data as StudyPlanRecord) ?? null;
}

export async function getDayAgenda(
  supabase: SupabaseClient,
  userId: string,
  dateStr: string,
  planId?: string
): Promise<DayAgendaResult> {
  const { dailyAvailableMinutes } = await getUserStudyCapacity(supabase, userId);

  let query = supabase
    .from("study_tasks")
    .select(
      `
      *,
      dsa_question:dsa_questions(id, title, difficulty, patterns, url, collection_order),
      interview_question:interview_question_bank(id, question_title, difficulty, skill_name, topic)
    `
    )
    .eq("user_id", userId)
    .eq("planned_for", dateStr)
    .order("created_at", { ascending: true });

  if (planId) {
    query = query.eq("study_plan_id", planId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch day agenda tasks: ${error.message}`);
  }

  const tasks = (data || []) as StudyTaskItem[];
  const totalPlannedMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const completedMinutes = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);

  const capacity = evaluateCapacity(totalPlannedMinutes, dailyAvailableMinutes);

  return {
    date: dateStr,
    dailyAvailableMinutes,
    totalPlannedMinutes,
    completedMinutes,
    capacity,
    tasks,
  };
}

export async function getPlanOverallStats(
  supabase: SupabaseClient,
  userId: string,
  plan: StudyPlanRecord
): Promise<{
  totalTasks: number;
  completedTasks: number;
  percentCompleted: number;
  currentDayNumber: number;
  totalDays: number;
}> {
  const { data: tasks, error } = await supabase
    .from("study_tasks")
    .select("status")
    .eq("user_id", userId)
    .eq("study_plan_id", plan.id);

  if (error) {
    throw new Error(`Failed to fetch plan stats: ${error.message}`);
  }

  const rows = tasks || [];
  const totalTasks = rows.length;
  const completedTasks = rows.filter((t) => t.status === "completed").length;
  const percentCompleted = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const start = new Date(plan.starts_on);
  const end = new Date(plan.target_ends_on);
  const now = new Date();
  const diffDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  return {
    totalTasks,
    completedTasks,
    percentCompleted,
    currentDayNumber: Math.min(diffDays, totalDays),
    totalDays,
  };
}

export interface SprintGrindProblemMeta {
  title: string;
  difficulty: string;
  topic: string;
  patterns: string[];
}

export async function generateSprintPreview(
  supabase: SupabaseClient,
  userId: string,
  durationDays: 30 | 45 | 60,
  startDateStr?: string
): Promise<{
  schedule: SprintScheduleResult;
  dailyAvailableMinutes: number;
  grindProblemsMap: Record<number, SprintGrindProblemMeta>;
}> {
  const { dailyAvailableMinutes } = await getUserStudyCapacity(supabase, userId);
  const startDate = startDateStr ? new Date(startDateStr) : new Date();

  const schedule = generateSprintSchedule({
    durationDays,
    dailyAvailableMinutes,
    startDate,
  });

  // Fetch Grind 75 problems metadata using actual dsa_questions.patterns column
  const { data: dsaRows, error: dsaErr } = await supabase
    .from("dsa_questions")
    .select("collection_order, title, difficulty, patterns")
    .eq("user_id", userId)
    .not("collection_order", "is", null)
    .order("collection_order", { ascending: true });

  if (dsaErr) {
    throw new Error(`Failed to fetch Grind 75 problems metadata: ${dsaErr.message}`);
  }

  const grindMap: Record<number, SprintGrindProblemMeta> = {};
  (dsaRows || []).forEach((row) => {
    if (row.collection_order) {
      const patterns = Array.isArray(row.patterns)
        ? row.patterns.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        : [];
      grindMap[row.collection_order] = {
        title: row.title,
        difficulty: row.difficulty,
        topic: patterns.length > 0 ? patterns.join(", ") : "Algorithms",
        patterns,
      };
    }
  });

  return {
    schedule,
    dailyAvailableMinutes,
    grindProblemsMap: grindMap,
  };
}

export async function acceptSprintPlan(
  supabase: SupabaseClient,
  userId: string,
  durationDays: 30 | 45 | 60,
  startDateStr?: string
): Promise<StudyPlanRecord> {
  // 1. Ensure Grind 75 questions are synced in dsa_questions table
  await syncGrind75Collection(supabase, userId);

  // 2. Fetch existing Grind 75 questions
  const { data: dsaQuestions, error: dsaErr } = await supabase
    .from("dsa_questions")
    .select("id, title, collection_order")
    .eq("user_id", userId)
    .not("collection_order", "is", null);

  if (dsaErr) {
    throw new Error(`Failed to query Grind 75 questions: ${dsaErr.message}`);
  }

  const dsaByOrder = new Map<number, { id: string; title: string }>();
  (dsaQuestions || []).forEach((q) => {
    if (q.collection_order) {
      dsaByOrder.set(q.collection_order, { id: q.id, title: q.title });
    }
  });

  // 3. Fetch interview questions to attach as daily study questions
  const { data: interviewQuestions } = await supabase
    .from("interview_question_bank")
    .select("id, question_title, skill_slug, topic")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(100);

  const interviewPool = interviewQuestions || [];

  const { dailyAvailableMinutes } = await getUserStudyCapacity(supabase, userId);
  const start = startDateStr ? new Date(startDateStr) : new Date();

  const schedule = generateSprintSchedule({
    durationDays,
    dailyAvailableMinutes,
    startDate: start,
  });

  const startsOn = schedule.days[0]!.date;
  const targetEndsOn = schedule.days[schedule.days.length - 1]!.date;

  // 4. Archive any existing active plans for this user
  await supabase
    .from("study_plans")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");

  // 5. Insert new active study plan
  const planPayload = {
    user_id: userId,
    name: `${durationDays}-Day Technical Interview Sprint`,
    plan_type: durationDays === 30 ? "30_day_sprint" : "priority_extension",
    starts_on: startsOn,
    target_ends_on: targetEndsOn,
    status: "active",
    daily_available_minutes: dailyAvailableMinutes,
    settings: {
      durationDays,
      generatedAt: new Date().toISOString(),
      source: "CareerOS 30-Day Sprint Curriculum",
    },
    accepted_at: new Date().toISOString(),
  };

  const { data: plan, error: planErr } = await supabase
    .from("study_plans")
    .insert(planPayload)
    .select()
    .single();

  if (planErr || !plan) {
    throw new Error(`Failed to create study plan: ${planErr?.message}`);
  }

  // 6. Generate tasks for all days
  const tasksToInsert: Record<string, unknown>[] = [];
  let interviewIdx = 0;

  for (const day of schedule.days) {
    // 6a. Grind 75 questions for this day
    for (const order of day.grindProblemOrders) {
      const dsaProblem = dsaByOrder.get(order);
      tasksToInsert.push({
        user_id: userId,
        study_plan_id: plan.id,
        question_id: dsaProblem?.id || null,
        title: dsaProblem ? `DSA Practice: ${dsaProblem.title}` : `Grind 75 Problem #${order}`,
        description: `Solve Grind 75 #${order} in optimal time/space complexity with pattern recognition.`,
        category: "grind75",
        planned_for: day.date,
        estimated_minutes: 25,
        priority: "high",
        status: "pending",
      });
    }

    // 6b. Daily interview question or review topic
    if (day.isReviewDay) {
      tasksToInsert.push({
        user_id: userId,
        study_plan_id: plan.id,
        title: `Sprint Review Checkpoint: ${day.focusTopic}`,
        description: "Review missed problems, reinforce answer rubrics, and update spaced revisions.",
        category: "interview",
        planned_for: day.date,
        estimated_minutes: 40,
        priority: "high",
        status: "pending",
      });
    } else {
      // Pick 2 relevant interview questions from the pool
      for (let k = 0; k < 2; k++) {
        if (interviewPool.length > 0) {
          const iq = interviewPool[interviewIdx % interviewPool.length]!;
          interviewIdx++;
          tasksToInsert.push({
            user_id: userId,
            study_plan_id: plan.id,
            interview_question_id: iq.id,
            title: `Technical Concept: ${iq.question_title}`,
            description: `Review rubric points and test self-explanation for ${iq.topic}.`,
            category: "interview_question",
            planned_for: day.date,
            estimated_minutes: 15,
            priority: "normal",
            status: "pending",
          });
        }
      }
    }

    // 6c. Daily reflection & review task
    tasksToInsert.push({
      user_id: userId,
      study_plan_id: plan.id,
      title: "Daily Synthesis & Spaced Revision Review",
      description: "Note down key learnings, update topic confidence ratings, and review due items.",
      category: "other",
      planned_for: day.date,
      estimated_minutes: 15,
      priority: "normal",
      status: "pending",
    });
  }

  // 7. Insert tasks in batches of 50
  const batchSize = 50;
  for (let i = 0; i < tasksToInsert.length; i += batchSize) {
    const chunk = tasksToInsert.slice(i, i + batchSize);
    const { error: taskErr } = await supabase.from("study_tasks").insert(chunk);
    if (taskErr) {
      throw new Error(`Failed to insert sprint tasks batch: ${taskErr.message}`);
    }
  }

  return plan as StudyPlanRecord;
}

export async function toggleTaskStatus(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  completed: boolean
): Promise<StudyTaskItem> {
  const { data, error } = await supabase
    .from("study_tasks")
    .update({
      status: completed ? "completed" : "pending",
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update task status: ${error.message}`);
  }

  // If a DSA problem task was checked off on the planner, sync its status in dsa_questions
  if (completed && data?.question_id) {
    await supabase
      .from("dsa_questions")
      .update({ status: "solved", updated_at: new Date().toISOString() })
      .eq("id", data.question_id)
      .eq("user_id", userId)
      .eq("status", "not_started");
  }

  return data as StudyTaskItem;
}

export async function rescheduleTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  newDate: string
): Promise<StudyTaskItem> {
  const { data, error } = await supabase
    .from("study_tasks")
    .update({
      planned_for: newDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reschedule task: ${error.message}`);
  }

  return data as StudyTaskItem;
}

export async function createCustomTask(
  supabase: SupabaseClient,
  userId: string,
  input: CreateCustomTaskInput,
  planId?: string
): Promise<StudyTaskItem> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
    category: input.category,
    planned_for: input.plannedFor,
    estimated_minutes: input.estimatedMinutes,
    priority: input.priority,
    notes: input.notes ?? null,
    status: "pending",
  };

  if (planId) {
    payload.study_plan_id = planId;
  }

  const { data, error } = await supabase
    .from("study_tasks")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data as StudyTaskItem;
}
