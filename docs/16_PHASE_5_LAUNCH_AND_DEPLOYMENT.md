# 16. Phase 5 - Launch, Deployment and Handoff

## Objective

Turn the currently completed scope into a stable, private, deployed application with an understandable operating procedure. This phase may be run after Phase 2 for an MVP launch, then repeated after Phase 3 or Phase 4 expands the feature set. Do not wait for every optional feature before publishing the useful MVP.

## 16.1 Pre-launch scope decision

Before deployment, explicitly list which feature phases are included in this release. Recommended first production release:
- Phase 0 bootstrap.
- Phase 1 foundation and owner profile.
- Phase 2 DSA/Grind 75, learning, skill-wise interview question bank and 30-day planner.

Phase 3 and Phase 4 can be deployed later after their exit criteria pass. Hide unfinished navigation items and do not label placeholder screens as released features.

## 16.2 Production environment

1. Create/select the production Supabase project.
2. Confirm Auth provider, redirect URLs and owner-only access configuration.
3. Apply committed migrations in order.
4. Import the user's baseline through the idempotent onboarding/seed flow.
5. Confirm RLS on every table, plus same-owner composite foreign keys for child records.
6. Create Vercel project linked to the Git repository.
7. Configure only required environment variables in Vercel.
8. Configure production domain and HTTPS using provider-supported steps.
9. Deploy a preview first, run smoke tests, then promote to production.

Do not copy a local development database over production without an explicit, reviewed migration/import plan.

## 16.3 Preflight checks

- Production build passes locally/CI.
- All migrations apply cleanly in order.
- No actual secrets are committed or exposed in client bundles.
- Auth callback URLs match production domain.
- Owner can sign in and sign out.
- Unauthenticated user cannot access app pages or server actions.
- RLS is verified with an unauthenticated and non-owner context where feasible.
- User's baseline values match seed files.
- No placeholder buttons, fake metrics or broken navigation remain.
- All upload buckets (if Phase 3) are private.

## 16.4 Production smoke test

Run these manually after deploy:
1. Sign in as owner.
2. Open dashboard and verify course progress.
3. Open DSA, verify Grind 75 import status, add a temporary test question, record an attempt and remove/archive the test record.
4. Open Interview Questions and filter by skill/topic; save a test answer note.
5. Preview a 30-day sprint and verify capacity warning/acceptance behavior.
6. Check a due revision and reschedule it.
7. Update one study task and verify it persists after reload.
8. Check Settings and timezone.
9. Sign out; verify protected pages redirect or show the correct unauthorized state.
8. If Phase 3 is included: add and remove a test application/project item and verify private file access.
9. If Phase 4 is included: run one small AI mock interview and verify error/cost handling.

## 16.5 Data export and recovery

- Export relevant records to CSV/JSON from Settings or documented SQL tools.
- Confirm the user knows where exports are saved.
- Document how to reapply migrations to a new Supabase project.
- Document how resume files are backed up or intentionally excluded from export.
- Do not claim the system has backups without checking the active Supabase plan and settings.

## 16.6 Handoff documentation

Update README with:
- Local prerequisites and setup commands.
- Required environment variables and where to obtain them.
- How to apply migrations.
- How to import baseline seed data.
- How to run lint/typecheck/tests/build.
- Deployment URL location (do not hardcode secrets).
- Known limitations and deferred items.

Update `docs/IMPLEMENTATION_STATUS.md` with release tag/date, deployed scope, test outcomes and known issues.

## 16.7 Exit criteria

- [ ] A named release scope is recorded.
- [ ] Preview deployment passes smoke checks.
- [ ] Production deployment is reachable over HTTPS.
- [ ] Authentication and RLS have been verified.
- [ ] Baseline seed data is accurate.
- [ ] Export/recovery steps are documented.
- [ ] No secrets or private files are public.
- [ ] README and implementation status reflect the real deployed state.
