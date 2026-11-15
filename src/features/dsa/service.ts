import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Row types (mirror DB columns exactly) ─────────────────────────────────

export interface DSAQuestionRow {
  id: string
  user_id: string
  title: string
  normalized_url: string | null
  url: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  patterns: string[]
  source: string | null
  status: 'not_started' | 'attempted' | 'solved' | 'needs_revision' | 'archived'
  notes: string | null
  optimal_time_complexity: string | null
  optimal_space_complexity: string | null
  archived_at: string | null
  collection_tags: string[]
  collection_order: number | null
  external_problem_slug: string | null
  source_snapshot_date: string | null
  created_at: string
  updated_at: string
}

export interface DSAAttemptRow {
  id: string
  user_id: string
  question_id: string
  attempted_at: string
  outcome: 'solved_independently' | 'solved_with_hint' | 'unable_to_solve' | 'revisited'
  duration_minutes: number | null
  hint_used: boolean
  approach_notes: string | null
  mistake_notes: string | null
  time_complexity: string | null
  space_complexity: string | null
  code_language: string
  created_at: string
}

export interface RevisionScheduleRow {
  id: string
  user_id: string
  question_id: string
  scheduled_for: string
  interval_days: number
  status: 'pending' | 'completed' | 'rescheduled' | 'skipped'
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DSAStats {
  total: number
  not_started: number
  attempted: number
  solved: number
  needs_revision: number
  grind75_linked: number
  grind75_solved: number
  overdue_revisions: number
}

export interface GetQuestionsOptions {
  status?: string
  difficulty?: string
  pattern?: string
  collection?: 'grind75'
  search?: string
  page?: number
  pageSize?: number
}

// ─── Service functions ──────────────────────────────────────────────────────

export async function getQuestions(
  supabase: SupabaseClient,
  userId: string,
  opts?: GetQuestionsOptions
): Promise<{ data: DSAQuestionRow[]; count: number }> {
  const page = opts?.page ?? 1
  const pageSize = opts?.pageSize ?? 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('dsa_questions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('collection_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (opts?.status) {
    query = query.eq('status', opts.status)
  }
  if (opts?.difficulty) {
    query = query.eq('difficulty', opts.difficulty)
  }
  if (opts?.pattern) {
    query = query.contains('patterns', [opts.pattern])
  }
  if (opts?.collection === 'grind75') {
    query = query.contains('collection_tags', ['grind75'])
  }
  if (opts?.search) {
    query = query.ilike('title', `%${opts.search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`getQuestions: ${error.message}`)
  }

  return { data: (data ?? []) as DSAQuestionRow[], count: count ?? 0 }
}

export async function getQuestion(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<{ question: DSAQuestionRow | null; attempts: DSAAttemptRow[]; revisions: RevisionScheduleRow[] }> {
  const { data: question, error: qErr } = await supabase
    .from('dsa_questions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (qErr) {
    throw new Error(`getQuestion: ${qErr.message}`)
  }

  if (!question) {
    return { question: null, attempts: [], revisions: [] }
  }

  const { data: attempts, error: aErr } = await supabase
    .from('dsa_attempts')
    .select('*')
    .eq('question_id', id)
    .eq('user_id', userId)
    .order('attempted_at', { ascending: false })

  if (aErr) {
    throw new Error(`getQuestion attempts: ${aErr.message}`)
  }

  const { data: revisions, error: rErr } = await supabase
    .from('revision_schedules')
    .select('*')
    .eq('question_id', id)
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: true })

  if (rErr) {
    throw new Error(`getQuestion revisions: ${rErr.message}`)
  }

  return {
    question: question as DSAQuestionRow,
    attempts: (attempts ?? []) as DSAAttemptRow[],
    revisions: (revisions ?? []) as RevisionScheduleRow[],
  }
}

export async function getDueRevisions(
  supabase: SupabaseClient,
  userId: string,
  asOfDate: string
): Promise<(RevisionScheduleRow & { question: Pick<DSAQuestionRow, 'id' | 'title' | 'difficulty' | 'patterns'> })[]> {
  const { data: revisions, error: revErr } = await supabase
    .from('revision_schedules')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('scheduled_for', asOfDate)
    .order('scheduled_for', { ascending: true })

  if (revErr) {
    throw new Error(`getDueRevisions: ${revErr.message}`)
  }

  if (!revisions || revisions.length === 0) {
    return []
  }

  const questionIds = Array.from(new Set(revisions.map((r) => r.question_id)))
  const { data: questions, error: qErr } = await supabase
    .from('dsa_questions')
    .select('id, title, difficulty, patterns')
    .eq('user_id', userId)
    .in('id', questionIds)

  if (qErr) {
    throw new Error(`getDueRevisions questions: ${qErr.message}`)
  }

  const qMap = new Map((questions ?? []).map((q) => [q.id, q]))
  return revisions.map((r) => ({
    ...(r as RevisionScheduleRow),
    question: qMap.get(r.question_id) ?? {
      id: r.question_id,
      title: 'Unknown Question',
      difficulty: 'medium' as const,
      patterns: [],
    },
  }))
}

export async function getDSAStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DSAStats> {
  const today = new Date().toISOString().slice(0, 10)

  // Fetch all non-archived questions for status counts
  const { data: questions, error: qErr } = await supabase
    .from('dsa_questions')
    .select('status, collection_tags')
    .eq('user_id', userId)
    .is('archived_at', null)

  if (qErr) {
    throw new Error(`getDSAStats questions: ${qErr.message}`)
  }

  const rows = (questions ?? []) as Pick<DSAQuestionRow, 'status' | 'collection_tags'>[]

  const total = rows.length
  const not_started = rows.filter((r) => r.status === 'not_started').length
  const attempted = rows.filter((r) => r.status === 'attempted').length
  const solved = rows.filter((r) => r.status === 'solved').length
  const needs_revision = rows.filter((r) => r.status === 'needs_revision').length

  const grind75Rows = rows.filter((r) => r.collection_tags?.includes('grind75'))
  const grind75_linked = grind75Rows.length
  const grind75_solved = grind75Rows.filter((r) => r.status === 'solved').length

  // Overdue pending revisions
  const { count: overdue_revisions, error: rErr } = await supabase
    .from('revision_schedules')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lt('scheduled_for', today)

  if (rErr) {
    throw new Error(`getDSAStats revisions: ${rErr.message}`)
  }

  return {
    total,
    not_started,
    attempted,
    solved,
    needs_revision,
    grind75_linked,
    grind75_solved,
    overdue_revisions: overdue_revisions ?? 0,
  }
}
