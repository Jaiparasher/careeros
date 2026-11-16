-- Phase 4 Batch 2: Mock Interview and Gemini Answer Evaluation Extensions

-- 1. Extend interview_sessions with interview_type, selected_skills, question count, and scoring
alter table public.interview_sessions
  add column if not exists interview_type text default 'Technical',
  add column if not exists selected_skills text[] default '{}',
  add column if not exists total_questions integer default 5,
  add column if not exists overall_score numeric(4,2),
  add column if not exists summary_json jsonb;

-- Relax difficulty check constraint to support both taxonomy and UI terms
alter table public.interview_sessions
  drop constraint if exists interview_sessions_difficulty_check;

alter table public.interview_sessions
  add constraint interview_sessions_difficulty_check
  check (difficulty in ('beginner','intermediate','advanced','easy','medium','hard','mixed'));

-- 2. Extend interview_questions with bank linking, granular rubric fields, and evaluation status
alter table public.interview_questions
  add column if not exists question_bank_id uuid references public.interview_question_bank(id) on delete set null,
  add column if not exists skill_name text,
  add column if not exists topic text,
  add column if not exists difficulty text,
  add column if not exists score numeric(4,2),
  add column if not exists incorrect_statements text,
  add column if not exists clarity_assessment text,
  add column if not exists depth_assessment text,
  add column if not exists improvement_advice text,
  add column if not exists follow_up_questions_json jsonb default '[]'::jsonb,
  add column if not exists evaluation_status text default 'pending'
    check (evaluation_status in ('pending', 'evaluating', 'evaluated', 'skipped', 'failed')),
  add column if not exists evaluated_at timestamptz;

-- 3. High-performance indexes for session and question retrieval
create index if not exists interview_sessions_user_status_idx
  on public.interview_sessions(user_id, status, created_at desc);

create index if not exists interview_questions_session_idx
  on public.interview_questions(session_id, sequence_number);

create index if not exists interview_questions_bank_idx
  on public.interview_questions(question_bank_id);
