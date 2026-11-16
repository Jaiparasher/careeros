import { z } from "zod";

export const projectStatusEnum = z.enum([
  "planned",
  "in_progress",
  "completed",
  "on_hold",
  "blocked",
  "archived",
]);

export const featureStatusEnum = z.enum([
  "planned",
  "in_progress",
  "implemented",
  "blocked",
  "done",
]);

export const featurePriorityEnum = z.enum(["low", "medium", "high", "critical"]);

export const bugSeverityEnum = z.enum(["low", "medium", "high", "critical"]);
export const bugStatusEnum = z.enum(["open", "investigating", "fixed", "closed"]);

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(100),
  project_type: z.string().max(80).optional().default("Web Application"),
  summary: z.string().max(1000).optional(),
  status: projectStatusEnum.default("in_progress"),
  repository_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  demo_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  technologies: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  key_achievements: z.array(z.string()).default([]),
  started_on: z.string().optional().nullable(),
  last_updated_on: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createFeatureSchema = z.object({
  title: z.string().min(2, "Feature title must be at least 2 characters").max(120),
  description: z.string().max(1000).optional().default(""),
  status: featureStatusEnum.default("planned"),
  priority: featurePriorityEnum.default("medium"),
  category: z.enum(["feature", "bug", "improvement", "infrastructure"]).default("feature"),
  tech_used: z.array(z.string()).default([]),
  notes: z.string().optional().default(""),
  external_url: z.string().url().optional().or(z.literal("")).nullable(),
  estimated_completion_date: z.string().optional().nullable(),
  actual_completion_date: z.string().optional().nullable(),
});

export const updateFeatureSchema = createFeatureSchema.partial();

export const createBugSchema = z.object({
  title: z.string().min(2, "Bug title must be at least 2 characters").max(150),
  description: z.string().max(1000).optional().default(""),
  severity: bugSeverityEnum.default("medium"),
  status: bugStatusEnum.default("open"),
  feature_id: z.string().uuid().optional().nullable(),
  resolution_notes: z.string().optional().default(""),
  resolved_at: z.string().optional().nullable(),
});

export const updateBugSchema = createBugSchema.partial();

export const architectureDetailsSchema = z.object({
  overview: z.string().optional().default(""),
  major_decisions: z.string().optional().default(""),
  database_design: z.string().optional().default(""),
  api_design: z.string().optional().default(""),
  challenges_solutions: z.string().optional().default(""),
  scalability: z.string().optional().default(""),
  security: z.string().optional().default(""),
  lessons_learned: z.string().optional().default(""),
});

export const interviewPrepSchema = z.object({
  elevator_pitch_1min: z.string().optional().default(""),
  architecture_deep_dive_5min: z.string().optional().default(""),
  challenges_and_solutions: z.string().optional().default(""),
  tradeoffs_and_decisions: z.string().optional().default(""),
  interviewer_followups: z.array(z.string()).optional().default([]),
});

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
export type CreateFeatureInput = z.input<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.input<typeof updateFeatureSchema>;
export type CreateBugInput = z.input<typeof createBugSchema>;
export type UpdateBugInput = z.input<typeof updateBugSchema>;
export type ArchitectureDetailsInput = z.input<typeof architectureDetailsSchema>;
export type InterviewPrepInput = z.input<typeof interviewPrepSchema>;
