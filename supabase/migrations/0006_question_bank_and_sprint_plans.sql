-- Phase 2 extension: resume-wide interview question bank and study sprint plans.
-- Apply after migrations 0001-0005 after reviewing in a non-production Supabase project.

create table if not exists public.interview_question_bank (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_slug text not null,
  skill_name text not null,
  skill_category text not null,
  topic text not null,
  subtopic text,
  question_title text not null,
  question_prompt text not null,
  question_type text not null check (question_type in ('conceptual','coding','debugging','practical_scenario','design','behavioral','project_deep_dive','sql_exercise')),
  difficulty text not null check (difficulty in ('basic','intermediate','advanced')),
  priority text not null default 'medium' check (priority in ('critical','high','medium','low')),
  target_roles text[] not null default '{}',
  tags text[] not null default '{}',
  expected_answer_points jsonb not null default '[]'::jsonb,
  sample_answer text,
  follow_up_questions jsonb not null default '[]'::jsonb,
  estimated_minutes integer not null default 10 check (estimated_minutes between 1 and 240),
  source_name text not null default 'CareerOS curated',
  source_url text,
  source_external_id text,
  origin text not null default 'curated' check (origin in ('curated','user_added','imported','ai_generated')),
  status text not null default 'not_started' check (status in ('not_started','learning','attempted','answered','needs_revision','strong')),
  confidence_score smallint check (confidence_score between 1 and 5),
  last_attempted_at timestamptz,
  next_revision_at date,
  answer_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index if not exists interview_question_bank_user_skill_idx
  on public.interview_question_bank(user_id, skill_slug, topic, priority);
create index if not exists interview_question_bank_tags_gin_idx
  on public.interview_question_bank using gin(tags);
create index if not exists interview_question_bank_roles_gin_idx
  on public.interview_question_bank using gin(target_roles);
create unique index if not exists interview_question_bank_external_uidx
  on public.interview_question_bank(user_id, source_name, source_external_id)
  where source_external_id is not null;

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  plan_type text not null check (plan_type in ('30_day_sprint','priority_extension','custom')),
  starts_on date not null,
  target_ends_on date not null,
  status text not null default 'draft' check (status in ('draft','active','completed','paused','archived')),
  target_role text,
  daily_available_minutes integer not null check (daily_available_minutes between 1 and 1440),
  settings jsonb not null default '{}'::jsonb,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_ends_on >= starts_on),
  unique (id, user_id)
);
create index if not exists study_plans_user_status_idx on public.study_plans(user_id, status, starts_on);

-- Add collection metadata to existing DSA rows so Grind 75 entries can be linked without duplicate questions.
alter table public.dsa_questions
  add column if not exists collection_tags text[] not null default '{}',
  add column if not exists collection_order integer,
  add column if not exists external_problem_slug text,
  add column if not exists source_snapshot_date date;
create index if not exists dsa_questions_collection_tags_gin_idx
  on public.dsa_questions using gin(collection_tags);
create unique index if not exists dsa_questions_user_collection_order_uidx
  on public.dsa_questions(user_id, collection_order)
  where collection_order is not null and collection_tags @> array['grind75'];

-- Link existing daily tasks to a sprint and optionally to a non-DSA interview question.
alter table public.study_tasks
  add column if not exists study_plan_id uuid,
  add column if not exists interview_question_id uuid;

alter table public.study_tasks
  drop constraint if exists study_tasks_category_check;
alter table public.study_tasks
  add constraint study_tasks_category_check check (category in (
    'dsa','java','spring_boot','cs_fundamentals','system_design','project','interview',
    'interview_question','grind75','job_search','other'
  ));

alter table public.study_tasks
  add constraint study_tasks_plan_owner_fk foreign key (study_plan_id, user_id)
    references public.study_plans(id, user_id) on delete restrict;
alter table public.study_tasks
  add constraint study_tasks_interview_question_owner_fk foreign key (interview_question_id, user_id)
    references public.interview_question_bank(id, user_id) on delete restrict;

create index if not exists study_tasks_user_plan_date_idx
  on public.study_tasks(user_id, study_plan_id, planned_for);
create index if not exists interview_question_bank_due_idx
  on public.interview_question_bank(user_id, next_revision_at, status)
  where is_active = true;

create trigger interview_question_bank_updated_at
  before update on public.interview_question_bank
  for each row execute function public.set_updated_at();
create trigger study_plans_updated_at
  before update on public.study_plans
  for each row execute function public.set_updated_at();

alter table public.interview_question_bank enable row level security;
alter table public.study_plans enable row level security;

create policy "interview_question_bank_owner_all"
  on public.interview_question_bank for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "study_plans_owner_all"
  on public.study_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Archive plans and questions that have linked tasks; do not hard-delete referenced parent rows.
