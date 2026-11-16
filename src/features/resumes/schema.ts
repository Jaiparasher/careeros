import { z } from "zod";

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const resumeExtractionStatusEnum = z.enum([
  "pending",
  "completed",
  "failed",
  "manual",
]);
export type ResumeExtractionStatus = z.infer<typeof resumeExtractionStatusEnum>;

export const uploadResumeInputSchema = z.object({
  version_label: z.string().trim().min(1, "Version label is required").max(100),
  target_role: z.string().trim().max(100).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
  is_primary: z.boolean().optional().default(false),
});
export type UploadResumeInput = z.input<typeof uploadResumeInputSchema>;
export type UploadResumeOutput = z.infer<typeof uploadResumeInputSchema>;

export const updateResumeTextSchema = z.object({
  id: z.string().uuid("Invalid resume ID"),
  extracted_text: z.string().trim().min(1, "Extracted text cannot be empty"),
});
export type UpdateResumeTextInput = z.infer<typeof updateResumeTextSchema>;

export const setPrimaryResumeSchema = z.object({
  id: z.string().uuid("Invalid resume ID"),
});

export const resumeRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  file_name: z.string(),
  storage_path: z.string(),
  mime_type: z.string(),
  file_size_bytes: z.number().nonnegative(),
  version_label: z.string(),
  extracted_text: z.string().nullable().optional(),
  extraction_status: resumeExtractionStatusEnum.default("pending"),
  is_primary: z.boolean().default(false),
  target_role: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
  deleted_at: z.string().nullable().optional(),
});
export type ResumeRow = z.infer<typeof resumeRowSchema>;

export const jobDescriptionInputSchema = z.object({
  company: z.string().trim().min(1, "Company name is required").max(120),
  role_title: z.string().trim().min(1, "Role title is required").max(120),
  target_role: z.string().trim().max(100).optional().default(""),
  raw_text: z.string().trim().min(10, "Job description text must be at least 10 characters"),
  application_id: z.string().uuid().optional().nullable(),
  resume_id: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional().default(""),
});
export type JobDescriptionInput = z.input<typeof jobDescriptionInputSchema>;
export type JobDescriptionOutput = z.infer<typeof jobDescriptionInputSchema>;

export const jobDescriptionRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company: z.string(),
  role_title: z.string(),
  target_role: z.string().nullable().optional(),
  raw_text: z.string(),
  extracted_skills: z.array(z.string()).default([]),
  application_id: z.string().uuid().nullable().optional(),
  resume_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type JobDescriptionRow = z.infer<typeof jobDescriptionRowSchema>;

export interface SkillMatch {
  slug: string;
  name: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  matchType: "explicit" | "partial" | "missing";
  matchedKeywords: string[];
  explanation?: string;
}

export interface RecommendedInterviewTopic {
  topicSlug: string;
  topicName: string;
  categoryId: string;
  categoryName: string;
  reason: string;
  interviewBankUrl: string;
}

export interface ResumeJdAnalysis {
  company: string;
  roleTitle: string;
  resumeVersion: string;
  matchPercentage: number;
  totalSkillsEvaluated: number;
  explicitSkills: SkillMatch[];
  partialSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  missingKeywords: string[];
  bulletSuggestions: string[];
  recommendedInterviewTopics: RecommendedInterviewTopic[];
  disclaimer: string;
}
