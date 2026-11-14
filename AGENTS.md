# CareerOS - Antigravity Workspace Instructions

You are building a lightweight personal job-switch preparation product. Follow the requirements in `README_FIRST.md` and the detailed specifications under `docs/`. Read the matching phase document before implementing a phase.

## Non-negotiable constraints

1. Optimize for the user's job switch, not engineering novelty. Keep features small and shippable.
2. Use Next.js App Router, TypeScript, Supabase PostgreSQL/Auth, Tailwind CSS, shadcn/ui, and Vercel. Use the versions supported by the project at setup time; do not chase experimental releases.
3. Use a modular monolith. No separate Java backend, microservices, Kubernetes, Docker, Redis, Kafka, or vector database for CareerOS.
4. Build and verify one phase at a time. Do not start a later phase before the current phase's exit criteria pass.
5. Prefer server components for read-oriented pages and server actions / route handlers for mutations or external APIs. Keep secrets server-side.
6. Validate all user input at boundaries with Zod (or an equivalent schema already adopted in the codebase). Enforce ownership in the database with Supabase RLS; UI checks are not security.
7. Never fabricate career history, metrics, DSA history, interview scores, or course completion. Use supplied seed files exactly.
8. A completed course is not proof of mastery. Keep course completion, confidence, assessment evidence and interview readiness separate.
9. AI is deferred until Phase 4. Do not use LLMs for CRUD, date arithmetic, scheduling calculations, or other deterministic tasks.
10. Build the Phase 2 interview question bank from the confirmed resume skill inventory; it must work without AI and be browsable by skill and topic.
11. Track Grind 75 as a dedicated DSA collection with official attribution, verified imports and duplicate linking; never infer item-level completion from aggregate solved counts.
12. The first 30-day plan must be previewed, capacity-checked and accepted before tasks are created. After Day 30, prioritize transparently by role relevance, knowledge gaps and revisions.
10. Do not commit `.env` files, API keys, service-role keys, resume contents, or personal secrets.

## Working method

- Before each phase: read its specification, inspect the current repository, summarize the smallest viable plan, and list files likely to change.
- Ask for clarification only when a missing decision blocks safe implementation. Otherwise use documented defaults and record the choice.
- Preserve a working application after every implementation batch.
- Keep UI consistent with `docs/06_UI_UX_SPECIFICATION.md`. Follow `docs/17_INTERVIEW_QUESTION_BANK_AND_SKILL_TAXONOMY.md` and `docs/18_FIRST_30_DAY_INTERVIEW_SPRINT.md` for interview coverage and scheduling.
- Add migrations for schema changes; never make undocumented dashboard-only database changes.
- Add or update tests for behavior changed. Run lint, typecheck, tests and production build when available.
- Inspect the running UI in a browser at desktop and mobile widths for user-facing phases. Fix visible defects before calling a task done.
- Do not claim checks passed unless you actually ran them. Report commands, results and remaining issues.
- Update `docs/IMPLEMENTATION_STATUS.md` at the end of every phase.

## Definition of done for a feature

A feature is done only when its happy path, validation, empty state, loading state, error state, persistence, access control and relevant tests have been checked. A visually polished mock with non-persistent data is not a completed feature.
