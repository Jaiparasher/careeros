-- Phase 1: owner profile and course module baseline.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  current_employer text,
  current_title text,
  employment_start date,
  education jsonb not null default '[]'::jsonb,
  target_roles text[] not null default '{}',
  target_company_types text[] not null default '{}',
  target_salary_min_lpa numeric(6,2),
  target_salary_max_lpa numeric(6,2),
  preparation_horizon_months_min integer default 3,
  preparation_horizon_months_max integer default 6,
  timezone text not null default 'Asia/Kolkata',
  daily_available_minutes integer,
  profile_context text,
  dsa_playlist_completed boolean not null default false,
  dsa_playlist_url text,
  dsa_aggregate_solved_count integer,
  dsa_aggregate_solved_count_is_minimum boolean not null default false,
  theme_preference text not null default 'system' check (theme_preference in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_salary_min_lpa is null or target_salary_min_lpa >= 0),
  check (target_salary_max_lpa is null or target_salary_max_lpa >= 0),
  check (daily_available_minutes is null or daily_available_minutes between 0 and 1440),
  check (dsa_aggregate_solved_count is null or dsa_aggregate_solved_count >= 0)
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  module_key text not null,
  course_name text not null,
  provider text,
  module_number integer not null,
  title text not null,
  completion_percent numeric(5,2) not null default 0 check (completion_percent between 0 and 100),
  notes text,
  resource_url text,
  last_studied_at timestamptz,
  source text not null default 'user_entry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_key),
  check (module_number > 0)
);

create index if not exists learning_modules_user_course_idx on public.learning_modules(user_id, course_key, module_number);

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger learning_modules_updated_at before update on public.learning_modules
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.learning_modules enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "learning_modules_select_own" on public.learning_modules for select using (auth.uid() = user_id);
create policy "learning_modules_insert_own" on public.learning_modules for insert with check (auth.uid() = user_id);
create policy "learning_modules_update_own" on public.learning_modules for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "learning_modules_delete_own" on public.learning_modules for delete using (auth.uid() = user_id);
