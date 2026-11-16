-- Phase 4 Batch 3: AI Resume & Job Description Analysis History

create table if not exists public.resume_jd_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete cascade,
  job_description_id uuid references public.job_descriptions(id) on delete set null,
  application_id uuid references public.job_applications(id) on delete set null,
  target_role text,
  company_name text not null,
  role_title text not null,
  analysis_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resume_jd_analyses_id_user_id_key unique (id, user_id)
);

-- Composite foreign keys enforcing same-user data integrity across tenants
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'resume_jd_analyses_resume_owner_fk'
      and conrelid = 'public.resume_jd_analyses'::regclass
  ) then
    alter table public.resume_jd_analyses
      add constraint resume_jd_analyses_resume_owner_fk
      foreign key (resume_id, user_id)
      references public.resumes(id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'resume_jd_analyses_jd_owner_fk'
      and conrelid = 'public.resume_jd_analyses'::regclass
  ) then
    alter table public.resume_jd_analyses
      add constraint resume_jd_analyses_jd_owner_fk
      foreign key (job_description_id, user_id)
      references public.job_descriptions(id, user_id)
      on delete set null (job_description_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'resume_jd_analyses_app_owner_fk'
      and conrelid = 'public.resume_jd_analyses'::regclass
  ) then
    alter table public.resume_jd_analyses
      add constraint resume_jd_analyses_app_owner_fk
      foreign key (application_id, user_id)
      references public.job_applications(id, user_id)
      on delete set null (application_id);
  end if;
end $$;

-- High performance lookup indexes
create index if not exists resume_jd_analyses_user_created_idx
  on public.resume_jd_analyses (user_id, created_at desc);

create index if not exists resume_jd_analyses_user_resume_jd_idx
  on public.resume_jd_analyses (user_id, resume_id, job_description_id);

create index if not exists resume_jd_analyses_app_idx
  on public.resume_jd_analyses (application_id);

-- Enable RLS and owner-only access policy
alter table public.resume_jd_analyses enable row level security;

drop policy if exists "resume_jd_analyses_owner_all" on public.resume_jd_analyses;
create policy "resume_jd_analyses_owner_all" on public.resume_jd_analyses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Updated_at trigger
drop trigger if exists resume_jd_analyses_updated_at on public.resume_jd_analyses;
create trigger resume_jd_analyses_updated_at
  before update on public.resume_jd_analyses
  for each row execute function public.set_updated_at();
