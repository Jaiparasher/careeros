import { z } from 'zod'

// For adding/editing a DSA question
export const addQuestionSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().url().optional().or(z.literal('')),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  patterns: z.array(z.string()).default([]),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  optimal_time_complexity: z.string().max(50).optional(),
  optimal_space_complexity: z.string().max(50).optional(),
})

export type AddQuestionInput = z.infer<typeof addQuestionSchema>

// For recording an attempt
export const recordAttemptSchema = z.object({
  outcome: z.enum(['solved_independently', 'solved_with_hint', 'unable_to_solve', 'revisited']),
  duration_minutes: z.number().int().min(0).max(1440).optional(),
  hint_used: z.boolean().default(false),
  approach_notes: z.string().max(3000).optional(),
  mistake_notes: z.string().max(3000).optional(),
  time_complexity: z.string().max(50).optional(),
  space_complexity: z.string().max(50).optional(),
  code_language: z.string().default('Java'),
})

export type RecordAttemptInput = z.infer<typeof recordAttemptSchema>

// For CSV import row validation — matches templates/dsa_questions_import.csv
export const csvRowSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  patterns: z.string().optional(), // semicolon-separated in CSV
  source: z.string().optional(),
  status: z
    .enum(['not_started', 'attempted', 'solved', 'needs_revision'])
    .optional()
    .default('not_started'),
  notes: z.string().optional(),
  time_complexity: z.string().optional(),
  space_complexity: z.string().optional(),
})

export type CsvRowInput = z.infer<typeof csvRowSchema>

// For reschedule revision
export const rescheduleRevisionSchema = z.object({
  new_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
})

export type RescheduleRevisionInput = z.infer<typeof rescheduleRevisionSchema>
