# Phase 2 Prompt - DSA, Learning Roadmap and Planner

Implement only Phase 2 from `docs/09_PHASE_2_LEARNING_AND_PLANNING.md`. Read the database and UI specifications first.

Build real persistent workflows for DSA questions, multiple attempts, revision schedules, learning modules/topics, daily study tasks and the live dashboard. Use deterministic domain functions for revision dates, course progress and daily-plan capacity. Do not call an LLM in this phase.

Respect the user baseline: completed playlist; 350+ as aggregate only; known patterns need assessment; 20 course modules with exact percentages; course completion is not mastery. Add CSV import preview/validation based on `templates/dsa_questions_import.csv`.

Write unit and integration tests for the core rules. Verify that a user can add a question, record attempts, schedule/complete revision, update module progress, create/complete/reschedule tasks and refresh without losing data. Run checks and browser QA. Update implementation status with exact test results and remaining issues.
