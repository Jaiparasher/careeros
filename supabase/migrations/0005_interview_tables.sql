-- Phase 4: AI mock interview records.
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  duration_target_minutes integer check (duration_target_minutes is null or duration_target_minutes between 1 and 240),
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  provider text,
  model text,
  prompt_version text,
  overall_feedback text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  sequence_number integer not null check (sequence_number > 0),
  question_text text not null,
  user_answer text,
  technical_correctness smallint check (technical_correctness between 1 and 5),
  completeness smallint check (completeness between 1 and 5),
  clarity smallint check (clarity between 1 and 5),
  practical_depth smallint check (practical_depth between 1 and 5),
  tradeoff_awareness smallint check (tradeoff_awareness between 1 and 5),
  strengths text,
  gaps text,
  improved_answer text,
  follow_up_question text,
  created_at timestamptz not null default now(),
  unique (session_id, sequence_number),
  constraint interview_questions_session_owner_fk foreign key (session_id, user_id)
    references public.interview_sessions(id, user_id) on delete cascade
);

alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
create policy "interview_sessions_owner_all" on public.interview_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interview_questions_owner_all" on public.interview_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

