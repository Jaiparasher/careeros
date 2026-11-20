-- Migration 0014: Phase 4 Remediation Batch C — Database Integrity & Security Hardening
--
-- Findings addressed:
-- 1. M-08: Enforce composite tenant foreign key on interview_questions(question_bank_id, user_id)
--          and database CHECK constraints on interview score columns.
-- 2. N-03: Correct project_bugs_feature_owner_fk to ON DELETE SET NULL (feature_id),
--          preventing deletion failures on features with linked bugs.
-- 3. L-08: Harden accept_study_recommendation RPC with fixed safe search_path and
--          least-privilege execution permissions (revoking PUBLIC/anon, granting authenticated).
--
-- Safety Guarantees:
-- - Forward-only and idempotent.
-- - Strictly preserves existing data and multi-tenant RLS isolation.
-- - DO NOT APPLY TO LIVE SUPABASE AS PART OF BATCH C (authoring & deterministic testing only).

-- ============================================================================
-- 1. M-08 — Interview Question Ownership Integrity & Score Bounds
-- ============================================================================

-- 1a. Drop single-column foreign key on interview_questions.question_bank_id
alter table public.interview_questions
  drop constraint if exists interview_questions_question_bank_id_fkey,
  drop constraint if exists interview_questions_bank_owner_fk;

-- 1b. Add composite owner-scoped foreign key ensuring question_bank_id belongs to the same user
-- Uses ON DELETE SET NULL (question_bank_id) to set only the referencing ID to null if the bank entry is removed
alter table public.interview_questions
  add constraint interview_questions_bank_owner_fk
  foreign key (question_bank_id, user_id)
  references public.interview_question_bank(id, user_id)
  on delete set null (question_bank_id);

-- 1c. Add CHECK constraint on interview_questions.score (0.00 to 10.00)
alter table public.interview_questions
  drop constraint if exists interview_questions_score_check;

alter table public.interview_questions
  add constraint interview_questions_score_check
  check (score is null or (score >= 0 and score <= 10));

-- 1d. Add CHECK constraint on interview_sessions.overall_score (0.00 to 10.00)
alter table public.interview_sessions
  drop constraint if exists interview_sessions_overall_score_check;

alter table public.interview_sessions
  add constraint interview_sessions_overall_score_check
  check (overall_score is null or (overall_score >= 0 and overall_score <= 10));


-- ============================================================================
-- 2. N-03 — Project Bug/Feature Foreign-Key Deletion Correction
-- ============================================================================

-- 2a. Drop composite foreign key with bare ON DELETE SET NULL
alter table public.project_bugs
  drop constraint if exists project_bugs_feature_owner_fk;

-- 2b. Recreate composite foreign key with ON DELETE SET NULL (feature_id)
-- This allows deleting a feature without PostgreSQL attempting to set the NOT NULL user_id column to NULL.
alter table public.project_bugs
  add constraint project_bugs_feature_owner_fk
  foreign key (feature_id, user_id)
  references public.project_features(id, user_id)
  on delete set null (feature_id);


-- ============================================================================
-- 3. L-08 — Phase 4 Batch 4 RPC Hardening
-- ============================================================================

-- 3a. Recreate accept_study_recommendation with fixed search_path = public, pg_temp
create or replace function public.accept_study_recommendation(
  p_title text,
  p_description text default null,
  p_category text default 'other',
  p_planned_for date default current_date,
  p_estimated_minutes integer default 30,
  p_priority text default 'normal',
  p_study_plan_id uuid default null,
  p_question_id uuid default null,
  p_learning_topic_id uuid default null,
  p_interview_question_id uuid default null,
  p_idempotency_key text default null,
  p_notes text default null
)
returns public.study_tasks
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_task public.study_tasks;
begin
  if v_user_id is null then
    raise exception 'Unauthorized: Caller must be authenticated';
  end if;

  -- Fast path: if idempotency key already exists for this user, return existing record
  if p_idempotency_key is not null then
    select * into v_task
    from public.study_tasks
    where user_id = v_user_id and idempotency_key = p_idempotency_key
    limit 1;

    if found then
      return v_task;
    end if;
  end if;

  -- Atomic insert with conflict resolution on unique index
  insert into public.study_tasks (
    user_id,
    title,
    description,
    category,
    planned_for,
    estimated_minutes,
    priority,
    status,
    study_plan_id,
    question_id,
    learning_topic_id,
    interview_question_id,
    idempotency_key,
    notes
  ) values (
    v_user_id,
    p_title,
    p_description,
    p_category,
    p_planned_for,
    p_estimated_minutes,
    p_priority,
    'pending',
    p_study_plan_id,
    p_question_id,
    p_learning_topic_id,
    p_interview_question_id,
    p_idempotency_key,
    p_notes
  )
  on conflict (user_id, idempotency_key) where idempotency_key is not null
  do update set updated_at = now()
  returning * into v_task;

  return v_task;
end;
$$;

-- 3b. Apply least-privilege permissions: revoke from public/anon/service_role, grant strictly to authenticated
revoke all on function public.accept_study_recommendation(
  text, text, text, date, integer, text, uuid, uuid, uuid, uuid, text, text
) from public;

revoke all on function public.accept_study_recommendation(
  text, text, text, date, integer, text, uuid, uuid, uuid, uuid, text, text
) from anon;

revoke all on function public.accept_study_recommendation(
  text, text, text, date, integer, text, uuid, uuid, uuid, uuid, text, text
) from service_role;

grant execute on function public.accept_study_recommendation(
  text, text, text, date, integer, text, uuid, uuid, uuid, uuid, text, text
) to authenticated;
