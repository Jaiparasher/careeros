-- Phase 3: private resume metadata and storage policies.
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  version_label text,
  extracted_text text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, storage_path)
);
create index if not exists resumes_user_created_idx on public.resumes(user_id, created_at desc);

alter table public.resumes enable row level security;
create policy "resumes_owner_all" on public.resumes for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- Create a PRIVATE Supabase Storage bucket for owner resume files.
-- Upload paths must use: <auth.uid()>/resumes/<uuid>/<filename>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-files',
  'career-files',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "career_files_select_own" on storage.objects
for select using (bucket_id = 'career-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "career_files_insert_own" on storage.objects
for insert with check (bucket_id = 'career-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "career_files_update_own" on storage.objects
for update using (bucket_id = 'career-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'career-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "career_files_delete_own" on storage.objects
for delete using (bucket_id = 'career-files' and (storage.foldername(name))[1] = auth.uid()::text);
