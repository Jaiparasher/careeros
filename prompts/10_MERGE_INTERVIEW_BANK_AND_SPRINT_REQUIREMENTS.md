# Prompt - Merge Interview Bank and 30-Day Sprint into an Existing CareerOS Workspace

Use this prompt if implementation has already started from an older CareerOS documentation pack.

Read `AGENTS.md`, `README_FIRST.md`, `docs/17_INTERVIEW_QUESTION_BANK_AND_SKILL_TAXONOMY.md`, `docs/18_FIRST_30_DAY_INTERVIEW_SPRINT.md`, `seed-data/interview-skills-catalog.json`, `seed-data/grind75-track.json`, `seed-data/interview-question-bank-seed.json`, and migration `0006_question_bank_and_sprint_plans.sql`.

Before changing code:
1. Inspect the actual repository, current implementation status, applied Supabase migrations, existing DSA records and existing study planner.
2. Identify which new requirements are already implemented and which are missing.
3. Do not overwrite the user's code, data, notes, course progress, DSA attempts or `docs/IMPLEMENTATION_STATUS.md`.
4. Do not rerun or edit migrations already applied. Create a new forward-only migration if the existing schema differs from the documented migration.
5. Present a concise migration/implementation plan with exact files and risks. Wait for approval before code changes.

After approval, implement the missing requirements incrementally:
- Add a dedicated Interview Questions page with browse-by-skill and browse-by-topic views.
- Cover every confirmed resume skill in the skill taxonomy; show coverage gaps honestly.
- Keep technical question bank records separate from DSA problems and from questions asked inside mock-interview sessions.
- Add Grind 75 as a dedicated DSA collection, deduplicating against existing problem history by canonical URL/slug.
- Add the capacity-aware 30-day sprint preview, linked DSA and skill-bank tasks, acceptance step and Day 31+ priority continuation.
- Preserve existing data and use the new migration only after validating the actual schema state.

Do not claim the full Grind 75 list or question bank is loaded until verified records exist. Do not fabricate questions, company-attribution claims or problem progress. Run tests, typecheck, lint, production build and browser QA. Update implementation status with actual results.
