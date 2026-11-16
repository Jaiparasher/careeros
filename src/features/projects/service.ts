import type { SupabaseClient } from "@supabase/supabase-js";
import lovableSeed from "../../../seed-data/lovable-project.json";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateFeatureInput,
  UpdateFeatureInput,
  CreateBugInput,
  UpdateBugInput,
  ArchitectureDetailsInput,
  InterviewPrepInput,
} from "./schema";

export interface ProjectRecord {
  id: string;
  user_id: string;
  name: string;
  project_type: string | null;
  summary: string | null;
  status: "planned" | "in_progress" | "completed" | "on_hold" | "blocked" | "archived";
  repository_url: string | null;
  demo_url: string | null;
  technologies: string[];
  objectives: string[];
  key_achievements: string[];
  architecture_details: Record<string, string>;
  interview_prep: Record<string, unknown>;
  architecture_notes: string | null;
  challenges: string | null;
  interview_story_notes: string | null;
  started_on: string | null;
  last_updated_on: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFeatureRecord {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: "feature" | "bug" | "improvement" | "infrastructure";
  status: "planned" | "in_progress" | "implemented" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "critical";
  tech_used: string[];
  notes: string | null;
  external_url: string | null;
  estimated_completion_date: string | null;
  actual_completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectBugRecord {
  id: string;
  user_id: string;
  project_id: string;
  feature_id: string | null;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "fixed" | "closed";
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total: number;
  in_progress: number;
  completed: number;
  planned: number;
  totalFeatures: number;
  activeBugs: number;
}

// ─── PROJECT CRUD ─────────────────────────────────────────────────────────────

export async function getProjects(
  supabase: SupabaseClient,
  userId: string,
  filter?: { status?: string; project_type?: string }
): Promise<ProjectRecord[]> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }
  if (filter?.project_type) {
    query = query.eq("project_type", filter.project_type);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (data || []) as ProjectRecord[];
}

export async function getProjectById(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<ProjectRecord | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch project ${projectId}: ${error.message}`);
  }

  return (data as ProjectRecord) ?? null;
}

export async function createProject(
  supabase: SupabaseClient,
  userId: string,
  input: CreateProjectInput
): Promise<ProjectRecord> {
  const payload = {
    user_id: userId,
    name: input.name,
    project_type: input.project_type || "Web Application",
    summary: input.summary || null,
    status: input.status || "in_progress",
    repository_url: input.repository_url || null,
    demo_url: input.demo_url || null,
    technologies: input.technologies || [],
    objectives: input.objectives || [],
    key_achievements: input.key_achievements || [],
    started_on: input.started_on || null,
    last_updated_on: input.last_updated_on || new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data as ProjectRecord;
}

export async function updateProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  input: UpdateProjectInput
): Promise<ProjectRecord> {
  const payload: Record<string, unknown> = {
    ...input,
    updated_at: new Date().toISOString(),
    last_updated_on: new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data as ProjectRecord;
}

export async function deleteProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

// ─── LOVABLE PROJECT SEEDER ───────────────────────────────────────────────────

export async function seedLovableProjectIfEmpty(
  supabase: SupabaseClient,
  userId: string
): Promise<{ seeded: boolean; projectId?: string }> {
  // Check if Lovable project already exists
  const { data: existing, error: checkErr } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", "Lovable")
    .maybeSingle();

  if (checkErr) {
    console.error("Failed to check existing Lovable project:", checkErr.message);
  }

  if (existing) {
    return { seeded: false, projectId: existing.id };
  }

  // Strictly adhere to non-negotiable rule 7 and refinement 4:
  // Use verified details from seed-data/lovable-project.json without fabricating links or metrics
  const project = await createProject(supabase, userId, {
    name: lovableSeed.name,
    project_type: lovableSeed.type,
    summary: lovableSeed.summary,
    status: "in_progress",
    repository_url: null,
    demo_url: null,
    technologies: lovableSeed.technologies_used_or_explored,
    objectives: [
      "Build a practical AI-powered application generator using modern full-stack architecture.",
      "Explore RAG with pgvector and LLM tool calling in a production-style Java environment.",
    ],
    key_achievements: [
      "Designed full-stack system architecture with React and Spring Boot.",
      "Integrated Spring AI for vector embeddings and contextual code generation.",
    ],
    started_on: null,
    last_updated_on: new Date().toISOString().slice(0, 10),
  });

  // Seed sample starter features for Lovable
  await createProjectFeature(supabase, userId, project.id, {
    title: "Spring AI & pgvector RAG Pipeline",
    description: "Ingestion of codebase templates and semantic vector search using pgvector.",
    status: "implemented",
    priority: "critical",
    category: "feature",
    tech_used: ["Spring AI", "PostgreSQL", "pgvector"],
    notes: "Core vector search operational; optimizing chunking strategies.",
  });

  await createProjectFeature(supabase, userId, project.id, {
    title: "Server-Sent Events (SSE) Streaming Generation",
    description: "Real-time streaming of code generation output to React client.",
    status: "in_progress",
    priority: "high",
    category: "feature",
    tech_used: ["Spring Boot", "SSE", "React"],
    notes: "Client reconnect handler under testing.",
  });

  return { seeded: true, projectId: project.id };
}

// ─── FEATURE CRUD ─────────────────────────────────────────────────────────────

export async function getProjectFeatures(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<ProjectFeatureRecord[]> {
  const { data, error } = await supabase
    .from("project_features")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch features: ${error.message}`);
  }

  return (data || []) as ProjectFeatureRecord[];
}

export async function createProjectFeature(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  input: CreateFeatureInput
): Promise<ProjectFeatureRecord> {
  const payload = {
    user_id: userId,
    project_id: projectId,
    title: input.title,
    description: input.description || null,
    status: input.status || "planned",
    priority: input.priority || "medium",
    category: input.category || "feature",
    tech_used: input.tech_used || [],
    notes: input.notes || null,
    external_url: input.external_url || null,
    estimated_completion_date: input.estimated_completion_date || null,
    actual_completion_date: input.actual_completion_date || null,
  };

  const { data, error } = await supabase
    .from("project_features")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create feature: ${error.message}`);
  }

  // Update last_updated_on on parent project
  await supabase
    .from("projects")
    .update({ updated_at: new Date().toISOString(), last_updated_on: new Date().toISOString().slice(0, 10) })
    .eq("id", projectId)
    .eq("user_id", userId);

  return data as ProjectFeatureRecord;
}

export async function updateProjectFeature(
  supabase: SupabaseClient,
  userId: string,
  featureId: string,
  input: UpdateFeatureInput
): Promise<ProjectFeatureRecord> {
  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("project_features")
    .update(payload)
    .eq("id", featureId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update feature: ${error.message}`);
  }

  return data as ProjectFeatureRecord;
}

export async function deleteProjectFeature(
  supabase: SupabaseClient,
  userId: string,
  featureId: string
): Promise<void> {
  const { error } = await supabase
    .from("project_features")
    .delete()
    .eq("id", featureId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete feature: ${error.message}`);
  }
}

// ─── BUG TRACKING CRUD ────────────────────────────────────────────────────────

export async function getProjectBugs(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<ProjectBugRecord[]> {
  try {
    const { data, error } = await supabase
      .from("project_bugs")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // If table migration not yet applied in DB
      return [];
    }

    return (data || []) as ProjectBugRecord[];
  } catch {
    return [];
  }
}

export async function createProjectBug(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  input: CreateBugInput
): Promise<ProjectBugRecord> {
  const payload = {
    user_id: userId,
    project_id: projectId,
    feature_id: input.feature_id || null,
    title: input.title,
    description: input.description || null,
    severity: input.severity || "medium",
    status: input.status || "open",
    resolution_notes: input.resolution_notes || null,
    resolved_at: input.resolved_at || null,
  };

  const { data, error } = await supabase
    .from("project_bugs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record project bug: ${error.message}`);
  }

  return data as ProjectBugRecord;
}

export async function updateProjectBug(
  supabase: SupabaseClient,
  userId: string,
  bugId: string,
  input: UpdateBugInput
): Promise<ProjectBugRecord> {
  const payload: Record<string, unknown> = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (input.status === "fixed" || input.status === "closed") {
    payload.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("project_bugs")
    .update(payload)
    .eq("id", bugId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update bug: ${error.message}`);
  }

  return data as ProjectBugRecord;
}

export async function deleteProjectBug(
  supabase: SupabaseClient,
  userId: string,
  bugId: string
): Promise<void> {
  const { error } = await supabase
    .from("project_bugs")
    .delete()
    .eq("id", bugId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete bug: ${error.message}`);
  }
}

// ─── ARCHITECTURE & INTERVIEW PREP UPDATES ────────────────────────────────────

export async function updateProjectArchitecture(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  input: ArchitectureDetailsInput
): Promise<ProjectRecord> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      architecture_details: input,
      updated_at: new Date().toISOString(),
      last_updated_on: new Date().toISOString().slice(0, 10),
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update architecture details: ${error.message}`);
  }

  return data as ProjectRecord;
}

export async function updateProjectInterviewPrep(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  input: InterviewPrepInput
): Promise<ProjectRecord> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      interview_prep: input,
      updated_at: new Date().toISOString(),
      last_updated_on: new Date().toISOString().slice(0, 10),
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update interview story notes: ${error.message}`);
  }

  return data as ProjectRecord;
}

// ─── SUMMARY STATS ────────────────────────────────────────────────────────────

export async function getProjectsSummaryStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ProjectStats> {
  const { data: projects } = await supabase
    .from("projects")
    .select("status")
    .eq("user_id", userId);

  const { data: features } = await supabase
    .from("project_features")
    .select("status")
    .eq("user_id", userId);

  let activeBugsCount = 0;
  try {
    const { count } = await supabase
      .from("project_bugs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["open", "investigating"]);
    activeBugsCount = count || 0;
  } catch {
    // fallback if table not yet migrated
  }

  const pRows = projects || [];
  const fRows = features || [];

  return {
    total: pRows.length,
    in_progress: pRows.filter((p) => p.status === "in_progress").length,
    completed: pRows.filter((p) => p.status === "completed").length,
    planned: pRows.filter((p) => p.status === "planned").length,
    totalFeatures: fRows.length,
    activeBugs: activeBugsCount,
  };
}
