# CareerOS - Antigravity Project Documentation Pack

**Working title:** CareerOS  
**Purpose:** A lightweight, personal job-switch preparation workspace.  
**Primary user:** One software engineer preparing for Java backend / full-stack / SDE-I interviews.  
**Implementation style:** AI-assisted vibe coding with Google Antigravity.  
**Default stack:** Next.js + TypeScript + Supabase + Tailwind + shadcn/ui + Vercel; OpenRouter only in the later AI phase.

## What this pack contains

- `AGENTS.md`: concise, always-on project instructions for Antigravity.
- `docs/`: product, architecture, data, UI, implementation, QA, security, deployment and backlog specifications.
- `prompts/`: ready-to-paste Antigravity prompts for kickoff and each implementation phase.
- `.agents/skills/`: reusable skills for phase implementation and verification.
- `seed-data/`: the user's supplied profile and learning history, ready to import or use as seed data.
- `supabase/migrations/`: staged PostgreSQL migrations for the planned product modules, including private resume storage policies.
- `templates/`: CSV import templates for DSA questions and job applications.

## Recommended way to use it

1. Create a new, empty Git repository named `careeros` (or another name you prefer).
2. Extract this ZIP into the repository root. Keep `AGENTS.md`, `.agents/`, `docs/`, `prompts/`, `seed-data/`, and `supabase/` at the root.
3. Open the repository root in Antigravity.
4. Start a new agent conversation and paste the contents of `prompts/00_KICKOFF.md`.
5. Ask Antigravity to inspect the documentation and produce a plan. Review the plan before allowing code changes.
6. Implement one phase at a time using the matching prompt in `prompts/`. Phase 5 can be run after Phase 2 for an MVP launch and repeated after later feature phases.
7. Do not skip phase exit criteria. Keep the app runnable after each phase.

## Important product constraints

- This is a job-search tool, not a portfolio project that should consume months.
- The first usable release is only Dashboard + DSA Tracker + Learning Tracker + Study Planner.
- Start with deterministic logic. Add AI only in Phase 4, and only where it adds measurable value.
- Do not add Spring Boot, microservices, Redis, Kafka, Kubernetes, Docker, or a separate vector database to this application.
- The user's existing Spring Boot / Kubernetes knowledge belongs in their learning profile; it does not justify using those technologies to build CareerOS.
- Do not claim a topic is mastered merely because a course module is marked 100% complete. Separate course completion from demonstrated interview readiness.
- Do not invent DSA questions, exact solved-question history, project achievements, salary history, or professional experience.

## Documentation map

| File | Purpose |
|---|---|
| `docs/01_PRODUCT_REQUIREMENTS.md` | Product vision, users, goals, functional requirements and non-goals |
| `docs/02_USER_BASELINE_AND_SEED_DATA.md` | Supplied career, DSA, course and project baseline |
| `docs/03_MVP_SCOPE_AND_ACCEPTANCE.md` | MVP boundary, priorities and measurable acceptance criteria |
| `docs/04_TECHNICAL_ARCHITECTURE.md` | Stack, application structure, data flow and technical decisions |
| `docs/05_DATABASE_AND_DATA_DICTIONARY.md` | Tables, relationships, constraints and data behavior |
| `docs/06_UI_UX_SPECIFICATION.md` | Navigation, pages, interaction patterns and design system |
| `docs/07_PHASE_0_REPOSITORY_BOOTSTRAP.md` | Repo, tooling, Supabase and baseline setup |
| `docs/08_PHASE_1_FOUNDATION.md` | App shell, profile, dashboard and persistence |
| `docs/09_PHASE_2_LEARNING_AND_PLANNING.md` | DSA tracker, course tracker, roadmap and study planner |
| `docs/10_PHASE_3_CAREER_MANAGEMENT.md` | Projects, job pipeline and resume support |
| `docs/11_PHASE_4_AI_ASSISTANCE.md` | AI interview coach, answer feedback and recommendations |
| `docs/12_TESTING_AND_QUALITY.md` | Test strategy and release gates |
| `docs/13_DEPLOYMENT_SECURITY_AND_COST.md` | Vercel, Supabase, security, secrets, backups and cost controls |
| `docs/14_BACKLOG_AND_PRODUCT_DECISIONS.md` | Deferred ideas, risks and decision log |

## Source of truth and change management

- Treat `docs/` and the seed files as the source of truth for product behavior and personal baseline.
- If implementation reveals a necessary change, explain the reason, update the relevant documentation, then code.
- Keep a short `docs/IMPLEMENTATION_STATUS.md` file once work begins. Update it at the end of each phase with completed items, tests, known issues and next phase.
- Do not overwrite the user's seed data or silently change supplied percentages.

## Initial release definition

A usable personal release exists when the owner can sign in, see an accurate dashboard, review and edit their 20 Coding Shuttle modules, record DSA questions and attempts, receive revision due dates, create a daily study plan, and retain all changes after refresh and re-login.
