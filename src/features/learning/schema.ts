import { z } from "zod";

export const updateModuleProgressSchema = z.object({
  moduleId: z.string().uuid("Invalid module ID"),
  completionPercent: z.number().min(0).max(100, "Completion must be between 0 and 100%"),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateModuleProgressInput = z.infer<typeof updateModuleProgressSchema>;

export const assessmentStatusSchema = z.enum([
  "not_assessed",
  "needs_work",
  "progressing",
  "strong",
]);

export const topicPrioritySchema = z.enum(["low", "medium", "high"]);

export const updateTopicAssessmentSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID"),
  confidenceScore: z.number().int().min(1).max(5).optional().nullable(),
  assessmentStatus: assessmentStatusSchema,
  interviewReady: z.boolean().optional().nullable(),
  evidenceNotes: z.string().max(2000).optional().nullable(),
  priority: topicPrioritySchema.optional(),
});

export type UpdateTopicAssessmentInput = z.infer<typeof updateTopicAssessmentSchema>;
