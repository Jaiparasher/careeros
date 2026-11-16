-- Migration 0007: Phase 3 Project Tracker Extensions and Bug Tracking
-- Extends projects, project_features, and adds project_bugs with owner-scoped RLS.

-- 1. Extend projects table
alter table public.projects
  add column if not exists objectives text[] not null default '{}',
  add column if not exists key_achievements text[] not null default '{}',
  add column if not exists architecture_details jsonb not null default '{}'::jsonb,
  add column if not exists interview_prep jsonb not null default '{}'::jsonb;

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check 
  check (status in ('planned', 'in_progress', 'completed', 'on_hold', 'blocked', 'archived'));

-- 2. Extend project_features table
alter table public.project_features
  add column if not exists tech_used text[] not null default '{}',
  add column if not exists estimated_completion_date date,
  add column if not exists actual_completion_date date;

alter table public.project_features drop constraint if exists project_features_status_check;
alter table public.project_features add constraint project_features_status_check 
  check (status in ('planned', 'in_progress', 'implemented', 'blocked', 'done'));

alter table public.project_features drop constraint if exists project_features_priority_check;
alter table public.project_features add constraint project_features_priority_check 
  check (priority in ('low', 'medium', 'high', 'critical'));

alter table public.project_features drop constraint if exists project_features_id_user_id_key;
alter table public.project_features add constraint project_features_id_user_id_key unique (id, user_id);

-- 3. Create dedicated project_bugs table
create table if not exists public.project_bugs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  feature_id uuid,
  title text not null,
  description text,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'investigating', 'fixed', 'closed')),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint project_bugs_project_owner_fk foreign key (project_id, user_id)
    references public.projects(id, user_id) on delete cascade,
  constraint project_bugs_feature_owner_fk foreign key (feature_id, user_id)
    references public.project_features(id, user_id) on delete set null
);

create index if not exists project_bugs_user_project_idx on public.project_bugs(user_id, project_id, status);

create or replace trigger project_bugs_updated_at before update on public.project_bugs
  for each row execute function public.set_updated_at();

alter table public.project_bugs enable row level security;

drop policy if exists "project_bugs_owner_all" on public.project_bugs;
create policy "project_bugs_owner_all" on public.project_bugs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
