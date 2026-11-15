import { describe, it, expect } from 'vitest'
import {
  getNextRevisionIntervalDays,
  getNextRevisionDate,
  getRevisionStatus,
  SOLVED_INDEPENDENTLY_INTERVALS,
  SOLVED_WITH_HINT_INTERVALS,
} from '@/features/dsa/revision'

describe('DSA Spaced Revision Logic', () => {
  describe('Interval Constants', () => {
    it('defines standard intervals for independent solves [1, 3, 7, 14, 30]', () => {
      expect(SOLVED_INDEPENDENTLY_INTERVALS).toEqual([1, 3, 7, 14, 30])
    })

    it('defines conservative intervals for hint-assisted solves [1, 1, 3, 7, 14]', () => {
      expect(SOLVED_WITH_HINT_INTERVALS).toEqual([1, 1, 3, 7, 14])
    })
  })

  describe('getNextRevisionIntervalDays - solved_independently', () => {
    it('starts at 1 day for new question (currentInterval = null)', () => {
      expect(getNextRevisionIntervalDays(null, 'solved_independently')).toBe(1)
    })

    it('advances 1 -> 3', () => {
      expect(getNextRevisionIntervalDays(1, 'solved_independently')).toBe(3)
    })

    it('advances 3 -> 7', () => {
      expect(getNextRevisionIntervalDays(3, 'solved_independently')).toBe(7)
    })

    it('advances 7 -> 14', () => {
      expect(getNextRevisionIntervalDays(7, 'solved_independently')).toBe(14)
    })

    it('advances 14 -> 30', () => {
      expect(getNextRevisionIntervalDays(14, 'solved_independently')).toBe(30)
    })

    it('returns null at 30 days (mastered - no more revisions)', () => {
      expect(getNextRevisionIntervalDays(30, 'solved_independently')).toBeNull()
    })

    it('restarts at 1 if an unknown interval is provided', () => {
      expect(getNextRevisionIntervalDays(5, 'solved_independently')).toBe(1)
    })
  })

  describe('getNextRevisionIntervalDays - solved_with_hint', () => {
    it('starts at 1 day for new question', () => {
      expect(getNextRevisionIntervalDays(null, 'solved_with_hint')).toBe(1)
    })

    it('handles the progression: 1 -> 3, 3 -> 7, 7 -> 14', () => {
      expect(getNextRevisionIntervalDays(3, 'solved_with_hint')).toBe(7)
      expect(getNextRevisionIntervalDays(7, 'solved_with_hint')).toBe(14)
    })

    it('repeats 14 days and never grants mastery (does not return null or 30)', () => {
      expect(getNextRevisionIntervalDays(14, 'solved_with_hint')).toBe(14)
    })
  })

  describe('getNextRevisionIntervalDays - unable_to_solve', () => {
    it('always returns 1 day regardless of current interval', () => {
      expect(getNextRevisionIntervalDays(null, 'unable_to_solve')).toBe(1)
      expect(getNextRevisionIntervalDays(1, 'unable_to_solve')).toBe(1)
      expect(getNextRevisionIntervalDays(7, 'unable_to_solve')).toBe(1)
      expect(getNextRevisionIntervalDays(30, 'unable_to_solve')).toBe(1)
    })
  })

  describe('getNextRevisionIntervalDays - revisited', () => {
    it('returns null for revisited (no new interval scheduled directly from revisit)', () => {
      expect(getNextRevisionIntervalDays(null, 'revisited')).toBeNull()
      expect(getNextRevisionIntervalDays(7, 'revisited')).toBeNull()
    })
  })

  describe('getNextRevisionDate', () => {
    it('adds interval days correctly to given date', () => {
      const base = new Date('2026-11-15T00:00:00.000Z')
      const next1 = getNextRevisionDate(base, 1)
      expect(next1.getDate()).toBe(16)

      const next7 = getNextRevisionDate(base, 7)
      expect(next7.getDate()).toBe(22)

      const next30 = getNextRevisionDate(base, 30)
      expect(next30.getMonth()).toBe(11) // December (0-indexed)
      expect(next30.getDate()).toBe(15)
    })

    it('does not mutate original date', () => {
      const base = new Date('2026-11-15T00:00:00.000Z')
      const origTime = base.getTime()
      getNextRevisionDate(base, 7)
      expect(base.getTime()).toBe(origTime)
    })
  })

  describe('getRevisionStatus', () => {
    it('maps solved_independently -> solved', () => {
      expect(getRevisionStatus('solved_independently')).toBe('solved')
    })

    it('maps solved_with_hint -> attempted', () => {
      expect(getRevisionStatus('solved_with_hint')).toBe('attempted')
    })

    it('maps unable_to_solve -> needs_revision', () => {
      expect(getRevisionStatus('unable_to_solve')).toBe('needs_revision')
    })

    it('maps revisited -> attempted', () => {
      expect(getRevisionStatus('revisited')).toBe('attempted')
    })
  })
})
