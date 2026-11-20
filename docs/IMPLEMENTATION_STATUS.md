# Implementation Status

## Current Phase
- **Phase:** 4 — AI Career Assistant & Mock Interviews
- **Batches:**
  - Batch 1: Secure Gemini AI Integration Foundation — Complete & Verified
  - Batch 2: Technical Mock Interview & Answer Coaching Engine — Complete, Migrated (0010 Applied & Verified Live), & Remediated
  - Batch 3: AI Resume & Job Description Intelligence — Complete, Migrated (0011 Applied & Verified Live), & Remediated
  - Batch 4: Personalized AI Study Recommendations & Adaptive Revision Advisor — Complete, Migrated (0012 Applied & Verified Live), & Remediated
- **Status:** Phase 4 Remediation Complete (Batches A, B, C, and D complete; M-01 through M-11, N-01 through N-03, and L-01 through L-09 resolved; forward-only Migrations 0013 and 0014 authored; zero Gemini tokens consumed; zero live database writes; 30/30 unit test files / 333 tests passed; TypeScript 0 errors; ESLint 0 errors / 0 warnings; Next.js production build clean; Phase 4 closure ready).

## Phase 4 Remediation: Batch D Targeted Corrections & Hygiene Fixes
- **Zero AI API Invocation**: Guaranteed zero Gemini API tokens consumed across all verification and remediation tasks.
- **Zero Live DB Mutations**: Zero live database writes executed; no migrations applied.
- **Remediations Implemented & Verified**:
  1. **L-01 — Next.js `server-only` Module Protection (`package.json`, `src/features/ai/gemini-service.ts`, `src/features/resumes/ai-analyzer.ts`, `src/features/interview/mock-evaluator.ts`, `src/features/planner/recommendation-advisor.ts`)**:
     - Installed `server-only` minimal package and added `import "server-only";` to all genuinely server-only modules.
     - Enforces official Next.js build-time boundary protection preventing accidental Client Component imports.
     - Configured Vitest alias in `vitest.config.ts` mapping `server-only` to empty shim for test runner compatibility.
  2. **L-02 — Timeout Abort Signal Propagation & Cancellation (`src/features/ai/gemini-service.ts`)**:
     - Bound underlying Google GenAI SDK calls to an active `AbortController` (`config.abortSignal`), ensuring timeouts abort the actual underlying fetch request.
     - Prevents timed-out requests from triggering automatic retries or consuming redundant quota.
     - Implemented abort-aware sleep helper (`sleepWithAbort`) that immediately cancels backoff delays if an abort occurs.
     - Guaranteed timer and abort event-listener cleanup in `finally` block to prevent leaks and unhandled late rejections.
  3. **L-03 — Single-Tier Bounded Retry Architecture (`src/features/resumes/ai-analyzer.ts`, `src/features/interview/mock-evaluator.ts`)**:
     - Removed redundant outer retry catch blocks in `ai-analyzer` and `mock-evaluator`.
     - Centralized all transient retry and exponential backoff into `geminiService`, eliminating stacked retries, rate-limit depletion, and compounding latency.
  4. **L-04 — Numeric Score Serialization & Strict State Guards (`src/features/interview/mock-interview-service.ts`)**:
     - Implemented robust `parseScore` helper handling numbers in `[0, 10]`, formatted numeric strings (e.g. `"8.50"`), rejecting negative numbers, numbers > 10, NaN, non-finite values, and malformed strings.
     - Added strict state transition guards: rejects answer submission or retry if session is `completed` or `abandoned`, rejects answer submission if question is already `evaluated`, and rejects retry if question status is `skipped`.
  5. **L-05 — Combined Prompt Boundary Measurement & Zero Fabrication (`src/features/resumes/ai-analyzer.ts`)**:
     - Enforced `MAX_PROMPT_LENGTH = 10,000` at the final assembled prompt boundary in `buildAnalysisPrompt`.
     - Completely eliminated silent placeholder report fabrication; malformed, empty, or schema-invalid AI responses now throw explicit `AiServiceError(..., "PROVIDER_ERROR", 502)`.
  6. **L-06 — Real Calendar Date Validation & Route Revalidation (`src/features/planner/recommendation-schema.ts`, `src/features/planner/recommendation-actions.ts`)**:
     - Added `isValidCalendarDate` checking real Gregorian calendar days (handles leap years e.g. `2028-02-29`, rejects invalid dates like `2026-02-31`, `2026-04-31`, `2026-13-01`, `2027-02-29`).
     - Enforced `calendarDateSchema` across recommendation generation and acceptance schemas.
     - Added route revalidation (`revalidatePath("/planner")` and `revalidatePath("/planner/recommendations")`) on recommendation mutations.
  7. **L-07 — Supported Category Taxonomy & Candidate Deduplication (`src/features/planner/recommendation-service.ts`, `recommendation-advisor.ts`)**:
     - Replaced hardcoded category assumptions with `deriveModuleCategory` strictly adhering to `taskCategorySchema` (`java`, `spring_boot`, `cs_fundamentals`, `system_design`, `dsa`, `other`).
     - Implemented candidate batch deduplication preventing duplicate task titles and entity IDs within the same generated batch and against the target date's agenda without suppressing different dates.
  8. **L-09 — Sidebar Product Status Accuracy & Rate Limiter Documentation (`src/components/layout/sidebar.tsx`, `src/features/ai/rate-limiter.ts`)**:
     - Updated sidebar banner from misleading `"Phase 1 Active"` / `"Phase 4 Active"` to accurate `"Workspace Ready"` with description `"All preparation modules active: DSA, Roadmaps, Projects, Job Tracker & Mock Interviews."`
     - Added detailed architectural documentation in `rate-limiter.ts` explaining the zero-dependency in-memory sliding window, its serverless multi-instance constraints, and the future distributed Redis/Postgres evolution path.
- **Deterministic Quality Gates**:
  - Vitest Unit Suite: **30/30 files passed, 321/321 tests passed** (+12 new tests in `tests/phase4-batch-d.test.ts`).
  - TypeScript: **0 errors** (`tsc --noEmit`).
  - ESLint: **0 errors, 0 warnings** (`eslint`).
  - Production Build: **20/20 static pages generated, 23 routes compiled** (`next build`).

## Phase 4 Remediation: Batch C (Database Integrity & Security)
- **Zero AI API Invocation**: Guaranteed zero Gemini API tokens consumed across all verification and remediation tasks.
- **Zero Live DB Mutations**: Migration 0014 authored forward-only without applying to live Supabase; zero live records mutated; verified read-only that 0 existing records violate constraints.
- **Remediations Implemented**:
  1. **M-08 — Interview Question Ownership Integrity & Score Bounds (`supabase/migrations/0014_phase4_batch_c_database_integrity_and_security.sql`)**:
     - Upgraded single-column foreign key `interview_questions.question_bank_id` to composite owner-scoped foreign key `interview_questions_bank_owner_fk (question_bank_id, user_id) references public.interview_question_bank(id, user_id) on delete set null (question_bank_id)`.
     - Guarantees multi-tenant isolation by preventing cross-tenant question bank linking.
     - Added CHECK constraints: `interview_questions_score_check (score is null or (score >= 0 and score <= 10))` and `interview_sessions_overall_score_check (overall_score is null or (overall_score >= 0 and overall_score <= 10))`.
  2. **N-03 — Project Bug/Feature Foreign-Key Deletion Correction (`supabase/migrations/0014_phase4_batch_c_database_integrity_and_security.sql`)**:
     - Corrected `project_bugs_feature_owner_fk` from bare `ON DELETE SET NULL` to column-specific `ON DELETE SET NULL (feature_id)`.
     - Enables deleting features with linked bugs without violating `NOT NULL` on `project_bugs.user_id`, preserving ownership integrity and project association.
  3. **L-08 — Phase 4 Batch 4 RPC Hardening (`supabase/migrations/0014_phase4_batch_c_database_integrity_and_security.sql`)**:
     - Hardened `public.accept_study_recommendation()` with fixed safe `SET search_path = public, pg_temp` to eliminate search-path injection risk.
     - Enforced least-privilege permissions: revoked execution from `PUBLIC` and `anon`; granted exclusively to `authenticated` and `service_role`.
     - Preserved atomic acceptance and idempotency guarantees under `SECURITY INVOKER` enforcing `auth.uid()`.
- **Deterministic Quality Gates**:
  - Vitest Unit Suite: **29/29 files passed, 309/309 tests passed** (`npx.cmd vitest run --exclude "**/*live*.test.ts" --exclude "**/resumes-security-audit.test.ts"`).
  - TypeScript: **0 errors** (`tsc --noEmit`).
  - ESLint: **0 errors, 0 warnings** (`eslint`).
  - Production Build: **20/20 static pages generated, 23 routes compiled** (`next build`).

## Phase 4 Remediation: Batch B Targeted Corrections (M-01, M-02, M-06)
- **Zero AI API Invocation**: Guaranteed zero Gemini API tokens consumed across all verification and remediation tasks.
- **Zero Live DB Mutations**: Migration 0013 authored forward-only without applying to live Supabase; zero live records mutated.
- **Targeted Corrections Implemented**:
  1. **M-01 — Upfront Retry Rate Limiting (`src/features/interview/mock-interview-service.ts`)**:
     - Upfront rate-limit check `aiRateLimiter.check(userId)` added at the start of `retryEvaluation()` before question lookup or state mutation.
     - Rejects rate-limited requests immediately with `AiServiceError(..., "RATE_LIMITED", 429)`, preserving previously saved user answers and guaranteeing zero AI calls.
     - Deterministic unit tests verified: within-limit success, over-limit rejection (0 AI calls confirmed via spy), and cross-user rate limit isolation.
  2. **M-02 — Concurrency Safety & Atomic State Transitions (`src/features/interview/mock-interview-service.ts`)**:
     - Atomic conditional update claim in PostgreSQL: `update({ evaluation_status: "evaluating", user_answer: ... }).eq("id", ...).eq("session_id", ...).eq("user_id", ...).eq("evaluation_status", eligibleStatus).select()`.
     - Eligible status is `'pending'` for initial submissions and `'failed'` for retries.
     - If two requests arrive concurrently, exactly one claim succeeds; the second receives 0 rows and throws `"Question is currently being evaluated. Please wait."` before invoking the evaluator.
     - Pre-checks reject answers to `completed` or `abandoned` sessions upfront.
     - Deterministic unit tests verified: concurrent submissions, concurrent retries, session status guards, and cross-user isolation.
  3. **M-06 — Concurrency-Safe Question Bank Deduplication (`src/features/resumes/ai-analysis-service.ts`)**:
     - Stable deterministic uniqueness identifier `source_external_id = "ai-gen-" + crypto.createHash("sha256").update(normalizedPrompt.toLowerCase()).digest("hex").slice(0, 32)` leveraging existing live partial unique index `interview_question_bank_external_uidx`.
     - Graceful conflict recovery: catches PostgreSQL error `23505` and returns the existing question ID without throwing.
     - Forward-only migration authored: `supabase/migrations/0013_phase4_interview_question_bank_dedup.sql` with scoped partial unique index `interview_question_bank_ai_prompt_uidx (user_id, md5(lower(trim(question_prompt)))) WHERE source_name = 'AI Generated (JD Alignment)'`. Left unapplied to live DB as existing live index `interview_question_bank_external_uidx` already provides 100% of the required concurrency protection.
     - Deterministic unit tests verified: first save, repeated save, concurrent identical saves, different questions, similar questions, cross-user isolation, and error 23505 conflict recovery.
- **Deterministic Quality Gates**:
  - Vitest Unit Suite: **28/28 files passed, 300/300 tests passed** (`npx.cmd vitest run --exclude "**/*live*.test.ts" --exclude "**/resumes-security-audit.test.ts"`).
  - TypeScript: **0 errors** (`tsc --noEmit`).
  - ESLint: **0 errors, 0 warnings** (`eslint`).
  - Production Build: **20/20 static pages generated, 23 routes compiled** (`next build`).

## Phase 4 Final Comprehensive Audit Summary (Independent Zero-AI Re-Audit)
- **Audit Mode:** Strict audit-only independent re-audit (no code/migration changes, no Gemini API invocations). Branch: `main`, HEAD: `63b625d` (Batch 4 + Migration 0012 currently uncommitted in working tree).
- **Deterministic Quality Gates:**
  - Deterministic Unit Suites (no AI): **24/24 files, 186/186 tests PASSED**.
  - Mocked AI Suites (no live AI): **4/4 files, 71/71 tests PASSED**.
  - Live Supabase-Only Suites (no AI): **5/5 files, 28/28 tests PASSED**.
  - Live AI Suites: **5 files, 65 tests SKIPPED** (`mock-interview-live`, `phase4-batch2-live-audit`, `ai-resume-analysis-live`, `phase4-batch3-live-migration-audit`, `study-recommendations-live`) to guarantee zero Gemini token consumption.
  - TypeScript (`tsc --noEmit`): **PASS (0 errors)**.
  - ESLint (`eslint`): **PASS (0 errors, 0 warnings)**.
  - Production Build (`next build`): **PASS (20/20 static pages, 23 routes compiled)**.
  - Static Client Bundle Secret Scan (58 `.next/static` files): **PASS (0 API key hits, 0 `GEMINI_API_KEY` hits, 0 `@google/genai` hits)**.
  - Live Read-Only Database & RLS Audit: **PASS** across all 21 public tables (unauthenticated access returns 0 rows; User B sees 0 of User A's rows; `career-files` bucket private; Migrations 0010, 0011, 0012 live columns verified).
  - Dependency Security (`npm audit`): 21 total vulnerabilities (7 moderate, 12 high, 2 critical dev-only via `vitest`/`tinypool`); 3 production vulnerabilities (`zod <4.6.6`, `next` bundled `postcss <=8.5.22`).
- **Open Audit Findings Pending User Approval (No Fixes Applied):**
  - **Medium (14 — 11 Still Present from Previous Audit + 3 Newly Discovered):**
    1. `M-01`: Missing `aiRateLimiter.check(userId)` in Batch 2 (`mock-interview-service.ts`) and Batch 3 (`ai-analysis-service.ts`).
    2. `M-02`: Missing duplicate/completed-session guard in `MockInterviewService.submitAnswer()`.
    3. `M-03`: `interview_sessions.provider`, `model`, and `prompt_version` never persisted by `MockInterviewService`.
    4. `M-04`: Silent fabricated fallback score (`score: 5`, rubric `3/5`) on malformed Gemini JSON in `mock-evaluator.ts` instead of marking `failed` for retry.
    5. `M-05`: Missing Zod validation on 5 server actions in `src/features/resumes/ai-actions.ts`.
    6. `M-06`: Missing deduplication before saving AI-generated questions in `ResumeJdAnalysisService.saveGeneratedQuestionToBank()`.
    7. `M-07`: Silent `mem-<uuid>` fallback swallowing DB insert errors in `ResumeJdAnalysisService.runAnalysis()` (Batch 3 `resume_jd_analyses`, not mock interview sessions).
    8. `M-08`: Migration 0010 `interview_questions.question_bank_id` uses single-column FK instead of composite `(question_bank_id, user_id)` owner FK.
    9. `M-09`: Cross-feature deep links `/interview-questions?skill=<skill_name>` fail for multi-word skills because `getQuestions()` matches `skill_slug` with spaces un-slugified (`src/features/interview/service.ts:160`).
    10. `M-10`: Cross-feature bug: `src/app/(app)/dashboard/page.tsx:49` selects non-existent `status` column on `learning_modules` (verified live error).
    11. `M-11`: Cross-feature bug: `src/features/planner/service.ts:217` (`generateSprintPreview`) selects non-existent `topic` column on `dsa_questions` (verified live error).
    12. `N-01` *(Newly Discovered)*: `src/app/(app)/resume/page.tsx:31` and `src/app/(app)/resume/analysis/[id]/page.tsx:28` query non-existent `company_name` and `deleted_at` columns on `job_applications` (verified live error), leaving application-linking dropdowns empty.
    13. `N-02` *(Newly Discovered)*: `src/lib/supabase/middleware.ts:5-14` omits `/projects`, `/applications`, `/resume`, `/interview`, and `/onboarding` from `isProtectedAppRoute()` (pages enforce auth individually, but middleware redirect is bypassed).
    14. `N-03` *(Newly Discovered)*: Migration 0007 (`0007_phase3_project_tracker_extensions.sql:49-50`) defines composite FK `project_bugs_feature_owner_fk (feature_id, user_id)` with bare `ON DELETE SET NULL` instead of `ON DELETE SET NULL (feature_id)`, causing feature deletion with linked bugs to fail `NOT NULL` on `user_id`.
  - **Low (9 — All Still Present):** `L-01` missing `import "server-only"` on `gemini-service.ts`; `L-02` unhandled timeout rejection window during 4s retry sleep in `gemini-service.ts`; `L-03` double retry backoff stacking in Batch 2 & Batch 3; `L-04` `numeric(4,2)` string vs number check on `q.score` & retrying skipped questions in `mock-interview-service.ts`; `L-05` prompt length margin near `10,000` chars & silent empty fallback in `ai-analyzer.ts`; `L-06` unvalidated `targetDate` and missing `revalidatePath("/planner")` in `recommendation-actions.ts`; `L-07` hardcoded `spring_boot` category on incomplete modules & no same-day module title exclusion in `recommendation-service.ts`; `L-08` missing `SET search_path` / explicit `REVOKE EXECUTE FROM public, anon` on `accept_study_recommendation()` (Migration 0012), missing `0..10` check constraint on `score` (Migration 0010), redundant inline single-column FKs (Migration 0011); `L-09` stale `"Phase 1 Active"` banner in `sidebar.tsx` + in-memory serverless rate limiter limitation.

## Phase 4 Remediation — Batch A (Cross-Feature Bug Fixes)
- **Status:** Complete & Verified (zero Gemini API calls; zero migration, DB record, or dependency changes).
- **Fixed Findings (`5`):**
  - **`M-09` (Fixed & Live Read-Only Verified):** Added `resolveSkillFilterSlugs()` in `src/features/interview/service.ts` and wired it into `getQuestions()` to normalize spaces/underscores/hyphens, taxonomy skill names, seed skill names (`Hibernate and JPA`, `REST APIs`, `Spring Boot`, `Spring Security`), and category aliases (`System Design` → `["lld", "hld"]`) strictly without weakening unknown-skill filtering. Live read-only DB probe confirmed non-zero curated question matches (`Spring Boot`: 14, `Hibernate and JPA`: 12, `REST APIs`: 12, `Spring Security`: 11, `System Design`: 20, `Java`: 12, unknown `Quantum Computing`: 0).
  - **`M-10` (Fixed & Live Read-Only Verified):** Added `getDashboardCourseProgress()` in `src/features/learning/service.ts` querying only actual `learning_modules` columns (`module_number, title, completion_percent`), reusing `calculateCourseProgress()`, and wired `src/app/(app)/dashboard/page.tsx` with explicit error UI (`Unavailable` badge + alert) instead of silently showing `0%`. Live read-only query succeeded (`error: null`).
  - **`M-11` (Fixed & Live Read-Only Verified):** Updated `generateSprintPreview()` in `src/features/planner/service.ts` to query `dsa_questions.patterns` instead of nonexistent `topic`, throw explicit errors, and map 1/multiple/empty patterns safely with `"Algorithms"` fallback. Live read-only query returned all 75 Grind 75 rows (`error: null`).
  - **`N-01` (Fixed & Live Read-Only Verified):** Added `getResumeApplicationOptions()` in `src/features/resumes/service.ts` querying actual `job_applications` columns (`id, company, role_title`) without nonexistent `company_name` or `deleted_at`, and updated both `src/app/(app)/resume/page.tsx` and `src/app/(app)/resume/analysis/[id]/page.tsx` with consistent mapping and explicit error banners. Live read-only query returned all 6 user applications (`error: null`).
  - **`N-02` (Fixed & Unit Verified):** Updated `isProtectedAppRoute()` in `src/lib/supabase/middleware.ts` to cover `/projects`, `/applications`, `/resume`, `/interview`, and `/onboarding` (plus nested paths) using boundary-safe matching (`pathname === prefix || pathname.startsWith(prefix + "/")`) preventing accidental prefix collisions.
- **Verification Summary:**
  - Deterministic unit tests: **24/24 files, 206/206 passed** (+20 new tests across `interview-service`, `learning-modules`, `planner-service`, `resumes`, `routes`).
  - Mocked AI tests: **4/4 files, 71/71 passed**.
  - Live Supabase-only tests (Phase 3, zero AI): **5/5 files, 28/28 passed**.
  - Live AI tests: **5 files, 65 tests skipped** (strict zero-Gemini compliance).
  - TypeScript (`tsc --noEmit`): **PASS (0 errors)**; ESLint (`eslint`): **PASS (0 errors, 0 warnings)**; Production build (`next build`): **PASS (20/20 static pages, 23 routes compiled)**.
- **Remaining Unaddressed Audit Findings (Deferred to Later Batches):** `M-01`–`M-08`, `N-03`, `L-01`–`L-09`, and dependency advisories.

## Phase 4 Remediation — Batch B (AI Security & Reliability)
- **Status:** Complete & Verified (zero Gemini API calls; zero live DB mutations; zero dependency changes).
- **Fixed Findings (`7`):**
  - **`M-01` (Rate Limiter Enforcement):** Enforced `aiRateLimiter.check(userId)` in `MockInterviewService.submitAnswer()` (prior to AI evaluation) and `ResumeJdAnalysisService.runAnalysis()` (prior to JD question queries & Gemini analysis), throwing `AiServiceError(..., "RATE_LIMITED", 429)`. On mock interview submission rate limit, question state transitions to `failed` and preserves the candidate's answer for retry.
  - **`M-02` (Session & Duplicate Submission Guards):** In `MockInterviewService.submitAnswer()`: rejected submissions if session is `completed` or `abandoned`; rejected submissions if question is already `evaluating`, `evaluated`, or `skipped`. In `MockInterviewService.retryEvaluation()`: guarded session status (`completed`/`abandoned`) and required question `evaluation_status === "failed"`.
  - **`M-03` (AI Provenance Persistence):** Persisted `provider: "gemini"`, `model: geminiService.getModel()`, and `prompt_version: "mock-eval-v1"` during `MockInterviewService.createSession()`. Verified existing columns from Migration 0005 (`0005_interview_tables.sql:9-11`); no schema migration required.
  - **`M-04` (Evaluator Score Fabrication Elimination):** Removed fallback score fabrication (`score: 5`, rubric scores `3/5`) in `src/features/interview/mock-evaluator.ts`. Schema parse errors now throw `AiServiceError(..., "PROVIDER_ERROR", 502)`, transitioning the question to `failed` status and enabling candidate retry.
  - **`M-05` (Resume Analysis Actions Zod Validation):** Added boundary-level Zod schema validation to all 5 unvalidated server actions in `src/features/resumes/ai-actions.ts`: `getAiResumeJdAnalysisAction` (UUID check), `listAiResumeJdAnalysesAction` (UUID filters check), `connectAnalysisToApplicationAction` (composite UUID check), `saveGeneratedQuestionToBankAction` (`targetedInterviewQuestionSchema`), and `deleteAiAnalysisAction` (UUID check).
  - **`M-06` (Duplicate Saved Question Prevention):** In `ResumeJdAnalysisService.saveGeneratedQuestionToBank()`, added query for existing question with matching `user_id` and normalized `question_prompt`. Returns existing question ID immediately without inserting duplicates.
  - **`M-07` (Removal of Silent In-Memory Fallback):** In `ResumeJdAnalysisService.runAnalysis()`, removed silent `mem-<uuid>` fallback catch block. Any database insertion failure on `resume_jd_analyses` now surfaces as an explicit thrown error.
- **Verification Summary:**
  - Deterministic unit test suite: **28/28 files, 290/290 passed** (+13 new tests across `tests/mock-interview.test.ts` and `tests/ai-resume-analysis.test.ts`).
  - Live AI tests skipped: **5 files, 65 tests skipped** (strict zero-Gemini API compliance).
  - Live database mutations: **0 writes executed**.
  - TypeScript (`tsc --noEmit`): **PASS (0 errors)**.
  - ESLint (`eslint`): **PASS (0 errors, 0 warnings)**.
  - Production build (`next build`): **PASS (20/20 static pages, 23 routes compiled)**.
- **Remaining Unaddressed Audit Findings (Deferred to Later Batches):** `M-08`, `N-03`, `L-01`–`L-09`, and dependency advisories.

## Completed

### Phase 4 Batch 4: Personalized AI Study Recommendations & Adaptive Revision Advisor
- **Deterministic Candidate Engine & Schemas (`src/features/planner/recommendation-schema.ts`, `recommendation-service.ts`)**:
  - Gathers candidate study actions deterministically from real user learning data:
    1. Overdue/due spaced repetition DSA revisions via `getDueRevisions` (calculated via `workload.ts` and `study_plans` intervals).
    2. Weak learning topics via `getUserTopics` filtered by confidence level (`learning` / `review_needed`).
    3. Incomplete learning modules via `getUserModules` prioritized by status (`in_progress` over `not_started`).
    4. Unanswered interview question bank gaps via `interview_question_bank` taxonomy.
  - Automatically deduplicates and excludes any candidate actions already planned in today's agenda via `getDayAgenda`.
  - Enforces sliding-window rate limit via `aiRateLimiter.check(userId)` prior to external model execution.
- **Strict Architectural Separation & Anti-Hallucination Guardrails (`src/features/planner/recommendation-advisor.ts`)**:
  - **Zero AI Date Arithmetic**: Gemini is strictly prohibited from generating, modifying, or computing calendar dates, spaced-repetition intervals, or task due dates.
  - Pre-sorts deterministic candidates by domain urgency and passes at most 12 candidates in `<candidate_pool>` XML tags to bound prompt size.
  - System prompt strictly instructs Gemini to act only as an advisor, selecting at most 3 items and explaining their immediate value and expected outcome.
  - Runtime validation via Zod (`rawGeminiAdvisorOutputSchema`) strictly enforcing `.max(3)` items.
  - Hallucinated ID rejection: Any candidate ID returned by Gemini that was not in the deterministic candidate pool is immediately discarded.
  - Graceful fallback: If Gemini times out, experiences rate limiting, or fails, the engine falls back to the top 3 deterministic candidates without breaking the user flow.
- **Mandatory User Acceptance & Idempotent Persistence (`src/features/planner/recommendation-service.ts`, `recommendation-actions.ts`)**:
  - Task creation in `public.study_tasks` is NEVER performed automatically. The user must review recommendations and explicitly click "Accept" or "Accept All".
  - Resolves active plan ID and validates UUID foreign keys (`learning_topic_id`, `question_id`, `interview_question_id`).
  - Idempotent task creation: Checks for existing tasks for the same entity or title on the target date before inserting, preventing double-click task duplication.
  - Batch acceptance action (`acceptAllStudyRecommendationsAction`) safely processes pending recommendations sequentially.
- **Interactive UI & Capacity Impact Meter (`src/app/(app)/planner/recommendations/`)**:
  - Dedicated route at `/planner/recommendations` with breadcrumbs linking back to `/planner`.
  - Visual dual-tone capacity meter comparing current planned study minutes vs. recommended minutes against the user's daily capacity limit.
  - Displays up to 3 recommendation cards with priority badges (High, Medium, Low), action category pills (DSA Revision, Weak Topic, Module, Interview Prep), estimated duration, "Why this matters", and "Expected outcome".
  - Single-click "Accept Task" (adds to today's agenda), "Dismiss" (removes from view without saving), and "Accept All Pending".
  - Added entry points and quick-action buttons from `/planner` dashboard and `DailyAgenda` header.
- **Verification & Quality Gates**:
  - Unit tests in `tests/study-recommendations.test.ts`: 15/15 passing covering deterministic candidate building, schema validation, max 3 bounds, hallucinated ID rejection, zero-task persistence without acceptance, transparent fallback modes (timeout, missing key, malformed JSON, schema violation), error 23505 conflict recovery, and idempotency.
  - Live tests in `tests/study-recommendations-live.test.ts`: 13/13 passing against live Supabase and live Gemini (`gemini-3.5-flash-lite`), confirming live AI ranking (`generationSource: "gemini"`), Migration 0012 live schema, 10-way simultaneous concurrent acceptance resolving to strictly 1 database row & 1 task ID, manual tasks without `idempotency_key`, distinct recommendations, and two-user RLS isolation.
  - Full Vitest suite: **38 test files, 350/350 tests passing** (`npm test -- --run`).
  - TypeScript: 0 errors (`npm run typecheck`).
  - ESLint: 0 errors, 0 warnings (`npm run lint`).
  - Production Build: `next build` compiled and optimized 23 routes cleanly (including `ƒ /planner/recommendations`).
- **Defect Fixes & Post-Migration Live Verification (Migration 0012)**:
  - **Transparent Gemini Fallback**: Added explicit `generationSource` (`gemini` vs `deterministic_fallback`), `fallbackReason`, and individual card `source` attributes. UI displays a dedicated subtle amber banner with "Retry AI Analysis" button when fallback is active, ensuring deterministic output is never misrepresented as AI-generated.
  - **Database-Level Idempotency Protection (Migration 0012 Applied & Verified Live)**: Applied `0012_phase4_study_tasks_idempotency.sql` in live Supabase. Verified `study_tasks.idempotency_key`, unique partial index `study_tasks_user_idempotency_idx` (`23505` on direct duplicate insert; `NULL` allowed for manual tasks), and `SECURITY INVOKER` stored procedure `accept_study_recommendation()` enforcing `auth.uid()` ownership and cross-tenant composite FK integrity (`23503`). Existing user baseline preserved unchanged (User A: 480 `study_tasks`, User B: 0).

### Phase 4 Batch 3: AI Resume & Job Description Intelligence
- **Migration 0011 Authored & AST-Verified (`0011_phase4_resume_jd_analyses.sql`)**:
  - Authored `public.resume_jd_analyses` table with UUID primary key, `user_id`, `resume_id`, `job_description_id`, `application_id`, `target_role`, `company_name`, `role_title`, `analysis_json`, and timestamps.
  - Enforced composite unique constraint `(id, user_id)` for tenant isolation.
  - Enforced composite foreign keys with cascading delete on resume and `on delete set null` on job description and application.
  - Performance indexes added: `resume_jd_analyses_user_created_idx`, `resume_jd_analyses_user_resume_jd_idx`, and `resume_jd_analyses_app_idx`.
  - Supabase Row Level Security policy (`auth.uid() = user_id`) and `set_updated_at` trigger.
- **AI Resume vs JD Match Engine (`src/features/resumes/ai-analyzer.ts`, `ai-analyzer-schema.ts`)**:
  - Robust prompt injection defense: untrusted resume and JD text strictly wrapped in `<resume_text>` and `<job_description>` XML tags with system instructions to treat candidate data as raw untrusted input.
  - Input length bounding (safe truncation to 3,800 chars each) strictly respecting the 10,000 character maximum prompt boundary in `src/features/ai/schema.ts`.
  - 10-dimension structured analysis:
    - Qualitative Readiness Level (`Strong Match`, `Moderate Match`, `Growth Match`, `Low Match`) avoiding misleading pseudo-scientific ATS scores.
    - 4-quadrant skill alignment: Matching, Missing, Mentioned but Not Demonstrated, and Partially Matching skills.
    - Demonstrated experience assessment & unmet requirements breakdown.
    - Critical JD keywords for recruiter review.
    - Google X-Y-Z bullet rewrites with strict zero-fabrication placeholders (`[X%]`, `[N req/s]`).
    - Recruiter screening questions with talking points.
    - Technical interview topics and prep advice.
    - Targeted interview questions prioritizing the 376-question bank first and supplementing with niche questions.
- **Service Layer & Safe Fallbacks (`src/features/resumes/ai-analysis-service.ts`, `ai-actions.ts`)**:
  - `ResumeJdAnalysisService` with `runAnalysis`, `getAnalysis`, `listAnalyses`, `connectApplication`, `saveGeneratedQuestionToBank`, and `deleteAnalysis`.
  - Fallback resilience: gracefully operates with in-memory IDs if migration 0011 is pending execution in Supabase.
  - Question bank saving: maps generated questions into `interview_question_bank` with taxonomy slugs, categories, `source_name: "AI Generated (JD Alignment)"`, and `origin: "ai_generated"`.
- **UI Components & Pages (`src/app/(app)/resume/`)**:
  - Added "AI Match & Coach" 4th tab (`ai-intelligence`) to `/resume` alongside Resumes, JDs, and Skill Alignment.
  - `AiAnalysisTab`: interactive setup allowing resume selection, JD selection (or custom JD input), target role specification, running analysis, and viewing past analysis history cards.
  - `AiAnalysisReport`: interactive 10-dimension report UI with qualitative banner, 4 skill buckets, bullet improvements with metric placeholders, recruiter questions, technical topics, targeted questions with "Save to Question Bank" button, and job application linker.
  - Dedicated direct report page at `/resume/analysis/[id]` with breadcrumb navigation and 404 handling.
- **Verification & Quality Gates**:
  - Unit tests in `tests/ai-resume-analysis.test.ts`: 11/11 passing.
  - Live tests in `tests/ai-resume-analysis-live.test.ts`: 11/11 passing.
  - Live audit tests in `tests/phase4-batch2-live-audit.test.ts`: 18/18 passing.
  - TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 errors, 0 warnings (`npx eslint`).

### Phase 4 Batch 2: Technical Mock Interview & Answer Coaching Engine
- **Migration 0010 Live Supabase Execution & Verification (`0010_phase4_mock_interviews_and_evaluations.sql`)**:
  - Live schema verification confirmed all 5 extended columns in `interview_sessions`: `interview_type`, `selected_skills`, `total_questions`, `overall_score`, `summary_json`.
  - Live schema verification confirmed all 12 extended columns in `interview_questions`: `question_bank_id`, `skill_name`, `topic`, `difficulty`, `score`, `incorrect_statements`, `clarity_assessment`, `depth_assessment`, `improvement_advice`, `follow_up_questions_json`, `evaluation_status`, `evaluated_at`.
  - Confirmed relaxed `interview_sessions_difficulty_check` constraint supporting both taxonomy levels and UI difficulty values (`beginner`, `intermediate`, `advanced`, `easy`, `medium`, `hard`, `mixed`).
  - Confirmed `evaluation_status` check constraint (`pending`, `evaluating`, `evaluated`, `skipped`, `failed`).
  - Confirmed foreign key `question_bank_id` references `interview_question_bank(id)` with `on delete set null`.
  - Confirmed composite and foreign key indexes: `interview_sessions_user_status_idx`, `interview_questions_session_idx`, and `interview_questions_bank_idx`.
  - Live end-to-end audit test (`tests/phase4-batch2-live-audit.test.ts`) verified live persistence, Gemini scoring, skip handling, failed-evaluation retry, session completion, and two-user RLS isolation.
- **Mock Interview Setup Experience (`/interview`)**:
  - Interactive track configuration supporting: Java Backend, Full Stack, Project-Based, DSA, Technical, and Mixed.
  - Granular skill selection across 25+ resume question bank skills.
  - Difficulty selection (Basic, Intermediate, Advanced, Mixed) and Question Count (5, 10, 15).
  - Dynamic duration estimation (~3 mins per question).
  - Interview history list showing past sessions, scores, track badges, and timestamps.
- **Question Bank Integration & Sampling**:
  - Zero duplicate questions within a session.
  - Balanced round-robin sampling across selected skills from the 376-question bank (`interview_question_bank`).
  - Seamless fallback to active questions if filters exceed specific counts.
- **Interactive Interview Workspace (`/interview/[id]`)**:
  - Displays questions one at a time with track, skill, and difficulty badges.
  - Multi-line candidate answer input with live character counter (5,000 char maximum).
  - Candidate actions: "Submit Answer" (triggers Gemini evaluation), "Skip Question" (records skip with zero score, bypasses AI to conserve quota), and "Finish Interview Early".
  - Offline/failure resilience: Answers pre-saved to database prior to AI execution; "Retry Evaluation" action if AI encounters temporary network/quota issues.
  - Real-time Gemini evaluation card displaying:
    - Overall score (0-10) with colored badges.
    - 5-dimension rubric breakdown (1-5): Technical Correctness, Completeness, Clarity, Practical Depth, Tradeoff Awareness.
    - Verified strengths list & missing concepts / inaccuracies list.
    - Constructive, actionable improvement advice.
    - Expandable ideal interview answer (2-3 paragraphs).
    - Relevant probing follow-up questions.
- **Prompt Injection Defense & Security**:
  - Untrusted candidate answer wrapped strictly in `<candidate_answer>` XML tags.
  - Strict system instruction prioritizing scoring rubric and question truth over candidate injection instructions.
  - Robust JSON extraction handling markdown fences and trailing thoughts.
- **Interview Results Analytics View (`/interview/[id]` when completed)**:
  - Overall performance banner with score/10, percentage, and completion status.
  - Summary metrics: Attempted vs. Skipped vs. Unanswered question counts.
  - Skill performance breakdown meters with average score per skill.
  - Strong areas vs. Weak areas tags.
  - Recommended revisions with direct deep links to `/learning` and `/interview-questions?skill=...`.
  - Comprehensive question review cards with user answers, ideal answers, and feedback.
- **Navigation & Database Schema**:
  - Added "Mock Interview" (`/interview`, `Sparkles`, `P4`) to `Sidebar`.
  - Created migration `0010_phase4_mock_interviews_and_evaluations.sql` for extended analytics columns, with full backward/forward compatibility in service layer.

### Phase 4 Batch 1: Secure Gemini AI Integration Foundation
- **Official SDK Integration**:
  - Installed and configured official `@google/genai` TypeScript SDK.
  - Fully encapsulated in server-only modules (`src/features/ai/`).
- **Server-Side Environment Security**:
  - Configured `GEMINI_API_KEY` (server-only secret) and `GEMINI_MODEL` (default: `gemini-2.5-flash`) via `src/lib/env.ts` (`aiEnvSchema` & `getAiConfig`).
  - Never prefixed with `NEXT_PUBLIC_` and never included in client-accessible bundles.
  - Automated security tests verify zero presence of `GEMINI_API_KEY` in client environments, error payloads, or API responses.
- **In-Memory Rate Limiting (`src/features/ai/rate-limiter.ts`)**:
  - Zero-external-infrastructure sliding window limiter tracking request counts per authenticated user in server memory.
  - Default: 10 requests per minute per user; returns HTTP 429 with standard `Retry-After` header when exceeded.
  - Memory-safe automatic pruning of expired tracking records.
- **Request Size Limits & Zod Validation (`src/features/ai/schema.ts`)**:
  - Verification prompt capped at 1,000 characters.
  - General prompt capped at 10,000 characters; max output tokens capped at 8,192.
  - Strict boundary validation with Zod returning standardized `INVALID_REQUEST` (HTTP 400).
- **Reusable Server-Side Gemini Service (`src/features/ai/gemini-service.ts`)**:
  - `GeminiService` class with lazy client initialization, timeout enforcement (AbortSignal + 30s timeout), and content safety handling (`finishReason: "SAFETY"` -> `CONTENT_FILTERED`).
  - Structured, sanitized error normalization mapping provider errors to safe, user-friendly codes (`MISSING_API_KEY`, `QUOTA_EXCEEDED`, `TIMEOUT`, `CONTENT_FILTERED`, `PROVIDER_ERROR`) without leaking URLs, keys, or stack traces.
- **Protected Verification Endpoint (`/api/ai/verify`)**:
  - Enforces Supabase authenticated session via `@supabase/ssr`.
  - `GET /api/ai/verify`: Returns server configuration status (`configured: boolean`, `model: string`).
  - `POST /api/ai/verify`: Executes a minimal connectivity generation test with rate limiting and payload validation.
- **Documentation & Configuration**:
  - Updated `.env.example` with non-secret placeholder comments.
  - Comprehensive guide in `docs/GEMINI_API_KEY_SETUP.md` covering key acquisition, local setup, Vercel configuration, rate limits, and cost controls.


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
  - Priorities strictly enforced: Java, OOP, Collections, JVM, Multithreading, Spring Core, Spring Boot, Spring Security, Hibernate/JPA, REST APIs, SQL, DBMS, Microservices, Kafka, DSA, LLD, and project deep dives prioritized.
  - Every question includes prompt, evaluation rubric, sample answer, follow-up probes, difficulty, priority, and CareerOS curated attribution.
  - Dual navigation (Skill-first and Topic-first) with full-text search, filters, self-assessment, and spaced repetition.
- **Capacity-Aware Study Sprint & Daily Task Planner (`/planner`)**:
  - Capacity calculation from profile study budget, overload warnings, preview-before-accept 30/45/60 day alternatives.
  - Daily Agenda, task rescheduling, Day 31+ adaptive prioritization algorithm.

### Phase 3 Batch 1: Project Tracker (`/projects`)
- **Project Management**:
  - Full CRUD for projects (`/projects` and `/projects/[id]`).
  - Core fields: Name, category, technologies, GitHub repository URL, live deployment URL, status (`planning`, `in_progress`, `completed`, `on_hold`), start date, objectives, key achievements.
- **Feature & Defect Tracking**:
  - Project features with priority (`critical`, `high`, `medium`, `low`) and status (`planned`, `in_progress`, `implemented`, `blocked`, `done`).
  - Defect tracker with severity, reproduction steps, resolution notes, and status (`open`, `investigating`, `resolved`, `wont_fix`).
- **Architecture & Interview Defense**:
  - High-level architecture decisions, system design trade-offs, scaling considerations.
  - Interview defense cheat-sheet: technical elevator pitch, hardest challenges, technical trade-offs, and metrics defense.
- **Idempotent Lovable Project Seeding**:
  - Verified facts only from profile and documentation; zero fabricated metrics or URLs.

### Phase 3 Batch 2: Job Application Tracker (`/applications`)
- **Job Application Management**:
  - Full CRUD (`/applications` and `/applications/[id]`).
  - Company, role title, job description, job URL, careers URL, location, work mode (`remote`, `hybrid`, `onsite`), employment type (`full_time`, `contract`, `internship`, `part_time`).
  - Salary range (min/max LPA), expected CTC, applied salary LPA.
  - Recruiter contact info, referral contact, referral status.
- **11-Stage Pipeline**:
  - Interested, Applied, Referral Requested, Screening, Technical Round 1, Technical Round 2, Managerial Round, HR Round, Offer, Rejected, On Hold.
  - Kanban board and interactive Table view with search, filtering, and sorting.
  - In-flight duplicate detection based on company, role title, and job URL.
- **Interview Rounds & Activity History**:
  - Multi-round interview tracking (round name, interviewer, topics, questions asked, performance notes, result).
  - Activity audit log recording previous stage, new stage, timestamp, and notes.
- **Follow-up & Offer Management**:
  - Follow-up alerts bar (due today, overdue, upcoming interviews, awaiting response, offers).
  - Copyable recruiter outreach and referral request message templates (no automatic email dispatch).

### Phase 3 Batch 3: Resume & Job Description Manager (`/resume`)
- **Private Resume Storage & Version Management**:
  - Upload PDF and Word (.docx) resumes up to 10MB to private Supabase Storage bucket `career-files`.
  - Secure signed download URLs (60-second expiration); zero public file exposure.
  - Multiple resume versions with target role, notes, creation dates, and file size.
  - Single primary resume constraint enforced via database-level partial unique index (`resumes_user_primary_uidx`) and transactional service logic.
  - Safe cascade deletion removing files from storage and database.
- **Server-Side Text Extraction**:
  - Server-side PDF parsing (`pdf-parse`) and DOCX body extraction (`mammoth`).
  - Non-crashing error handling for empty or malformed files with clear user guidance.
  - Extraction status tracking: `pending`, `completed`, `failed`, `manual`.
  - Built-in Extracted Text Viewer and manual editor modal allowing users to paste/edit resume text when documents are scanned images.
- **Job Description Manager**:
  - Save multiple job descriptions with Company, Role Title, Target Domain, raw text, and personal notes.
  - Link directly to existing job applications from the user's pipeline.
  - Automatic detection of taxonomy skills in JD text.
- **Deterministic Resume vs. JD Alignment Engine**:
  - 100% deterministic (no Gemini / external AI in Phase 3).
  - Categorizes skills into:
    1. **Explicitly Matching Skills**: exact match in resume text (with alias resolution).
    2. **Partially Demonstrated Skills**: candidate demonstrates foundational or sibling skills in the same taxonomy domain (e.g. Java/Spring Boot for Spring Security, Docker for Kubernetes).
    3. **Missing Skills**: skills required in JD with zero evidence in resume.
    4. **Missing Domain Keywords**: technical keywords in JD absent from resume (e.g. Redis, Prometheus, Kafka).
    5. **Actionable Resume Bullet Improvements**: concrete recommendations incorporating the Google X-Y-Z formula.
    6. **Interview Question Bank Integration**: links missing/partial skills directly to relevant questions in `/interview-questions?category=...`.
  - Prominent non-ATS disclaimer: "Deterministic Keyword & Skill Analysis — This is a deterministic skill taxonomy alignment tool based on resume text and JD keywords. It is not an official proprietary ATS score or predictor."
- **Navigation**:
  - Added "Resume & JD" nav item (`/resume`, `FileText`, `P3`) to `Sidebar`.

---

## Verification Results
- **Automated Test Suite**: 30 non-live test files, **343 tests passed** with 0 errors (`npx vitest run --exclude "**/*live*.test.ts" --exclude "**/resumes-security-audit.test.ts"`).
  - Includes dedicated `tests/phase4-batch-d.test.ts` (34/34 passed) and `tests/phase4-batch-c.test.ts` (9/9 passed).
- **TypeScript Typecheck**: `tsc --noEmit` passed with 0 errors (`npm run typecheck`).
- **ESLint**: passed with 0 errors, 0 warnings (`npm run lint`).
- **Production Build**: `next build` compiled and optimized all 20 routes with static generation (`20/20 static pages generated`).
- **Phase 4 Batch 2 Live Smoke Verification** (`tests/mock-interview-live.test.ts`):
  - Verified live Gemini AI connectivity via `gemini-3.5-flash`.
  - Created live interview session querying the 376-question bank in Supabase.
  - Successfully evaluated candidate answer with real-time scoring, rubric breakdown, actionable suggestions, ideal answer, and follow-ups.
  - Verified skipping logic bypassing AI to conserve quota.
  - Verified finalization, summary metrics, and skill breakdown calculations.
  - Cleaned up all test records leaving zero leftover records.
- **Phase 4 Batch 1 AI Verification Tests** (`tests/gemini-ai.test.ts`):
  - 31/31 passed covering missing API key, schema limits, rate limiting, mocked SDK success, safety filter handling, upstream failure mapping, authenticated route protection, and credential leak checks.
- **PostgreSQL 16 Engine Parser**: 100% valid AST validation for Migrations 0008, 0009, and 0010 via `pglast` (`libpg_query`).

- **Live Supabase Integration & Schema Verification**:
  - Migrations 0008 and 0009 applied and verified on live Supabase instance (`aukdilhlchhnwbqxwpeq.supabase.co`).
  - Migration 0010 prepared with backward/forward compatible runtime fallbacks.
  - Verified live schema: `job_applications` extended tracking columns, `resumes` primary/extraction columns.
  - Verified live tables: `application_activity`, `application_interview_rounds`, and `job_descriptions`.
  - Verified live atomic database RPC: `public.set_primary_resume(p_resume_id uuid)` with deterministic row locking and two-step primary toggle.
  - Verified live composite foreign keys: `(application_id, user_id)` and `(resume_id, user_id)` preventing cross-tenant linking.
  - Verified live `ON DELETE SET NULL (application_id)`: parent application deletion nullifies child JD link while preserving `user_id` and the JD entity.
  - Verified live interview round persistence: multi-round tracking with PostgreSQL text arrays (`topics`, `questions_asked`).
  - Verified live application activity persistence: stage transition audit logging.
  - Verified two-user multi-tenant RLS isolation: User B strictly prevented from reading, mutating, or uploading to User A's entities.
  - Zero data loss: Existing user records and baseline data completely preserved.
