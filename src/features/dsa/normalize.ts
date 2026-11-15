/**
 * Normalizes LeetCode problem URLs for deduplication.
 */

const LEETCODE_HOSTS = new Set(['leetcode.com', 'www.leetcode.com'])

/**
 * Extracts the problem slug from a LeetCode URL.
 * Returns null for non-LeetCode URLs or if no slug can be extracted.
 */
export function extractProblemSlug(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  let parsed: URL
  try {
    // Ensure a protocol is present for URL parsing
    const normalized = url.startsWith('http') ? url : `https://${url}`
    parsed = new URL(normalized)
  } catch {
    return null
  }

  if (!LEETCODE_HOSTS.has(parsed.hostname)) return null

  // pathname: /problems/<slug>/...
  const parts = parsed.pathname.split('/').filter(Boolean)
  const problemsIdx = parts.indexOf('problems')
  if (problemsIdx === -1 || problemsIdx + 1 >= parts.length) return null

  const slug = parts[problemsIdx + 1]
  if (!slug) return null

  return slug
}

/**
 * Normalizes a LeetCode problem URL to its canonical form for deduplication.
 * Returns null for non-LeetCode URLs or if no slug can be extracted.
 *
 * Canonical form: https://leetcode.com/problems/<slug>/
 */
export function normalizeProblemUrl(url: string): string | null {
  const slug = extractProblemSlug(url)
  if (!slug) return null
  return `https://leetcode.com/problems/${slug}/`
}
