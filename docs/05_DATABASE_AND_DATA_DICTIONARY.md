# 5. Database and Data Dictionary

The SQL migrations in `supabase/migrations/` are the implementation starting point. Apply them in numeric order in a new project. Migrations 0004 and 0005 add Phase 3 and Phase 4 data; migration 0006 adds the Phase 2 interview question bank, Grind 75 collection metadata and study sprint extension. Migration numbering is immutable once applied; do not renumber files after they have been run. Apply all committed migrations in numeric order, even when a later migration adds an earlier-phase feature. This document describes the intended entities and rules. Antigravity must review SQL against the installed Supabase/Postgres behavior before applying it.

## 5.1 Ownership model

Every user-owned row has `user_id uuid not null references auth.users(id) on delete cascade`, except profile, whose primary key is the auth user ID. Every table must have RLS enabled and owner policies for select/insert/update/delete. Use composite foreign keys `(child_id, user_id)` to ensure a child row cannot reference another user's parent row (for example, an attempt cannot reference another user's question). Storage policies for private resume files must restrict paths to the authenticated user's ID.

## 5.2 Entity overview

| Entity | Purpose | Phase |
|---|---|---|
| profiles | Goal, timezone, experience summary and preferences | 1 |
| learning_modules | Course modules and progress | 1/2 |
| learning_topics | Skill/topic roadmap and confidence/readiness | 2 |
| dsa_questions | Individual coding problems | 2 |
| dsa_attempts | Attempt history and outcomes | 2 |
| revision_schedules | Due revision events | 2 |
| study_tasks | Daily/weekly tasks | 2 |
| study_sessions | Optional actual time spent | 2 |
| interview_question_bank | Skill/topic-wise technical interview question catalog and per-user progress | 2 |
| study_plans | Named 30-day sprint, priority extension or custom plan | 2 |
| projects | Project metadata and status | 3 |
| project_features | Project feature/bug/next-step tracker | 3 |
| job_applications | Job pipeline records | 3 |
| resumes | Resume file metadata and version information | 3 |
| interview_sessions | Mock interview metadata | 4 |
| interview_questions | Asked questions, answers and feedback | 4 |

## 5.3 Key field semantics

### profiles
- `id`: auth user ID.
- `display_name`: editable name shown in UI; don't expose unnecessarily.
- `target_roles`: array of role labels.
- `target_salary_min_lpa`, `target_salary_max_lpa`: aspirational range, optional and editable.
- `preparation_horizon_months`: default 3-6; user editable.
- `timezone`: default `Asia/Kolkata`.
- `daily_available_minutes`: editable planning input.
- `dsa_aggregate_solved_count_is_minimum`: true when the supplied count is a lower bound such as 350+ rather than an exact total.
- `profile_context`: concise user-approved factual career context; do not store sensitive secrets.

### learning_modules
- `course_key`: stable key for idempotent seed.
- `course_name`, `module_number`, `title`.
- `completion_percent`: numeric 0-100; exact supplied values at seed.
- `status`: derived where possible: not_started, in_progress, completed.
- `course_completed_at`: optional user-entered evidence/date, not inferred from module percentage.
- `notes`, `resource_url`, `last_studied_at`.
- Course completion aggregate is the arithmetic mean of module percentages unless the product later supports course-specific weights. Display the method.

### learning_topics
- `name`, `category`, `priority`.
- `course_completion_percent` or linked module is not the same as `confidence_score`.
- `confidence_score`: nullable 1-5 self-rating.
- `assessment_status`: not_assessed, needs_work, progressing, strong.
- `interview_ready`: nullable boolean or derived user-confirmed state.
- `evidence_notes`, `last_revised_at`, `next_revision_at`.

### dsa_questions
- `title`, `url`, `difficulty`, `patterns` (or normalized tag relation if needed later), `source`, `status`, `notes`, `optimal_time_complexity`, `optimal_space_complexity`, `archived_at`. Migration 0006 adds optional `collection_tags`, `collection_order`, `external_problem_slug`, and `source_snapshot_date` so Grind 75 can be tracked without duplicating a problem already in the user's DSA history.
- Unique or duplicate warning should compare normalized URL first; title alone should warn, not block, because different platforms can have similar names.

### dsa_attempts
- `question_id`, `attempted_at`, `outcome`, `duration_minutes`, `hint_used`, `approach_notes`, `mistake_notes`, `time_complexity`, `space_complexity`, `code_language`.
- Multiple attempts for one question are valid.

### revision_schedules
- `question_id`, `scheduled_for`, `interval_days`, `status`, `completed_at`, `notes`.
- A question may have multiple revision events over time.
- Avoid duplicate open revision event for same question and same scheduled date.
- Rescheduling must be explicit and auditable through the schedule history.

### interview_question_bank
- `skill_slug`, `skill_name`, `skill_category`, `topic`, `subtopic`, `title`, `question_prompt`, `question_type`, `difficulty`, `priority`, `target_roles`, `tags`, `expected_answer_points` (JSONB), optional `sample_answer`, `follow_up_questions` (JSONB), `estimated_minutes`, `source_name`, `source_url`, `source_external_id`, `status`, `confidence_score`, `last_attempted_at`, `next_revision_at`, `answer_notes`, `is_active`.
- A question row is user-owned; enforce RLS. Keep imported/curated content distinct from user-generated and AI-generated content through `source_name` / `origin`.
- Skill values must match a confirmed `skill_slug` from the seed catalog or be a user-added skill.

### study_plans
- `name`, `plan_type` (`30_day_sprint`, `priority_extension`, `custom`), `starts_on`, `target_ends_on`, `status`, `target_role`, `daily_available_minutes`, `settings` JSONB, `created_at`.
- Plan preview is not persisted as active tasks until the user accepts it.

### study_tasks
- `title`, `description`, `category`, `planned_for`, `estimated_minutes`, `priority`, `status`, optional `question_id` (DSA), `interview_question_id` (skill-wise bank), `learning_topic_id`, and `study_plan_id`.
- Incomplete tasks are not deleted when the date passes. Offer reschedule/carry-forward.

### job_applications
- `company`, `role_title`, `job_url`, `job_description`, `stage`, `application_date`, `salary_min_lpa`, `salary_max_lpa`, `recruiter_name`, `recruiter_contact`, `referral_name`, `next_follow_up_at`, `interview_date`, `notes`, `rejection_reason`.
- Contact information is private user data. Do not display on public pages (there are none).

### resumes
- Store file metadata and private storage path. Avoid retaining extracted resume text unless required for an explicit analysis flow. Tell user what is retained and provide delete controls.

## 5.4 Data integrity rules

- Percentages must be between 0 and 100.
- Duration values must be non-negative and have reasonable upper bounds in UI validation.
- Dates must parse and use the chosen timezone behavior.
- All foreign keys between user-owned tables must enforce same-user ownership with composite constraints such as `(question_id, user_id) -> (id, user_id)`, in addition to RLS.
- Status values must be checked against documented allowed values.
- Deleting a question should not erase meaningful attempt history without confirmation. Prefer archive for questions with attempts.
- Use `on delete cascade` only where child records have no standalone value and the cascade is clearly intended.

## 5.5 Import/export

- Include CSV templates under `templates/`.
- Import should validate each row and return a result summary (created, updated, skipped, rejected with row number and reason).
- Imports must not overwrite edited rows silently.
- Export personal records to CSV/JSON from Settings before any future account migration.


## 5.6 Interview question bank and sprint integrity

- `interview_question_bank` is separate from `interview_questions` in Phase 4, which stores the questions asked during an actual mock-interview session.
- Every bank item has exactly one primary skill and topic; it may have multiple tags and target-role labels.
- `study_tasks.question_id` points to DSA problems; `study_tasks.interview_question_id` points to technology/skill interview questions. Never overload one foreign key for both.
- `study_plans` must be owner-scoped and use a composite `(id, user_id)` key for task ownership.
- Study tasks referencing a plan or question must enforce same-user ownership with composite foreign keys.
- Grind 75 is a collection attribute on DSA questions (or a collection join table if implementation needs multiple collections), not a separate duplicated question record. Normalize URLs/slugs before linking duplicates.
- Plan tasks are generated from stored bank records and DSA records; the planner must preserve the source question and explain why it was selected.
- Store a plan settings snapshot (availability, target role, selected Grind75 scope, prioritization weights and sprint dates) so plan regeneration is explainable.
