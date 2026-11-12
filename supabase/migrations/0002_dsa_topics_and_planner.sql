-- Phase 2: DSA, topic roadmap, revision and study planning.
create table if not exists public.learning_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  confidence_score smallint check (confidence_score between 1 and 5),
  assessment_status text not null default 'not_assessed' check (assessment_status in ('not_assessed','needs_work','progressing','strong')),
  interview_ready boolean,
  evidence_notes text,
  last_revised_at timestamptz,
  next_revision_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, category),
  unique (id, user_id)
);

create table if not exists public.dsa_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  normalized_url text,
  url text,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  patterns text[] not null default '{}',
  source text,
  status text not null default 'not_started' check (status in ('not_started','attempted','solved','needs_revision','archived')),
  notes text,
  optimal_time_complexity text,
  optimal_space_complexity text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index if not exists dsa_questions_user_status_idx on public.dsa_questions(user_id, status);
create index if not exists dsa_questions_user_difficulty_idx on public.dsa_questions(user_id, difficulty);
create index if not exists dsa_questions_patterns_gin_idx on public.dsa_questions using gin(patterns);
create unique index if not exists dsa_questions_user_normalized_url_uidx
  on public.dsa_questions(user_id, normalized_url) where normalized_url is not null and archived_at is null;

create table if not exists public.dsa_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null,
  attempted_at timestamptz not null default now(),
  outcome text not null check (outcome in ('solved_independently','solved_with_hint','unable_to_solve','revisited')),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 0 and 1440),
  hint_used boolean not null default false,
  approach_notes text,
  mistake_notes text,
  time_complexity text,
  space_complexity text,
  code_language text not null default 'Java',
  created_at timestamptz not null default now(),
  constraint dsa_attempts_question_owner_fk foreign key (question_id, user_id)
    references public.dsa_questions(id, user_id) on delete cascade
);
create index if not exists dsa_attempts_user_question_idx on public.dsa_attempts(user_id, question_id, attempted_at desc);

create table if not exists public.revision_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null,
  scheduled_for date not null,
  interval_days integer not null check (interval_days > 0),
  status text not null default 'pending' check (status in ('pending','completed','rescheduled','skipped')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint revision_schedules_question_owner_fk foreign key (question_id, user_id)
    references public.dsa_questions(id, user_id) on delete cascade
);
create index if not exists revision_schedules_user_date_idx on public.revision_schedules(user_id, scheduled_for, status);
create unique index if not exists revision_schedules_pending_uidx
  on public.revision_schedules(user_id, question_id, scheduled_for) where status = 'pending';

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'other' check (category in ('dsa','java','spring_boot','cs_fundamentals','system_design','project','interview','job_search','other')),
  planned_for date not null,
  estimated_minutes integer not null default 30 check (estimated_minutes between 0 and 1440),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','deferred')),
  question_id uuid,
  learning_topic_id uuid,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint study_tasks_question_owner_fk foreign key (question_id, user_id)
    references public.dsa_questions(id, user_id),
  constraint study_tasks_topic_owner_fk foreign key (learning_topic_id, user_id)
    references public.learning_topics(id, user_id)
);
create index if not exists study_tasks_user_date_idx on public.study_tasks(user_id, planned_for, status);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid,
  category text not null default 'other',
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 0 and 1440),
  notes text,
  created_at timestamptz not null default now(),
  constraint study_sessions_task_owner_fk foreign key (task_id, user_id)
    references public.study_tasks(id, user_id)
);

create trigger learning_topics_updated_at before update on public.learning_topics for each row execute function public.set_updated_at();
create trigger dsa_questions_updated_at before update on public.dsa_questions for each row execute function public.set_updated_at();
create trigger revision_schedules_updated_at before update on public.revision_schedules for each row execute function public.set_updated_at();
create trigger study_tasks_updated_at before update on public.study_tasks for each row execute function public.set_updated_at();

alter table public.learning_topics enable row level security;
alter table public.dsa_questions enable row level security;
alter table public.dsa_attempts enable row level security;
alter table public.revision_schedules enable row level security;
alter table public.study_tasks enable row level security;
alter table public.study_sessions enable row level security;

create policy "learning_topics_owner_all" on public.learning_topics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dsa_questions_owner_all" on public.dsa_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dsa_attempts_owner_all" on public.dsa_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "revision_schedules_owner_all" on public.revision_schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_tasks_owner_all" on public.study_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_sessions_owner_all" on public.study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Important: application code must also verify that a referenced question/topic belongs to auth.uid().
