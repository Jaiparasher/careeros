'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  addQuestionSchema,
  recordAttemptSchema,
  rescheduleRevisionSchema,
  csvRowSchema,
} from './schema'
import { getRevisionStatus, getNextRevisionIntervalDays, getNextRevisionDate } from './revision'
import { syncGrind75Collection, type SyncResult } from './grind75-sync'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> = T extends undefined
  ? { success: true } | { success: false; error: string }
  : { success: true; data: T } | { success: false; error: string }

function normalizeUrl(url: string): string | null {
  if (!url || url.trim() === '') return null
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.hostname.toLowerCase()}${u.pathname.replace(/\/+$/, '')}`.toLowerCase()
  } catch {
    return null
  }
}

function parseQuestionInput(input: unknown) {
  if (typeof FormData !== 'undefined' && input instanceof FormData) {
    const title = input.get('title') as string
    const url = (input.get('url') || input.get('leetcode_url') || '') as string
    const difficulty = input.get('difficulty') as string
    const patternsRaw = (input.get('patterns') || input.get('topics') || '') as string
    const patterns = patternsRaw
      ? patternsRaw.split(/[,;]/).map((p) => p.trim()).filter(Boolean)
      : []
    const source = (input.get('source') || '') as string
    const notes = (input.get('notes') || '') as string
    const optimal_time_complexity = (input.get('optimal_time_complexity') || '') as string
    const optimal_space_complexity = (input.get('optimal_space_complexity') || '') as string

    return {
      title,
      url: url.trim(),
      difficulty,
      patterns,
      source: source || undefined,
      notes: notes || undefined,
      optimal_time_complexity: optimal_time_complexity || undefined,
      optimal_space_complexity: optimal_space_complexity || undefined,
    }
  }
  return input
}

function parseAttemptInput(input: unknown) {
  if (typeof FormData !== 'undefined' && input instanceof FormData) {
    const outcome = input.get('outcome') as string
    const durationRaw = input.get('duration_minutes') as string
    const duration_minutes = durationRaw ? parseInt(durationRaw, 10) : undefined
    const hint_used = input.get('hint_used') === 'true' || input.get('hint_used') === 'on'
    const approach_notes = (input.get('approach_notes') || '') as string
    const mistake_notes = (input.get('mistake_notes') || '') as string
    const time_complexity = (input.get('time_complexity') || '') as string
    const space_complexity = (input.get('space_complexity') || '') as string
    const code_language = (input.get('code_language') || 'Java') as string

    return {
      outcome,
      duration_minutes: Number.isNaN(duration_minutes) ? undefined : duration_minutes,
      hint_used,
      approach_notes: approach_notes || undefined,
      mistake_notes: mistake_notes || undefined,
      time_complexity: time_complexity || undefined,
      space_complexity: space_complexity || undefined,
      code_language,
    }
  }
  return input
}

// ─── Question actions ────────────────────────────────────────────────────────

export async function addQuestionAction(formData: unknown): Promise<ActionResult> {
  const parsed = addQuestionSchema.safeParse(parseQuestionInput(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const input = parsed.data
  const normalizedUrl = input.url ? normalizeUrl(input.url) : null

  const { error } = await supabase.from('dsa_questions').insert({
    user_id: user.id,
    title: input.title,
    url: input.url || null,
    normalized_url: normalizedUrl,
    difficulty: input.difficulty,
    patterns: input.patterns,
    source: input.source || null,
    notes: input.notes || null,
    optimal_time_complexity: input.optimal_time_complexity || null,
    optimal_space_complexity: input.optimal_space_complexity || null,
    status: 'not_started',
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A question with this URL already exists.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/dsa')
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

export async function updateQuestionAction(id: string, formData: unknown): Promise<ActionResult> {
  const parsed = addQuestionSchema.safeParse(parseQuestionInput(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const input = parsed.data
  const normalizedUrl = input.url ? normalizeUrl(input.url) : null

  // Update only non-collection fields; never overwrite collection_tags/collection_order
  const { error } = await supabase
    .from('dsa_questions')
    .update({
      title: input.title,
      url: input.url || null,
      normalized_url: normalizedUrl,
      difficulty: input.difficulty,
      patterns: input.patterns,
      source: input.source || null,
      notes: input.notes || null,
      optimal_time_complexity: input.optimal_time_complexity || null,
      optimal_space_complexity: input.optimal_space_complexity || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dsa')
  revalidatePath(`/dsa/${id}`)
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

export async function archiveQuestionAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const { error } = await supabase
    .from('dsa_questions')
    .update({ archived_at: new Date().toISOString(), status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dsa')
  revalidatePath(`/dsa/${id}`)
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

export async function updateQuestionNotesAction(
  id: string,
  notes: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const { error } = await supabase
    .from('dsa_questions')
    .update({ notes: notes.trim() || null })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dsa')
  revalidatePath(`/dsa/${id}`)
  return { success: true }
}

// ─── Attempt actions ─────────────────────────────────────────────────────────

export async function recordAttemptAction(
  questionId: string,
  formData: unknown
): Promise<ActionResult> {
  const parsed = recordAttemptSchema.safeParse(parseAttemptInput(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const input = parsed.data
  const now = new Date().toISOString()

  // Insert attempt
  const { error: attemptErr } = await supabase.from('dsa_attempts').insert({
    user_id: user.id,
    question_id: questionId,
    attempted_at: now,
    outcome: input.outcome,
    duration_minutes: input.duration_minutes ?? null,
    hint_used: input.hint_used,
    approach_notes: input.approach_notes || null,
    mistake_notes: input.mistake_notes || null,
    time_complexity: input.time_complexity || null,
    space_complexity: input.space_complexity || null,
    code_language: input.code_language,
  })

  if (attemptErr) return { success: false, error: attemptErr.message }

  // Update question status
  const newStatus = getRevisionStatus(input.outcome)
  const { error: statusErr } = await supabase
    .from('dsa_questions')
    .update({ status: newStatus })
    .eq('id', questionId)
    .eq('user_id', user.id)

  if (statusErr) return { success: false, error: statusErr.message }

  // Schedule revision if applicable
  const { data: existingRev } = await supabase
    .from('revision_schedules')
    .select('interval_days')
    .eq('question_id', questionId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  const currentInterval = existingRev?.interval_days ?? null
  const intervalDays = getNextRevisionIntervalDays(currentInterval, input.outcome)
  if (intervalDays !== null) {
    const scheduledFor = getNextRevisionDate(new Date(), intervalDays).toISOString().slice(0, 10)
    // Cancel any existing pending revision for this question (upsert via delete+insert)
    await supabase
      .from('revision_schedules')
      .update({ status: 'rescheduled' })
      .eq('question_id', questionId)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    await supabase.from('revision_schedules').insert({
      user_id: user.id,
      question_id: questionId,
      scheduled_for: scheduledFor,
      interval_days: intervalDays,
      status: 'pending',
    })
  }

  revalidatePath('/dsa')
  revalidatePath(`/dsa/${questionId}`)
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

// ─── Revision actions ────────────────────────────────────────────────────────

export async function completeRevisionAction(revisionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const now = new Date().toISOString()

  // Fetch the revision to get question_id and interval_days
  const { data: revision, error: revErr } = await supabase
    .from('revision_schedules')
    .select('question_id, interval_days')
    .eq('id', revisionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (revErr || !revision) {
    return { success: false, error: revErr?.message ?? 'Revision not found.' }
  }

  // Mark completed
  const { error: updateErr } = await supabase
    .from('revision_schedules')
    .update({ status: 'completed', completed_at: now })
    .eq('id', revisionId)
    .eq('user_id', user.id)

  if (updateErr) return { success: false, error: updateErr.message }

  // Look up last attempt outcome for this question
  const { data: lastAttempt } = await supabase
    .from('dsa_attempts')
    .select('outcome')
    .eq('question_id', revision.question_id)
    .eq('user_id', user.id)
    .order('attempted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const outcome = (lastAttempt?.outcome ?? 'solved_independently') as
    | 'solved_independently'
    | 'solved_with_hint'
    | 'unable_to_solve'
    | 'revisited'
  const intervalDays = getNextRevisionIntervalDays(revision.interval_days, outcome)

  if (intervalDays !== null) {
    const scheduledFor = getNextRevisionDate(new Date(), intervalDays).toISOString().slice(0, 10)
    await supabase.from('revision_schedules').insert({
      user_id: user.id,
      question_id: revision.question_id,
      scheduled_for: scheduledFor,
      interval_days: intervalDays,
      status: 'pending',
      notes: outcome !== 'revisited' ? `After ${outcome}` : undefined,
    })
  }

  revalidatePath('/dsa')
  revalidatePath(`/dsa/${revision.question_id}`)
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

export async function rescheduleRevisionAction(
  revisionId: string,
  formData: unknown
): Promise<ActionResult> {
  const parsed = rescheduleRevisionSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  // Fetch existing revision
  const { data: existing, error: fetchErr } = await supabase
    .from('revision_schedules')
    .select('question_id, interval_days')
    .eq('id', revisionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchErr || !existing) {
    return { success: false, error: fetchErr?.message ?? 'Revision not found.' }
  }

  // Mark old as rescheduled
  const { error: oldErr } = await supabase
    .from('revision_schedules')
    .update({ status: 'rescheduled' })
    .eq('id', revisionId)
    .eq('user_id', user.id)

  if (oldErr) return { success: false, error: oldErr.message }

  // Insert new pending revision
  const { error: newErr } = await supabase.from('revision_schedules').insert({
    user_id: user.id,
    question_id: existing.question_id,
    scheduled_for: parsed.data.new_date,
    interval_days: existing.interval_days,
    status: 'pending',
    notes: parsed.data.reason || null,
  })

  if (newErr) return { success: false, error: newErr.message }

  revalidatePath('/dsa')
  revalidatePath(`/dsa/${existing.question_id}`)
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

export async function skipRevisionAction(
  revisionId: string,
  reason?: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const { error } = await supabase
    .from('revision_schedules')
    .update({ status: 'skipped', notes: reason ?? null })
    .eq('id', revisionId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dsa')
  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { success: true }
}

// ─── Grind 75 sync ───────────────────────────────────────────────────────────

export async function syncGrind75Action(): Promise<ActionResult<SyncResult>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const result = await syncGrind75Collection(supabase, user.id)
  revalidatePath('/dsa')
  return { success: true, data: result }
}

// ─── CSV import / export ─────────────────────────────────────────────────────

export async function importQuestionsFromCSVAction(
  rows: unknown[]
): Promise<ActionResult<{ imported: number; skipped: number; errors: string[] }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const parsed = csvRowSchema.safeParse(rows[i])
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues[0]?.message ?? 'Invalid row'}`)
      continue
    }

    const row = parsed.data
    const normalizedUrl = row.url ? normalizeUrl(row.url) : null
    const patterns = row.patterns
      ? row.patterns.split(';').map((p) => p.trim()).filter(Boolean)
      : []

    // Check for duplicate by normalized URL
    if (normalizedUrl) {
      const { data: dup } = await supabase
        .from('dsa_questions')
        .select('id')
        .eq('user_id', user.id)
        .eq('normalized_url', normalizedUrl)
        .is('archived_at', null)
        .maybeSingle()

      if (dup) {
        skipped++
        continue
      }
    }

    const { error: insertErr } = await supabase.from('dsa_questions').insert({
      user_id: user.id,
      title: row.title,
      url: row.url || null,
      normalized_url: normalizedUrl,
      difficulty: row.difficulty,
      patterns,
      source: row.source || null,
      status: row.status ?? 'not_started',
      notes: row.notes || null,
      optimal_time_complexity: row.time_complexity || null,
      optimal_space_complexity: row.space_complexity || null,
    })

    if (insertErr) {
      if (insertErr.code === '23505') {
        skipped++
      } else {
        errors.push(`Row ${i + 1} "${row.title}": ${insertErr.message}`)
      }
    } else {
      imported++
    }
  }

  revalidatePath('/dsa')
  return { success: true, data: { imported, skipped, errors } }
}

export async function exportQuestionsCSVAction(): Promise<ActionResult<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Authentication required.' }

  const { data, error } = await supabase
    .from('dsa_questions')
    .select('title, url, difficulty, patterns, source, status, notes, optimal_time_complexity, optimal_space_complexity')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }

  const header = 'title,url,difficulty,patterns,source,status,notes,time_complexity,space_complexity'

  function escapeCSV(val: string | null | undefined): string {
    if (val == null) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = (data ?? []).map((q) => {
    const patternsStr = Array.isArray(q.patterns) ? q.patterns.join(';') : ''
    return [
      escapeCSV(q.title),
      escapeCSV(q.url),
      escapeCSV(q.difficulty),
      escapeCSV(patternsStr),
      escapeCSV(q.source),
      escapeCSV(q.status),
      escapeCSV(q.notes),
      escapeCSV(q.optimal_time_complexity),
      escapeCSV(q.optimal_space_complexity),
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')
  return { success: true, data: csv }
}
