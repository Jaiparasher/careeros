# 13. Deployment, Security and Cost Controls

## 13.1 Deployment target

- Next.js application: Vercel.
- Database and Auth: Supabase hosted project.
- Private file storage: Supabase Storage, Phase 3 onward.

Deploy only after local build and smoke tests pass. Keep preview and production environments separate where possible.

## 13.2 Environment setup

Maintain `.env.example` with variable names and placeholder values, never real secrets. Document which values are public and which are server-only.

Likely variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or current Supabase publishable key equivalent
- `GEMINI_API_KEY` (Phase 4, server-only)
- `GEMINI_MODEL` (Phase 4, server-side config)

Avoid using a service-role key. If a one-time admin operation genuinely requires it, keep it out of client bundles, restrict its use to a server-only script, and explain why it is needed.

## 13.3 Supabase security

- Enable RLS on every user-owned table.
- Policies must check `auth.uid() = user_id` (or profile `id`).
- Do not rely only on Next.js middleware or hidden pages.
- Use private storage buckets for resumes.
- File storage paths should begin with the authenticated user ID.
- Validate file type and size; do not trust extension alone.
- Do not expose public resume links.
- Provide delete controls for files and their metadata.

## 13.4 Authentication

- Restrict initial owner access.
- Handle auth callbacks/refresh according to the current Supabase SSR guidance.
- Protect server actions and route handlers, not only pages.
- Use secure cookies provided by the official SDK integration.
- Do not log session cookies or tokens.

## 13.5 Privacy

The platform may contain career details, resume files, interview answers, recruiter contact details and job search notes. Treat all of it as private.

- Do not put private content in analytics events.
- Do not send resume, project or profile context to AI without a user action and clear purpose.
- Provide data export and delete options.
- Avoid storing full raw AI provider responses unless needed.
- Use minimal logs and redact private content.

## 13.6 Cost controls

- Prefer free tiers while the usage is personal and small.
- Check current pricing before enabling paid features; never assume a free tier remains unchanged.
- Do not add scheduled background jobs, queues, paid analytics or paid monitoring in MVP.
- AI calls are on-demand with token/output limits.
- Show helpful fallback if an optional provider is unavailable.

## 13.7 Backups and recovery

- Export personal data periodically (CSV/JSON).
- Understand the selected Supabase plan's backup/retention terms before relying on it.
- Keep schema migrations in Git.
- Do not treat Git as a backup for database contents or uploaded resumes.
- Document how to restore from export or provider backup.

## 13.8 Deployment exit criteria

- [ ] Production build passes.
- [ ] Vercel environment variables configured correctly.
- [ ] Supabase production migrations applied.
- [ ] RLS verified in production.
- [ ] Auth redirects/callbacks configured.
- [ ] No secrets in client bundle or Git history.
- [ ] Private files are not publicly accessible.
- [ ] User can export/delete relevant records.
- [ ] Deployment smoke test completed.
