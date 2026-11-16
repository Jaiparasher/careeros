-- Migration 0008: Phase 3 Job Application Tracker, Activity History, and Interview Rounds
-- Enhances job_applications, adds application_activity and application_interview_rounds with owner RLS.

-- 1. Ensure public.job_applications has composite unique (id, user_id) for tenant foreign keys
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'job_applications_id_user_id_key'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table public.job_applications add constraint job_applications_id_user_id_key unique (id, user_id);
  end if;
end $$;

-- 2. Extend public.job_applications with additional tracking attributes
alter table public.job_applications
  add column if not exists careers_url text,
  add column if not exists employment_type text not null default 'full_time'
    check (employment_type in ('full_time', 'contract', 'internship', 'part_time')),
  add column if not exists expected_ctc_lpa numeric(7,2)
    check (expected_ctc_lpa is null or expected_ctc_lpa >= 0),
  add column if not exists applied_salary_lpa numeric(7,2)
    check (applied_salary_lpa is null or applied_salary_lpa >= 0),
  add column if not exists referral_status text not null default 'not_requested'
    check (referral_status in ('not_requested', 'requested', 'referred', 'declined')),
  add column if not exists referral_contact text,
  add column if not exists offer_details jsonb not null default '{}'::jsonb;

-- 3. Create application_activity for stage transitions and chronological audit trail
create table if not exists public.application_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null,
  from_stage text,
  to_stage text,
  activity_type text not null default 'stage_change'
    check (activity_type in ('stage_change', 'created', 'interview_scheduled', 'interview_completed', 'note_added', 'followup_updated', 'offer_updated', 'archived')),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  constraint application_activity_app_owner_fk foreign key (application_id, user_id)
    references public.job_applications(id, user_id) on delete cascade
);

create index if not exists application_activity_user_app_idx
  on public.application_activity(user_id, application_id, created_at desc);

alter table public.application_activity enable row level security;

drop policy if exists "application_activity_owner_all" on public.application_activity;
create policy "application_activity_owner_all" on public.application_activity for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Create application_interview_rounds for multiple interview rounds per job application
create table if not exists public.application_interview_rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null,
  round_number integer not null default 1 check (round_number > 0),
  round_name text not null,
  interview_at timestamptz,
  interviewer_name text,
  interviewer_title text,
  topics text[] not null default '{}',
  questions_asked text[] not null default '{}',
  performance_notes text,
  result text not null default 'pending'
    check (result in ('pending', 'passed', 'failed', 'rescheduled', 'cancelled')),
  follow_up_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint application_interview_rounds_app_owner_fk foreign key (application_id, user_id)
    references public.job_applications(id, user_id) on delete cascade
);

create index if not exists application_interview_rounds_user_app_idx
  on public.application_interview_rounds(user_id, application_id, round_number);

drop trigger if exists application_interview_rounds_updated_at on public.application_interview_rounds;
create trigger application_interview_rounds_updated_at
  before update on public.application_interview_rounds
  for each row execute function public.set_updated_at();

alter table public.application_interview_rounds enable row level security;

drop policy if exists "application_interview_rounds_owner_all" on public.application_interview_rounds;
create policy "application_interview_rounds_owner_all" on public.application_interview_rounds for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
