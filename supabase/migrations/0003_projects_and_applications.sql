-- Phase 3: project tracking and job application pipeline.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  project_type text,
  summary text,
  status text not null default 'in_progress' check (status in ('planned','in_progress','blocked','completed','archived')),
  repository_url text,
  demo_url text,
  technologies jsonb not null default '[]'::jsonb,
  architecture_notes text,
  challenges text,
  interview_story_notes text,
  started_on date,
  last_updated_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.project_features (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  title text not null,
  description text,
  category text not null default 'feature' check (category in ('feature','bug','improvement','infrastructure')),
  status text not null default 'planned' check (status in ('planned','in_progress','blocked','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  notes text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_features_project_owner_fk foreign key (project_id, user_id)
    references public.projects(id, user_id) on delete cascade
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role_title text not null,
  job_url text,
  job_description text,
  location text,
  work_mode text,
  stage text not null default 'interested' check (stage in ('interested','applied','referral_requested','screening','technical_round_1','technical_round_2','managerial_round','hr','offer','rejected','on_hold')),
  discovered_on date,
  application_date date,
  salary_min_lpa numeric(7,2),
  salary_max_lpa numeric(7,2),
  recruiter_name text,
  recruiter_contact text,
  referral_name text,
  next_follow_up_at date,
  interview_date timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (salary_min_lpa is null or salary_min_lpa >= 0),
  check (salary_max_lpa is null or salary_max_lpa >= 0)
);
create index if not exists job_applications_user_stage_idx on public.job_applications(user_id, stage);
create index if not exists job_applications_user_followup_idx on public.job_applications(user_id, next_follow_up_at);

create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger project_features_updated_at before update on public.project_features for each row execute function public.set_updated_at();
create trigger job_applications_updated_at before update on public.job_applications for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_features enable row level security;
alter table public.job_applications enable row level security;
create policy "projects_owner_all" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "project_features_owner_all" on public.project_features for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "job_applications_owner_all" on public.job_applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Application code must verify that project_id belongs to auth.uid() when inserting project_features.
