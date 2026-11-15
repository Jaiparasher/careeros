# Implementation Status

## Current Phase
- **Phase:** 2 — Learning, DSA and Study Planning
- **Batch:** Batch 2 (Learning Roadmap, Resume-Wide Interview Question Bank & Capacity-Aware 30-Day Sprint)
- **Status:** Phase 2 Complete (Batch 1 & Batch 2 Fully Implemented and Verified)

## Completed

### Phase 0: Repository & Tooling Bootstrap
- Next.js 15 App Router scaffolded with TypeScript and Tailwind CSS.
- Directory layout standardized using `src/` (`src/app`, `src/lib`, `src/features`, `src/components`).
- Created Supabase client modules (`client.ts`, `server.ts`, `middleware.ts`).
- Zod environment variable validation (`src/lib/env.ts`).
- Configured `.env.example` and safe `.gitignore`.
- Branded landing page at `src/app/page.tsx`.
- Vitest testing infrastructure configured.
- Repaired YAML frontmatter in Antigravity project skills.

### Phase 1: Application Foundation & Baseline Import
- **Authentication**:
  - Implemented Email & Password authentication with Supabase Auth.
  - Server actions in `src/features/auth/actions.ts` (`signInAction`, `signUpAction`, `signOutAction`).
  - Zod validation in `src/features/auth/schema.ts`.
  - Auth page at `src/app/(auth)/login/page.tsx` with toggle between Sign In and Sign Up, error handling, and redirect logic.
- **Application Shell**:
  - Authenticated layout at `src/app/(app)/layout.tsx` enforcing user session.
  - Responsive desktop and mobile `Sidebar` (`src/components/layout/sidebar.tsx`) with active state highlighting and navigation links.
  - Responsive `Header` (`src/components/layout/header.tsx`) with mobile drawer toggle, profile badge, and server-side sign out action.
- **Profile Onboarding & Baseline Seeding**:
  - Onboarding page at `src/app/(app)/onboarding/page.tsx` prefilled with exact facts from `seed-data/profile.json`.
  - Onboarding client form (`src/app/(app)/onboarding/onboarding-form.tsx`) allowing editing of target roles, salary range (min/max), daily available study minutes, and timezone.
  - Profile service at `src/features/profile/service.ts` ensuring existing profiles are **not** overwritten.
  - Idempotent seeding service at `src/features/learning/seed.ts` seeding all 20 Coding Shuttle modules from `seed-data/coding-shuttle-modules.json` without duplicating or overwriting user progress.
- **Dashboard v1**:
  - Initial foundation and profile summary.
- **Settings Page**:
  - Settings at `src/app/(app)/settings/page.tsx` with `SettingsForm`.
  - Allows editing of display name, current employer, current title, target roles, salary range, daily available study minutes, and timezone.

### Phase 2 Batch 1: DSA Tracker & Grind 75 Core 75 Collection
- **Grind 75 Core 75 Dataset**:
  - Sourced and verified all 75 problems from official Tech Interview Handbook (`https://www.techinterviewhandbook.org/grind75/`).
  - Saved to `seed-data/grind75-core-problems.json` with source snapshot date `2026-11-15`, exact 1–75 problem order, canonical LeetCode URLs, difficulty tags (25 Easy, 41 Medium, 9 Hard), topic patterns, and estimated time limits (Easy: 15 min, Medium: 25 min, Hard: 40 min).
  - Aggregate 350+ solved count is **never** used to infer Grind 75 completion; all problems initialize as `not_started`.
- **URL Normalization & Deduplication (`src/features/dsa/normalize.ts`)**:
  - `extractProblemSlug`: Extracts canonical slug from any LeetCode URL variation.
  - `normalizeProblemUrl`: Produces canonical `https://leetcode.com/problems/<slug>/` URL for database-level deduplication via unique partial index.
- **Outcome-Aware Spaced Repetition Engine (`src/features/dsa/revision.ts`)**:
  - `solved_independently`: Progresses through [1, 3, 7, 14, 30] days. Completing the 30-day interval marks the problem as mastered.
  - `solved_with_hint`: Follows conservative intervals [1, 1, 3, 7, 14] days. Does **not** grant automatic mastery and caps at 14 days.
  - `unable_to_solve`: Automatically marks question status as `needs_revision` and schedules a 1-day retry.
  - `revisited`: Advances interval based on previous solve outcome.
- **Idempotent Grind 75 Sync (`src/features/dsa/grind75-sync.ts`)**:
  - Re-running sync repeatedly never creates duplicates or overwrites user notes/history.
  - Matches existing questions by normalized LeetCode URL or external problem slug.
  - Preserves all attempts, notes, statuses, and revision schedules.
- **DSA Hub UI (`/dsa`) & Detail View (`/dsa/[id]`)**:
  - Full CRUD, attempt timeline, CSV import/export, revision card actions.

### Phase 2 Batch 2: Learning Roadmap, Interview Question Bank & Study Planner
- **Learning Roadmap (`/learning`)**:
  - Interactive 20-module list (`module-list.tsx`) with completion sliders (0–100%), inline notes, live mean recalculation.
  - Rule 8 compliant Topic Confidence Matrix (`topic-matrix.tsx`): decoupled from course completion. Tracks topic confidence (1–5 stars), assessment status (`not_assessed`, `needs_work`, `progressing`, `strong`), interview-ready toggle, evidence notes, and category filters.
  - Server actions in `src/features/learning/actions.ts` with Zod validation.
- **Resume-Wide Technical Interview Question Bank (`/interview-questions`)**:
  - Comprehensive seed dataset with **376 distinct curated questions** in `seed-data/interview-question-bank-seed.json`.
  - Zero filler questions; covers all 42 skills and 11 categories without exception.
  - Priorities strictly enforced: Java, OOP, Collections, JVM, Multithreading, Spring Core, Spring Boot, Spring Security, Hibernate/JPA, REST APIs, SQL, DBMS, Microservices, Kafka, DSA, LLD, and project deep dives prioritized, while fully covering React, Node.js, Next.js, Redux, MongoDB, Firebase, PostgreSQL/pgvector, Docker, Kubernetes, Git, Maven, CI/CD, AWS, and Agile.
  - Every single question includes:
    1. Realistic question title and detailed technical prompt.
    2. Expected answer evaluation rubric (checklist of 3–5 evaluation points).
    3. Concise, authoritative sample answer with technical depth.
    4. 1–3 realistic interviewer follow-up probes.
    5. Difficulty (`basic`, `intermediate`, `advanced`) and Priority (`critical`, `high`, `medium`, `low`).
    6. Attribution: `"CareerOS curated"`.
  - Dynamic dual navigation: Skill-first and Topic-first browsing modes with full-text search, category filters, skill filters, difficulty filters, and readiness filters.
  - Interactive question practice screen (`/interview-questions/[id]`) with collapsible rubric, sample answer, follow-ups, self-assessment confidence rating (1–5 stars), status selector, and spaced revision scheduling (1, 3, 7, 14, 30 days).
  - Idempotent database seeding (`seedQuestionBankIfEmpty`): never overwrites user attempts, notes, confidence ratings, or revision dates.
- **Capacity-Aware Study Sprint & Daily Task Planner (`/planner`)**:
  - Reads actual `daily_available_minutes` directly from user profile (fallback 120 min).
  - Calculates daily workload in minutes from individual task estimates.
  - Surfaces prominent Overload Warnings whenever a day's planned time exceeds the user's available study time.
  - Generates realistic 30-, 45-, and 60-day alternatives, distributing the 75 Grind 75 Core problems sustainably.
  - Preview-before-accept workflow (`/planner/sprint`): allows inspecting every day's workload and Grind 75 problem assignments before saving any tasks to the database.
  - Guarantees all 75 Grind 75 problems are scheduled exactly once as new tasks; links to user's existing `dsa_questions` records without creating duplicate questions or attempts.
  - Daily Agenda (`daily-agenda.tsx`): date switcher, capacity gauge, task completion toggle, reschedule to tomorrow, and direct links to DSA problems and interview questions.
  - Day 31+ Adaptive Prioritization (`calculateDay31Prioritization`): transparent scoring formula based on Role Relevance (30%), Knowledge Gaps (25%), Resume Skill Importance (20%), Due Revisions (15%), and Upcoming Interviews (10%).
- **Dashboard v2 (`/dashboard`)**:
  - Live Daily Agenda gauge: planned study minutes vs completed minutes against daily budget.
  - Live DSA Tracker breakdown: Total Tracked, Solved, Needs Revision, and Grind 75 progress (X/75).
  - Live Question Bank metrics: Prepared count, Strong skills, Due revisions.
  - Live Course progress re-computed dynamically from `learning_modules`.
  - "Today's Priority Focus" card: top 3 concrete next actions derived from pending sprint tasks and due spaced revisions.

## Verification Performed
- **TDD Test Suites (`vitest run`):** 21 test files, 135 tests passing with 0 errors:
  - `tests/interview-questions-dataset.test.ts` (5 tests): verifies $\ge 330$ distinct questions (376 total), all 11 categories, all 42 skills, evaluation rubrics, sample answers, follow-up questions, and CareerOS curated attribution.
  - `tests/interview-service.test.ts` (6 tests): taxonomy coverage, idempotent seeding, skipping existing questions, answer recording, revision scheduling, and database stats aggregation.
  - `tests/planner-workload.test.ts` (4 tests): daily workload summation, capacity evaluation, overload warning detection, 30/45/60 day schedule generation with all 75 Grind 75 problems.
  - `tests/planner-service.test.ts` (4 tests): Day 31+ adaptive prioritization weighting, profile capacity extraction, task toggling, and date rescheduling.
  - `tests/learning-modules.test.ts` (3 tests): 20 Coding Shuttle modules progress.
  - `tests/learning-topics.test.ts` (3 tests): Rule 8 decoupling of course completion from topic readiness.
  - `tests/dsa-normalize.test.ts` (20 tests): URL normalization, slug extraction.
  - `tests/dsa-revision.test.ts` (20 tests): Spaced repetition engine intervals.
  - `tests/dsa-grind75-sync.test.ts` (3 tests): Idempotent Grind 75 sync and duplicate linking.
  - `tests/dsa-schema.test.ts` (32 tests): DSA schemas and attempt validation.
  - `tests/module-seeder.test.ts` (3 tests): Coding Shuttle seeding.
  - `tests/profile-service.test.ts` (2 tests): Profile service integrity.
  - `tests/profile-schema.test.ts` (4 tests): Profile schema validation.
  - `tests/auth-schema.test.ts` (3 tests): Auth schema validation.
  - `tests/seed-data.test.ts` (5 tests): Seed files integrity.
  - `tests/domain-progress.test.ts` (5 tests): Course progress math.
  - `tests/env.test.ts` (4 tests): Environment validation.
  - `tests/routes.test.ts` (2 tests): Route boundaries.
  - `tests/supabase-client.test.ts` (1 test): Supabase client initialization.
  - `tests/interview-catalog.test.ts` (4 tests): Skills catalog validation.
  - `tests/smoke.test.ts` (2 tests): Smoke tests.
- **TypeScript Typecheck:** `npm run typecheck` (`tsc --noEmit`) passes with 0 errors.
- **ESLint:** `npm run lint` passes with 0 errors and 0 warnings.
- **Production Build:** `npm run build` succeeds cleanly, compiling all 14 routes.

## Database Migrations Applied
1. `supabase/migrations/0001_profiles_and_learning_modules.sql`
2. `supabase/migrations/0002_dsa_topics_and_planner.sql`
3. `supabase/migrations/0006_question_bank_and_sprint_plans.sql`

## Next Phase
- **Phase 3:** Target Roles, Projects, Resumes, and Application Tracking.
