-- Phase 3 Batch 3: Resume Management & Job Description Manager extensions

-- 1. Extend resumes table with primary flag, target role, notes, and extraction status
alter table public.resumes
  add column if not exists is_primary boolean not null default false,
  add column if not exists target_role text,
  add column if not exists notes text,
  add column if not exists extraction_status text not null default 'pending'
    check (extraction_status in ('pending', 'completed', 'failed', 'manual'));

-- 2. Ensure composite unique constraint on (id, user_id) for safe foreign key referencing
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'resumes_id_user_id_key'
      and conrelid = 'public.resumes'::regclass
  ) then
    alter table public.resumes add constraint resumes_id_user_id_key unique (id, user_id);
  end if;
end $$;

-- 3. Database-level partial unique index to enforce at most ONE active primary resume per user
create unique index if not exists resumes_user_primary_uidx
  on public.resumes (user_id)
  where (is_primary = true and deleted_at is null);

-- 4. Create Job Descriptions table with same-user composite foreign keys for tenant isolation
create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role_title text not null,
  target_role text,
  raw_text text not null,
  extracted_skills text[] not null default '{}',
  application_id uuid,
  resume_id uuid,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_descriptions_id_user_id_key unique (id, user_id),
  constraint job_descriptions_app_owner_fk foreign key (application_id, user_id)
    references public.job_applications(id, user_id) on delete set null (application_id),
  constraint job_descriptions_resume_owner_fk foreign key (resume_id, user_id)
    references public.resumes(id, user_id) on delete set null (resume_id)
);

-- In case table already existed, ensure composite foreign key constraints exist
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'job_descriptions_app_owner_fk'
      and conrelid = 'public.job_descriptions'::regclass
  ) then
    alter table public.job_descriptions
      add constraint job_descriptions_app_owner_fk
      foreign key (application_id, user_id)
      references public.job_applications(id, user_id)
      on delete set null (application_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'job_descriptions_resume_owner_fk'
      and conrelid = 'public.job_descriptions'::regclass
  ) then
    alter table public.job_descriptions
      add constraint job_descriptions_resume_owner_fk
      foreign key (resume_id, user_id)
      references public.resumes(id, user_id)
      on delete set null (resume_id);
  end if;
end $$;

create index if not exists job_descriptions_user_created_idx
  on public.job_descriptions (user_id, created_at desc);

create index if not exists job_descriptions_user_app_idx
  on public.job_descriptions (user_id, application_id);

alter table public.job_descriptions enable row level security;

drop policy if exists "job_descriptions_owner_all" on public.job_descriptions;
create policy "job_descriptions_owner_all" on public.job_descriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists job_descriptions_updated_at on public.job_descriptions;
create trigger job_descriptions_updated_at
  before update on public.job_descriptions
  for each row execute function public.set_updated_at();

-- 5. Atomic PostgreSQL RPC to toggle primary resume safely in a single transaction
create or replace function public.set_primary_resume(p_resume_id uuid)
returns public.resumes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_primary_count integer;
  v_updated public.resumes;
begin
  -- 1. Verify caller is authenticated
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- 2. Lock all active resumes for this user in consistent order to prevent deadlocks and race conditions
  perform id from public.resumes
  where user_id = v_user_id and deleted_at is null
  order by id
  for update;

  -- 3. Verify target resume exists, belongs to caller, and is not deleted
  if not exists (
    select 1 from public.resumes
    where id = p_resume_id and user_id = v_user_id and deleted_at is null
  ) then
    raise exception 'Resume not found or access denied';
  end if;

  -- 4. Step 1: Unset any existing primary resume for this user
  update public.resumes
  set is_primary = false
  where user_id = v_user_id
    and is_primary = true
    and deleted_at is null;

  -- 5. Step 2: Set the requested resume as primary
  update public.resumes
  set is_primary = true
  where id = p_resume_id
    and user_id = v_user_id
    and deleted_at is null;

  -- 6. Integrity check: Verify that exactly the intended resume is active primary
  select count(*) into v_primary_count
  from public.resumes
  where user_id = v_user_id
    and is_primary = true
    and deleted_at is null;

  if v_primary_count <> 1 then
    raise exception 'Integrity check failed: expected exactly 1 primary resume, found %', v_primary_count;
  end if;

  -- 7. Return the updated record
  select * into v_updated
  from public.resumes
  where id = p_resume_id and user_id = v_user_id;

  return v_updated;
end;
$$;

revoke all on function public.set_primary_resume(uuid) from public, anon;
grant execute on function public.set_primary_resume(uuid) to authenticated;
