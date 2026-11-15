/**
 * Grind 75 collection sync logic.
 * Pure sync algorithm using static JSON import — no fs calls.
 * Actual DB calls go through the passed SupabaseClient.
 * Idempotent: can be run multiple times safely.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import grind75Data from '../../../seed-data/grind75-core-problems.json'
import { normalizeProblemUrl } from './normalize'

export interface SyncResult {
  linked: number    // existing questions updated with grind75 tag
  inserted: number  // new questions created for unlinked grind75 items
  skipped: number   // already-linked items (idempotent)
  errors: string[]
}

interface DsaQuestion {
  id: string
  url: string | null
  external_problem_slug: string | null
  collection_tags: string[] | null
  collection_order: number | null
}

export async function syncGrind75Collection(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncResult> {
  const result: SyncResult = { linked: 0, inserted: 0, skipped: 0, errors: [] }

  // 1. Fetch all non-archived user questions
  const { data: existingQuestions, error: fetchError } = await supabase
    .from('dsa_questions')
    .select('id, url, external_problem_slug, collection_tags, collection_order')
    .eq('user_id', userId)
    .neq('status', 'archived')

  if (fetchError) {
    result.errors.push(`Failed to fetch existing questions: ${fetchError.message}`)
    return result
  }

  const questions: DsaQuestion[] = existingQuestions ?? []

  // 2. Build lookup maps
  const urlToQuestion = new Map<string, DsaQuestion>()
  const slugToQuestion = new Map<string, DsaQuestion>()

  for (const q of questions) {
    if (q.url) {
      const normalized = normalizeProblemUrl(q.url)
      if (normalized) urlToQuestion.set(normalized, q)
    }
    if (q.external_problem_slug) {
      slugToQuestion.set(q.external_problem_slug, q)
    }
  }

  const snapshotDate: string = grind75Data.source_snapshot_date
  const source: string = grind75Data.source

  // 3. Process each of the 75 problems
  for (const problem of grind75Data.problems) {
    try {
      const canonicalUrl = problem.leetcode_url
      const normalizedUrl = normalizeProblemUrl(canonicalUrl) ?? canonicalUrl

      // Look up by slug first, then by normalized URL
      const existing =
        slugToQuestion.get(problem.slug) ??
        urlToQuestion.get(normalizedUrl) ??
        null

      if (existing) {
        const tags: string[] = existing.collection_tags ?? []
        const alreadyTagged =
          tags.includes('grind75') && existing.collection_order === problem.order

        if (alreadyTagged) {
          result.skipped++
          continue
        }

        // Link: add grind75 tag and update metadata
        const updatedTags = tags.includes('grind75') ? tags : [...tags, 'grind75']
        const { error: updateError } = await supabase
          .from('dsa_questions')
          .update({
            collection_tags: updatedTags,
            collection_order: problem.order,
            external_problem_slug: problem.slug,
            source_snapshot_date: snapshotDate,
          })
          .eq('id', existing.id)
          .eq('user_id', userId)

        if (updateError) {
          result.errors.push(`Link ${problem.slug}: ${updateError.message}`)
        } else {
          result.linked++
        }
      } else {
        // Insert new question
        const { error: insertError } = await supabase
          .from('dsa_questions')
          .insert({
            user_id: userId,
            title: problem.title,
            url: canonicalUrl,
            normalized_url: normalizedUrl,
            difficulty: problem.difficulty,
            patterns: problem.topics,
            source: source,
            status: 'not_started',
            collection_tags: ['grind75'],
            collection_order: problem.order,
            external_problem_slug: problem.slug,
            source_snapshot_date: snapshotDate,
          })

        if (insertError) {
          result.errors.push(`Insert ${problem.slug}: ${insertError.message}`)
        } else {
          result.inserted++
        }
      }
    } catch (err) {
      result.errors.push(`Unexpected error for ${problem.slug}: ${String(err)}`)
    }
  }

  return result
}
