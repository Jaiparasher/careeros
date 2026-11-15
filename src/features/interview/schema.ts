import { z } from "zod";

export const questionStatusSchema = z.enum([
  "not_started",
  "learning",
  "attempted",
  "answered",
  "needs_revision",
  "strong",
]);

export const questionDifficultySchema = z.enum(["basic", "intermediate", "advanced"]);
export const questionPrioritySchema = z.enum(["critical", "high", "medium", "low"]);

export const recordQuestionAnswerSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
  status: questionStatusSchema,
  confidenceScore: z.number().int().min(1).max(5).optional().nullable(),
  answerNotes: z.string().max(4000).optional().nullable(),
  nextRevisionDays: z.number().int().min(1).max(90).optional().nullable(),
});

export type RecordQuestionAnswerInput = z.infer<typeof recordQuestionAnswerSchema>;

export const questionFilterSchema = z.object({
  category: z.string().optional(),
  skill: z.string().optional(),
  topic: z.string().optional(),
  difficulty: questionDifficultySchema.optional(),
  priority: questionPrioritySchema.optional(),
  status: questionStatusSchema.optional(),
  search: z.string().optional(),
  mode: z.enum(["skill", "topic"]).optional().default("skill"),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(5).max(100).optional().default(20),
});

export type QuestionFilterInput = z.infer<typeof questionFilterSchema>;
