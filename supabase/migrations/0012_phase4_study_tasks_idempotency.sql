-- Migration 0012: Phase 4 Batch 4 — Database-Level Study Task Idempotency Protection
--
-- Objective:
-- Enforce database-level idempotency for accepted recommendations to prevent
-- concurrent race conditions and duplicate study tasks across simultaneous requests.
--
-- Safety:
-- 1. Adds nullable column idempotency_key to public.study_tasks.
-- 2. Preserves all existing study task records (idempotency_key is NULL).
-- 3. Imposes partial unique index scoped to user_id where idempotency_key IS NOT NULL.
-- 4. Manual tasks and existing tasks remain completely unrestricted.
-- 5. Cross-user isolation: User B's keys cannot conflict with or access User A's tasks.
-- 6. Adds atomic stored function accept_study_recommendation() using auth.uid().

-- 1. Add idempotency_key column to public.study_tasks
alter table public.study_tasks
add column if not exists idempotency_key text;

-- 2. Create partial unique index on (user_id, idempotency_key) where idempotency_key is not null
create unique index if not exists study_tasks_user_idempotency_idx
on public.study_tasks (user_id, idempotency_key)
where idempotency_key is not null;

-- 3. Create atomic recommendation acceptance function
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
