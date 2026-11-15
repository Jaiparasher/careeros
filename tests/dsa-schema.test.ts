import { describe, it, expect } from 'vitest'
import {
  addQuestionSchema,
  recordAttemptSchema,
  csvRowSchema,
  rescheduleRevisionSchema,
} from '@/features/dsa/schema'

// ─── addQuestionSchema ───────────────────────────────────────────────────────

describe('addQuestionSchema', () => {
  it('validates a complete valid question', () => {
    const result = addQuestionSchema.safeParse({
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'easy',
      patterns: ['Array', 'Hash Table'],
      source: 'LeetCode',
      notes: 'Classic problem',
      optimal_time_complexity: 'O(n)',
      optimal_space_complexity: 'O(n)',
    })
    expect(result.success).toBe(true)
  })

  it('validates a minimal question (only required fields)', () => {
    const result = addQuestionSchema.safeParse({
      title: 'Binary Search',
      difficulty: 'easy',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.patterns).toEqual([])
    }
  })

  it('rejects missing title', () => {
    const result = addQuestionSchema.safeParse({
      difficulty: 'medium',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = addQuestionSchema.safeParse({
      title: '',
      difficulty: 'medium',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid URL', () => {
    const result = addQuestionSchema.safeParse({
      title: 'Two Sum',
      difficulty: 'easy',
      url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('allows empty string URL', () => {
    const result = addQuestionSchema.safeParse({
      title: 'Two Sum',
      difficulty: 'easy',
      url: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid difficulty', () => {
    const result = addQuestionSchema.safeParse({
      title: 'Two Sum',
      difficulty: 'extreme',
    })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding max length', () => {
    const result = addQuestionSchema.safeParse({
      title: 'A'.repeat(301),
      difficulty: 'easy',
    })
    expect(result.success).toBe(false)
  })
})

// ─── recordAttemptSchema ─────────────────────────────────────────────────────

describe('recordAttemptSchema', () => {
  it('validates solved_independently outcome', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'solved_independently',
      duration_minutes: 20,
      hint_used: false,
    })
    expect(result.success).toBe(true)
  })

  it('validates solved_with_hint outcome', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'solved_with_hint',
      hint_used: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code_language).toBe('Java')
    }
  })

  it('validates unable_to_solve outcome', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'unable_to_solve',
      mistake_notes: 'Did not handle edge case',
    })
    expect(result.success).toBe(true)
  })

  it('validates revisited outcome', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'revisited',
      approach_notes: 'Used sliding window',
      time_complexity: 'O(n)',
      space_complexity: 'O(1)',
      code_language: 'Python',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid outcome', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'partially_solved',
    })
    expect(result.success).toBe(false)
  })

  it('rejects duration below 0', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'solved_independently',
      duration_minutes: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects duration above 1440', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'solved_independently',
      duration_minutes: 1441,
    })
    expect(result.success).toBe(false)
  })

  it('allows 0 duration', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'revisited',
      duration_minutes: 0,
    })
    expect(result.success).toBe(true)
  })

  it('allows exactly 1440 duration', () => {
    const result = recordAttemptSchema.safeParse({
      outcome: 'revisited',
      duration_minutes: 1440,
    })
    expect(result.success).toBe(true)
  })

  it('defaults hint_used to false', () => {
    const result = recordAttemptSchema.safeParse({ outcome: 'solved_independently' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hint_used).toBe(false)
    }
  })
})

// ─── csvRowSchema ─────────────────────────────────────────────────────────────

describe('csvRowSchema', () => {
  it('validates a complete valid CSV row', () => {
    const result = csvRowSchema.safeParse({
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'easy',
      patterns: 'Array;Hash Table',
      source: 'LeetCode',
      status: 'not_started',
      notes: 'Classic problem',
      time_complexity: 'O(n)',
      space_complexity: 'O(n)',
    })
    expect(result.success).toBe(true)
  })

  it('validates a minimal CSV row (only required fields)', () => {
    const result = csvRowSchema.safeParse({
      title: 'Valid Parentheses',
      difficulty: 'easy',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('not_started')
    }
  })

  it('rejects missing title', () => {
    const result = csvRowSchema.safeParse({
      difficulty: 'easy',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = csvRowSchema.safeParse({
      title: '',
      difficulty: 'medium',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid difficulty', () => {
    const result = csvRowSchema.safeParse({
      title: 'Two Sum',
      difficulty: 'beginner',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = csvRowSchema.safeParse({
      title: 'Two Sum',
      difficulty: 'easy',
      status: 'done',
    })
    expect(result.success).toBe(false)
  })

  it('allows all valid statuses', () => {
    const statuses = ['not_started', 'attempted', 'solved', 'needs_revision'] as const
    for (const status of statuses) {
      const result = csvRowSchema.safeParse({ title: 'X', difficulty: 'easy', status })
      expect(result.success).toBe(true)
    }
  })

  it('allows optional fields to be absent', () => {
    const result = csvRowSchema.safeParse({ title: 'Climbing Stairs', difficulty: 'easy' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBeUndefined()
      expect(result.data.patterns).toBeUndefined()
      expect(result.data.notes).toBeUndefined()
    }
  })
})

// ─── rescheduleRevisionSchema ─────────────────────────────────────────────────

describe('rescheduleRevisionSchema', () => {
  it('validates a valid YYYY-MM-DD date', () => {
    const result = rescheduleRevisionSchema.safeParse({
      new_date: '2026-12-01',
    })
    expect(result.success).toBe(true)
  })

  it('validates with an optional reason', () => {
    const result = rescheduleRevisionSchema.safeParse({
      new_date: '2026-12-01',
      reason: 'Busy this week',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('Busy this week')
    }
  })

  it('rejects invalid date format (MM/DD/YYYY)', () => {
    const result = rescheduleRevisionSchema.safeParse({
      new_date: '12/01/2026',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-date string', () => {
    const result = rescheduleRevisionSchema.safeParse({
      new_date: 'next-monday',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing new_date', () => {
    const result = rescheduleRevisionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects reason exceeding max length', () => {
    const result = rescheduleRevisionSchema.safeParse({
      new_date: '2026-12-01',
      reason: 'X'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})
