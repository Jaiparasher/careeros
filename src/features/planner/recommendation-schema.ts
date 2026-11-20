import { z } from "zod";
import { taskCategorySchema } from "./schema";

export const studyActionTypeSchema = z.enum([
  "dsa_revision",
  "weak_topic",
  "incomplete_module",
  "interview_question",
]);

export type StudyActionType = z.infer<typeof studyActionTypeSchema>;

export interface StudyActionCandidate {
  id: string;
  type: StudyActionType;
  title: string;
  topicOrSkill: string;
  estimatedMinutes: number;
  urgencyScore: number;
  category: z.infer<typeof taskCategorySchema>;
  context: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export const geminiRecommendationItemSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
  priority: z.enum(["high", "medium", "low"]).default("high"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  expectedOutcome: z.string().min(10, "Expected outcome must be at least 10 characters"),
  suggestedDurationMinutes: z.number().int().min(5).max(180).default(30),
});

export type GeminiRecommendationItem = z.infer<typeof geminiRecommendationItemSchema>;

export const rawGeminiAdvisorOutputSchema = z.object({
  advisorHeadline: z.string().min(5).default("Personalized Daily Study Plan"),
  recommendations: z.array(geminiRecommendationItemSchema).max(3),
});

export type RawGeminiAdvisorOutput = z.infer<typeof rawGeminiAdvisorOutputSchema>;

export type RecommendationSource = "gemini" | "deterministic_fallback";

export interface StudyRecommendation {
  id: string; // unique ID for this recommendation card
  candidateId: string;
  type: StudyActionType;
  title: string;
  topicOrSkill: string;
  category: z.infer<typeof taskCategorySchema>;
  entityId: string;
  priority: "high" | "medium" | "low";
  reason: string;
  expectedOutcome: string;
  estimatedMinutes: number;
  context: string;
  source?: RecommendationSource;
  isAccepted?: boolean;
  isDismissed?: boolean;
  createdTaskId?: string;
}

export interface RecommendationSessionResult {
  advisorHeadline: string;
  generationSource: RecommendationSource;
  fallbackReason?: string | null;
  dailyAvailableMinutes: number;
  currentPlannedMinutes: number;
  remainingCapacityMinutes: number;
  targetRoles: string[];
  recommendations: StudyRecommendation[];
  generatedAt: string;
}

/**
 * Validates real calendar dates formatted as YYYY-MM-DD.
 * Rejects invalid format, impossible months/days (e.g. 2026-02-31, 2026-13-01),
 * and non-leap years (e.g. 2027-02-29), while accepting real leap days (2028-02-29).
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const calendarDateSchema = z
  .string()
  .refine(isValidCalendarDate, {
    message: "Invalid calendar date (expected valid YYYY-MM-DD)",
  });

export const acceptRecommendationInputSchema = z.object({
  candidateId: z.string().min(1),
  type: studyActionTypeSchema,
  title: z.string().min(2).max(200),
  category: taskCategorySchema,
  entityId: z.string().min(1),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  estimatedMinutes: z.number().int().min(5).max(480).default(30),
  reason: z.string().max(1000).optional(),
  expectedOutcome: z.string().max(1000).optional(),
  plannedFor: calendarDateSchema.optional(),
  idempotencyKey: z.string().max(255).optional(),
});

export type AcceptRecommendationInput = z.infer<typeof acceptRecommendationInputSchema>;

export const acceptAllRecommendationsInputSchema = z.object({
  recommendations: z.array(acceptRecommendationInputSchema).min(1).max(3),
  plannedFor: calendarDateSchema.optional(),
});

export type AcceptAllRecommendationsInput = z.infer<typeof acceptAllRecommendationsInputSchema>;

export const generateRecommendationsInputSchema = z.object({
  targetDate: calendarDateSchema.optional(),
});

export type GenerateRecommendationsInput = z.infer<typeof generateRecommendationsInputSchema>;
