import type { SupabaseClient } from "@supabase/supabase-js";
import type { UpdateModuleProgressInput, UpdateTopicAssessmentInput } from "./schema";
import catalogData from "../../../seed-data/interview-skills-catalog.json";

export interface LearningModule {
  id: string;
  user_id: string;
  course_key: string;
  module_key: string;
  course_name: string;
  provider: string | null;
  module_number: number;
  title: string;
  completion_percent: number;
  notes: string | null;
  resource_url: string | null;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningTopic {
  id: string;
  user_id: string;
  name: string;
  category: string;
  priority: "low" | "medium" | "high";
  confidence_score: number | null;
  assessment_status: "not_assessed" | "needs_work" | "progressing" | "strong";
  interview_ready: boolean | null;
  evidence_notes: string | null;
  last_revised_at: string | null;
  next_revision_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserModules(
  supabase: SupabaseClient,
  userId: string
): Promise<LearningModule[]> {
  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("user_id", userId)
    .order("module_number", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateModuleProgress(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateModuleProgressInput
): Promise<LearningModule> {
  const { data, error } = await supabase
    .from("learning_modules")
    .update({
      completion_percent: input.completionPercent,
      notes: input.notes !== undefined ? input.notes : undefined,
      last_studied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.moduleId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserTopics(
  supabase: SupabaseClient,
  userId: string
): Promise<LearningTopic[]> {
  const { data, error } = await supabase
    .from("learning_topics")
    .select("*")
    .eq("user_id", userId)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function seedDefaultTopicsIfEmpty(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const existing = await getUserTopics(supabase, userId);
  if (existing.length > 0) {
    return existing.length;
  }

  // Derive unique topics from interview skills catalog
  const topicRows: Array<{
    user_id: string;
    name: string;
    category: string;
    priority: "low" | "medium" | "high";
    assessment_status: "not_assessed";
    interview_ready: boolean;
  }> = [];

  const seen = new Set<string>();

  for (const cat of catalogData.categories) {
    for (const skill of cat.skills) {
      for (const topicName of skill.topics) {
        const key = `${cat.name}:::${topicName}`;
        if (!seen.has(key)) {
          seen.add(key);
          const priority: "low" | "medium" | "high" =
            skill.priority === "critical"
              ? "high"
              : skill.priority === "low"
              ? "low"
              : "medium";

          topicRows.push({
            user_id: userId,
            name: topicName,
            category: cat.name,
            priority,
            assessment_status: "not_assessed",
            interview_ready: false,
          });
        }
      }
    }
  }

  const { error } = await supabase.from("learning_topics").insert(topicRows);
  if (error) throw new Error(error.message);

  return topicRows.length;
}

export async function updateTopicAssessment(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateTopicAssessmentInput
): Promise<LearningTopic> {
  const updatePayload: Record<string, unknown> = {
    assessment_status: input.assessmentStatus,
    updated_at: new Date().toISOString(),
    last_revised_at: new Date().toISOString(),
  };

  if (input.confidenceScore !== undefined) {
    updatePayload.confidence_score = input.confidenceScore;
  }
  if (input.interviewReady !== undefined) {
    updatePayload.interview_ready = input.interviewReady;
  }
  if (input.evidenceNotes !== undefined) {
    updatePayload.evidence_notes = input.evidenceNotes;
  }
  if (input.priority !== undefined) {
    updatePayload.priority = input.priority;
  }

  const { data, error } = await supabase
    .from("learning_topics")
    .update(updatePayload)
    .eq("id", input.topicId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getLearningStats(supabase: SupabaseClient, userId: string) {
  const [modules, topics] = await Promise.all([
    getUserModules(supabase, userId),
    getUserTopics(supabase, userId),
  ]);

  const totalModules = modules.length;
  const avgProgress =
    totalModules > 0
      ? modules.reduce((sum, m) => sum + Number(m.completion_percent), 0) / totalModules
      : 0;

  const totalTopics = topics.length;
  const assessedTopics = topics.filter((t) => t.assessment_status !== "not_assessed").length;
  const interviewReadyTopics = topics.filter((t) => Boolean(t.interview_ready)).length;

  return {
    totalModules,
    avgProgress: Math.round(avgProgress * 100) / 100,
    totalTopics,
    assessedTopics,
    interviewReadyTopics,
  };
}
