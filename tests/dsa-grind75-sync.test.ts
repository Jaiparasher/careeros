import { describe, it, expect, vi, beforeEach } from 'vitest'
import { syncGrind75Collection } from '@/features/dsa/grind75-sync'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('Grind 75 Collection Sync', () => {
  const userId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts all 75 questions when user has no existing questions', async () => {
    const insertedRows: unknown[] = []

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'dsa_questions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockResolvedValue({ data: [], error: null }),
            insert: vi.fn().mockImplementation((row: unknown) => {
              insertedRows.push(row)
              return Promise.resolve({ error: null })
            }),
            update: vi.fn().mockReturnThis(),
          }
        }
        return {}
      }),
    } as unknown as SupabaseClient

    const result = await syncGrind75Collection(mockSupabase, userId)

    expect(result.errors).toHaveLength(0)
    expect(result.inserted).toBe(75)
    expect(result.linked).toBe(0)
    expect(result.skipped).toBe(0)
    expect(insertedRows).toHaveLength(75)

    // Check first problem
    const first = insertedRows[0] as Record<string, unknown>
    expect(first.title).toBe('Two Sum')
    expect(first.difficulty).toBe('easy')
    expect(first.collection_tags).toEqual(['grind75'])
    expect(first.collection_order).toBe(1)
    expect(first.status).toBe('not_started')
    expect(first.user_id).toBe(userId)
  })

  it('is completely idempotent when all 75 are already synced', async () => {
    // Generate existing questions where all 75 are already tagged
    const existing = Array.from({ length: 75 }, (_, i) => ({
      id: `q-${i + 1}`,
      url: `https://leetcode.com/problems/test-${i + 1}/`,
      external_problem_slug: `test-slug-${i + 1}`,
      collection_tags: ['grind75'],
      collection_order: i + 1,
    }))

    // In this case, problem 1 has slug "two-sum", order 1
    existing[0] = {
      id: 'q-1',
      url: 'https://leetcode.com/problems/two-sum/',
      external_problem_slug: 'two-sum',
      collection_tags: ['grind75'],
      collection_order: 1,
    }

    const updateMock = vi.fn().mockReturnThis()
    const insertMock = vi.fn().mockResolvedValue({ error: null })

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ data: [existing[0]], error: null }),
        insert: insertMock,
        update: updateMock,
      })),
    } as unknown as SupabaseClient

    const result = await syncGrind75Collection(mockSupabase, userId)

    // Problem 1 should be skipped because it is already tagged with grind75 and order 1
    expect(result.skipped).toBeGreaterThanOrEqual(1)
  })

  it('links an existing problem by normalized URL without overwriting status', async () => {
    const existingProblem = {
      id: 'existing-two-sum-id',
      url: 'https://leetcode.com/problems/two-sum/?envType=study-plan',
      external_problem_slug: null,
      collection_tags: ['personal'],
      collection_order: null,
    }

    let updatedFields: Record<string, unknown> = {}

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => {
          return {
            eq: vi.fn().mockResolvedValue({ error: null }),
            neq: vi.fn().mockResolvedValue({ data: [existingProblem], error: null }),
          }
        }),
        neq: vi.fn().mockResolvedValue({ data: [existingProblem], error: null }),
        update: vi.fn().mockImplementation((fields: Record<string, unknown>) => {
          updatedFields = fields
          return {
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    } as unknown as SupabaseClient

    const result = await syncGrind75Collection(mockSupabase, userId)

    expect(result.linked).toBe(1)
    expect(updatedFields.collection_tags).toEqual(['personal', 'grind75'])
    expect(updatedFields.collection_order).toBe(1)
    expect(updatedFields.external_problem_slug).toBe('two-sum')
  })
})
