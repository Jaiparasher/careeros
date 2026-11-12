# 7. Phase 0 - Repository and Tooling Bootstrap

## Objective

Create a clean, runnable Next.js repository with documented commands, Supabase client foundations and Antigravity project instructions. No product feature work beyond a minimal health/home route in this phase.

## Scope

1. Inspect repository state. If empty, scaffold Next.js with App Router, TypeScript, ESLint and the chosen package manager.
2. Add Tailwind CSS and shadcn/ui using supported setup instructions for the selected Next.js version.
3. Add Supabase browser/server client utilities and environment-variable validation.
4. Add `.env.example` with placeholder names only.
5. Keep `AGENTS.md`, `docs/`, `.agents/skills/`, `prompts/`, `seed-data/` and migrations in the repository.
6. Add basic scripts for dev, build, lint, typecheck and tests (test script may be a minimal smoke test initially).
7. Add a concise README with prerequisites, setup and local run commands.
8. Add `.gitignore` entries for `.env*` except `.env.example`, `.next`, build outputs, local test artifacts and private uploads.
9. Add a simple branded placeholder route confirming the app runs.

## Environment variables

Use only variables needed by the selected Supabase SSR/client setup, such as:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or publishable key name required by current Supabase guidance
- `SUPABASE_SERVICE_ROLE_KEY` only if a specific server-only administrative task truly requires it; avoid it in normal app code and do not add it by default.
- `OPENROUTER_API_KEY` is not needed until Phase 4.

Do not hardcode values or request user secrets in code. Provide the user with a list of values to enter in local environment settings.

## Decisions to make and record

- Package manager based on environment; use one consistently and commit its lockfile.
- Exact compatible versions of Next.js, React, Supabase SDK and shadcn/ui.
- Whether authentication callback handling needs a route based on current Supabase SSR guidance.

Record versions and commands in the root README.

## Exit criteria

- [ ] App starts with documented command.
- [ ] Landing/placeholder route loads.
- [ ] TypeScript, lint and production build pass.
- [ ] Supabase client modules compile without exposing secrets.
- [ ] `.env.example` exists and no actual secrets are committed.
- [ ] Antigravity discovers root `AGENTS.md` and project skills.
- [ ] `docs/IMPLEMENTATION_STATUS.md` is created with Phase 0 status.

## Explicitly do not do

- Do not create DSA, learning, job, resume or AI pages yet.
- Do not add a separate backend.
- Do not add Docker, Kubernetes, CI/CD complexity or paid services.
