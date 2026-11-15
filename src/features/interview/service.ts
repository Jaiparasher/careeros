import type { SupabaseClient } from "@supabase/supabase-js";
import questionBankSeed from "../../../seed-data/interview-question-bank-seed.json";
import { type RecordQuestionAnswerInput, type QuestionFilterInput } from "./schema";
import { INTERVIEW_TAXONOMY } from "./taxonomy";

export interface QuestionBankItem {
  id: string;
  user_id: string;
  skill_slug: string;
  skill_name: string;
  skill_category: string;
  topic: string;
  subtopic: string | null;
  question_title: string;
  question_prompt: string;
  question_type: string;
  difficulty: "basic" | "intermediate" | "advanced";
  priority: "critical" | "high" | "medium" | "low";
  target_roles: string[];
  tags: string[];
  expected_answer_points: string[];
  sample_answer: string | null;
  follow_up_questions: string[];
  estimated_minutes: number;
  source_name: string;
  source_url: string | null;
  source_external_id: string | null;
  origin: string;
  status: "not_started" | "learning" | "attempted" | "answered" | "needs_revision" | "strong";
  confidence_score: number | null;
  last_attempted_at: string | null;
  next_revision_at: string | null;
  answer_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankStats {
  total: number;
  answered: number;
  strong: number;
  needsRevision: number;
  categoryStats: {
    categoryId: string;
    categoryName: string;
    total: number;
    answered: number;
  }[];
}

interface SeedQuestionPayload {
  skill_slug: string;
  skill_name: string;
  skill_category: string;
  topic: string;
  subtopic?: string | null;
  question_title: string;
  question_prompt: string;
  question_type: string;
  difficulty: "basic" | "intermediate" | "advanced";
  priority: "critical" | "high" | "medium" | "low";
  target_roles: string[];
  tags: string[];
  expected_answer_points: string[];
  sample_answer?: string | null;
  follow_up_questions: string[];
  estimated_minutes: number;
  source_name: string;
  source_url?: string | null;
  source_external_id: string;
}

export async function seedQuestionBankIfEmpty(
  supabase: SupabaseClient,
  userId: string
): Promise<{ inserted: number; skipped: number }> {
  // 1. Fetch existing question external IDs for this user
  const { data: existing, error: fetchErr } = await supabase
    .from("interview_question_bank")
    .select("source_external_id")
    .eq("user_id", userId);

  if (fetchErr) {
    throw new Error(`Failed to check existing interview questions: ${fetchErr.message}`);
  }

  const existingIds = new Set((existing || []).map((row) => row.source_external_id).filter(Boolean));

  const seedQuestions = (questionBankSeed.questions || []) as unknown as SeedQuestionPayload[];
  const toInsert = seedQuestions.filter((q) => !existingIds.has(q.source_external_id));

  if (toInsert.length === 0) {
    return { inserted: 0, skipped: seedQuestions.length };
  }

  // Insert in batches of 50 to avoid payload limit
  const batchSize = 50;
  let insertedCount = 0;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const chunk = toInsert.slice(i, i + batchSize).map((q) => ({
      user_id: userId,
      skill_slug: q.skill_slug,
      skill_name: q.skill_name,
      skill_category: q.skill_category,
      topic: q.topic,
      subtopic: q.subtopic ?? null,
      question_title: q.question_title,
      question_prompt: q.question_prompt,
      question_type: q.question_type,
      difficulty: q.difficulty,
      priority: q.priority,
      target_roles: q.target_roles,
      tags: q.tags,
      expected_answer_points: q.expected_answer_points,
      sample_answer: q.sample_answer ?? null,
      follow_up_questions: q.follow_up_questions,
      estimated_minutes: q.estimated_minutes,
      source_name: q.source_name,
      source_url: q.source_url ?? null,
      source_external_id: q.source_external_id,
      origin: "curated",
      status: "not_started",
      is_active: true,
    }));

    const { error: insertErr } = await supabase.from("interview_question_bank").insert(chunk);
    if (insertErr) {
      throw new Error(`Failed to insert interview questions batch: ${insertErr.message}`);
    }
    insertedCount += chunk.length;
  }

  return { inserted: insertedCount, skipped: seedQuestions.length - insertedCount };
}

export async function getQuestions(
  supabase: SupabaseClient,
  userId: string,
  filter?: QuestionFilterInput
): Promise<{ questions: QuestionBankItem[]; totalCount: number }> {
  let query = supabase
    .from("interview_question_bank")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("is_active", true);

  if (filter?.category) {
    query = query.eq("skill_category", filter.category);
  }

  if (filter?.skill) {
    query = query.eq("skill_slug", filter.skill);
  }

  if (filter?.topic) {
    query = query.ilike("topic", `%${filter.topic}%`);
  }

  if (filter?.difficulty) {
    query = query.eq("difficulty", filter.difficulty);
  }

  if (filter?.priority) {
    query = query.eq("priority", filter.priority);
  }

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  if (filter?.search?.trim()) {
    const term = filter.search.trim();
    query = query.or(`question_title.ilike.%${term}%,question_prompt.ilike.%${term}%`);
  }

  // Sorting
  query = query
    .order("skill_category", { ascending: true })
    .order("skill_slug", { ascending: true })
    .order("question_title", { ascending: true });

  const page = filter?.page ?? 1;
  const pageSize = filter?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return {
    questions: (data || []) as QuestionBankItem[],
    totalCount: count ?? 0,
  };
}

export async function getQuestionById(
  supabase: SupabaseClient,
  userId: string,
  questionId: string
): Promise<QuestionBankItem | null> {
  const { data, error } = await supabase
    .from("interview_question_bank")
    .select("*")
    .eq("id", questionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch question: ${error.message}`);
  }

  return (data as QuestionBankItem) ?? null;
}

export async function recordQuestionAnswer(
  supabase: SupabaseClient,
  userId: string,
  input: RecordQuestionAnswerInput
): Promise<QuestionBankItem> {
  let nextRevisionAt: string | null = null;
  if (input.nextRevisionDays && input.nextRevisionDays > 0) {
    const revDate = new Date();
    revDate.setDate(revDate.getDate() + input.nextRevisionDays);
    nextRevisionAt = revDate.toISOString().slice(0, 10);
  }

  const updatePayload: Record<string, unknown> = {
    status: input.status,
    last_attempted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (input.confidenceScore !== undefined) {
    updatePayload.confidence_score = input.confidenceScore;
  }
  if (input.answerNotes !== undefined) {
    updatePayload.answer_notes = input.answerNotes;
  }
  if (nextRevisionAt !== null) {
    updatePayload.next_revision_at = nextRevisionAt;
  }

  const { data, error } = await supabase
    .from("interview_question_bank")
    .update(updatePayload)
    .eq("id", input.questionId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update question progress: ${error.message}`);
  }

  return data as QuestionBankItem;
}

export async function getQuestionBankStats(
  supabase: SupabaseClient,
  userId: string
): Promise<QuestionBankStats> {
  const { data, error } = await supabase
    .from("interview_question_bank")
    .select("skill_category, status")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch question stats: ${error.message}`);
  }

  const rows = data || [];
  const total = rows.length;
  const answered = rows.filter((r) => r.status === "answered" || r.status === "strong").length;
  const strong = rows.filter((r) => r.status === "strong").length;
  const needsRevision = rows.filter((r) => r.status === "needs_revision").length;

  const categoryStats = INTERVIEW_TAXONOMY.map((cat) => {
    const catRows = rows.filter((r) => r.skill_category === cat.id);
    const catTotal = catRows.length;
    const catAnswered = catRows.filter(
      (r) => r.status === "answered" || r.status === "strong"
    ).length;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      total: catTotal,
      answered: catAnswered,
    };
  });

  return {
    total,
    answered,
    strong,
    needsRevision,
    categoryStats,
  };
}
