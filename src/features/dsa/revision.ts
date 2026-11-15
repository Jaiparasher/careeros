export type RevisionOutcome =
  | 'solved_independently'
  | 'solved_with_hint'
  | 'unable_to_solve'
  | 'revisited'

/** Standard spaced-repetition intervals for independently-solved problems (days). */
export const SOLVED_INDEPENDENTLY_INTERVALS: readonly number[] = [1, 3, 7, 14, 30]

/**
 * Standard spaced-repetition intervals for hint-assisted solves (days).
 * First two are both 1 to build confidence before spacing out.
 */
export const SOLVED_WITH_HINT_INTERVALS: readonly number[] = [1, 1, 3, 7, 14]

/**
 * Returns the next revision interval in days given the current interval and outcome.
 *
 * - `solved_independently`: advance through [1,3,7,14,30]; return null at 30 (mastered)
 * - `solved_with_hint`: advance through [1,1,3,7,14]; never reaches mastery (repeats last)
 * - `unable_to_solve`: always return 1
 * - `revisited`: return null (no further revision scheduled)
 */
export function getNextRevisionIntervalDays(
  currentIntervalDays: number | null,
  outcome: RevisionOutcome,
): number | null {
  switch (outcome) {
    case 'revisited':
      return null

    case 'unable_to_solve':
      return 1

    case 'solved_independently': {
      const intervals = SOLVED_INDEPENDENTLY_INTERVALS
      if (currentIntervalDays === null) {
        return intervals[0]!
      }
      const idx = intervals.indexOf(currentIntervalDays)
      if (idx === -1) {
        // Not in the standard sequence — restart from beginning
        return intervals[0]!
      }
      const next = intervals[idx + 1]
      if (next === undefined) {
        // Already at 30 — mastered, no more revisions
        return null
      }
      return next
    }

    case 'solved_with_hint': {
      const intervals = SOLVED_WITH_HINT_INTERVALS
      if (currentIntervalDays === null) {
        return intervals[0]!
      }
      // Find the last (rightmost) occurrence to handle the duplicate 1-day entries
      let idx = -1
      for (let i = intervals.length - 1; i >= 0; i--) {
        if (intervals[i] === currentIntervalDays) {
          idx = i
          break
        }
      }
      if (idx === -1) {
        return intervals[0]!
      }
      const next = intervals[idx + 1]
      if (next === undefined) {
        // At end of hint sequence — repeat last interval forever (never mastered)
        return intervals[intervals.length - 1]!
      }
      return next
    }
  }
}

/**
 * Adds `intervalDays` calendar days to `fromDate` and returns the new Date.
 */
export function getNextRevisionDate(fromDate: Date, intervalDays: number): Date {
  const result = new Date(fromDate)
  result.setDate(result.getDate() + intervalDays)
  return result
}

/**
 * Maps a revision outcome to a high-level status.
 */
export function getRevisionStatus(
  outcome: RevisionOutcome,
): 'solved' | 'needs_revision' | 'attempted' {
  switch (outcome) {
    case 'solved_independently':
      return 'solved'
    case 'unable_to_solve':
      return 'needs_revision'
    case 'solved_with_hint':
    case 'revisited':
      return 'attempted'
  }
}
