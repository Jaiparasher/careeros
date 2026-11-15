import { describe, it, expect } from 'vitest'
import { extractProblemSlug, normalizeProblemUrl } from '../src/features/dsa/normalize'

describe('extractProblemSlug', () => {
  it('extracts slug from a standard URL', () => {
    expect(extractProblemSlug('https://leetcode.com/problems/two-sum/')).toBe('two-sum')
  })

  it('extracts slug from URL without trailing slash', () => {
    expect(extractProblemSlug('https://leetcode.com/problems/two-sum')).toBe('two-sum')
  })

  it('extracts slug from URL with query params', () => {
    expect(
      extractProblemSlug('https://leetcode.com/problems/two-sum/?lang=python'),
    ).toBe('two-sum')
  })

  it('extracts slug from URL with trailing content after slug', () => {
    expect(
      extractProblemSlug('https://leetcode.com/problems/two-sum/discuss/'),
    ).toBe('two-sum')
  })

  it('extracts slug from http:// variant', () => {
    expect(extractProblemSlug('http://leetcode.com/problems/valid-parentheses/')).toBe(
      'valid-parentheses',
    )
  })

  it('extracts slug from www.leetcode.com variant', () => {
    expect(
      extractProblemSlug('https://www.leetcode.com/problems/merge-two-sorted-lists/'),
    ).toBe('merge-two-sorted-lists')
  })

  it('handles URL with hash fragment', () => {
    expect(
      extractProblemSlug('https://leetcode.com/problems/two-sum/#approach-1'),
    ).toBe('two-sum')
  })

  it('returns null for non-LeetCode URL', () => {
    expect(extractProblemSlug('https://hackerrank.com/problems/two-sum/')).toBeNull()
  })

  it('returns null for a bare domain with no /problems/ path', () => {
    expect(extractProblemSlug('https://leetcode.com/')).toBeNull()
  })

  it('returns null for a malformed URL', () => {
    expect(extractProblemSlug('not-a-url')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractProblemSlug('')).toBeNull()
  })

  it('returns null for LeetCode URL with no slug after /problems/', () => {
    expect(extractProblemSlug('https://leetcode.com/problems/')).toBeNull()
  })
})

describe('normalizeProblemUrl', () => {
  it('normalizes a standard URL to canonical form', () => {
    expect(normalizeProblemUrl('https://leetcode.com/problems/two-sum/')).toBe(
      'https://leetcode.com/problems/two-sum/',
    )
  })

  it('strips query params and normalizes', () => {
    expect(
      normalizeProblemUrl('https://leetcode.com/problems/two-sum/?lang=py'),
    ).toBe('https://leetcode.com/problems/two-sum/')
  })

  it('normalizes http:// to https://', () => {
    expect(normalizeProblemUrl('http://leetcode.com/problems/two-sum/')).toBe(
      'https://leetcode.com/problems/two-sum/',
    )
  })

  it('normalizes www.leetcode.com to leetcode.com canonical', () => {
    expect(
      normalizeProblemUrl('https://www.leetcode.com/problems/two-sum/'),
    ).toBe('https://leetcode.com/problems/two-sum/')
  })

  it('strips trailing content after slug', () => {
    expect(
      normalizeProblemUrl('https://leetcode.com/problems/two-sum/discuss/'),
    ).toBe('https://leetcode.com/problems/two-sum/')
  })

  it('returns null for non-LeetCode URL', () => {
    expect(normalizeProblemUrl('https://geeksforgeeks.org/two-sum/')).toBeNull()
  })

  it('returns null for malformed URL', () => {
    expect(normalizeProblemUrl(':::bad:::url')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(normalizeProblemUrl('')).toBeNull()
  })
})
