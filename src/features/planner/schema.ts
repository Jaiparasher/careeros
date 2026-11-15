import { z } from "zod";

export const taskCategorySchema = z.enum([
  "dsa",
  "java",
  "spring_boot",
  "cs_fundamentals",
  "system_design",
  "project",
  "interview",
  "interview_question",
  "grind75",
  "job_search",
  "other",
]);

export const acceptSprintPlanSchema = z.object({
  durationDays: z.enum(["30", "45", "60"]).default("30"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
});

export type AcceptSprintPlanInput = z.infer<typeof acceptSprintPlanSchema>;

export const toggleTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  completed: z.boolean(),
});

export type ToggleTaskInput = z.infer<typeof toggleTaskSchema>;

export const rescheduleTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export type RescheduleTaskInput = z.infer<typeof rescheduleTaskSchema>;

export const createCustomTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(1000).optional().nullable(),
  category: taskCategorySchema.default("other"),
  plannedFor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  estimatedMinutes: z.number().int().min(5).max(480).default(30),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateCustomTaskInput = z.infer<typeof createCustomTaskSchema>;
