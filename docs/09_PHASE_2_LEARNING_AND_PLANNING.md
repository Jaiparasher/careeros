# 9. Phase 2 - Learning, DSA and Study Planning

## Objective

Deliver the first genuinely useful career-preparation release: DSA tracking, revision engine, course/topic tracker and daily planning. Use deterministic rules and user-controlled data. No AI dependency.

## 9.1 DSA tracker

### Question fields
- Title (required).
- URL (optional but recommended).
- Difficulty: easy, medium, hard.
- Pattern tags: one or more (e.g. sliding-window, two-pointers, graph-bfs).
- Source: LeetCode, GeeksforGeeks, playlist, other.
- Status: not_started, attempted, solved, needs_revision, archived.
- Notes / key insight.
- Optimal time complexity and space complexity.
- Created/updated timestamps.

### Attempt recording
Each attempt stores:
- Attempt date/time.
- Outcome: solved_independently, solved_with_hint, unable_to_solve, revisited.
- Duration minutes (optional).
- Hint used (boolean).
- Approach notes.
- Mistake notes.
- Complexity observed/target.
- Language (default Java, editable).

A problem may have many attempts. Do not replace history with only a latest status.

### Status behavior
- `not_started`: added but not attempted.
- `attempted`: at least one attempt, not yet independently solved.
- `solved`: user marks independently solved or explicitly sets status.
- `needs_revision`: explicitly flagged or revision outcome suggests revisit.
- `archived`: removed from active views, but history preserved.

Allow status override; do not infer mastery automatically from one attempt.

### Duplicate detection
- Exact normalized URL duplicate: block or offer to open existing record.
- Similar normalized title: warn and allow deliberate duplicate if it is a different platform/problem.
- CSV imports must show duplicate decisions before commit.

## 9.2 Revision engine

Default configurable intervals after a successful solve: 1, 3, 7, 14 and 30 days. These are suggestions, not scientific guarantees.

Behavior:
1. When a user marks a question solved, offer to create the first revision event.
2. When a revision is marked complete, offer the next interval.
3. If the user cannot solve it, mark it `needs_revision` and allow a shorter retry interval.
4. Do not silently schedule duplicates.
5. Show due today, overdue and upcoming separately.
6. Allow manual reschedule and skip with a reason.

Date calculation should use the user's profile timezone and be covered by unit tests around timezone/day boundaries.

## 9.3 Learning roadmap

Seed starter topics from `seed-data/learning-baseline.json` and allow editable custom topics.

Suggested categories:
- Core Java: OOP, collections, generics, exceptions, Java 8+, streams, JVM basics, multithreading.
- Spring: IoC/DI, Spring MVC, REST, validation, exception handling, data JPA, transactions, security, testing, production configuration.
- Backend engineering: SQL/DBMS, API design, caching, microservices, Kafka, observability, CI/CD.
- CS fundamentals: OS, networking, DBMS.
- Interview skills: LLD, HLD, behavioral and project deep dive.

Do not assume all topics are equally important. Allow role relevance priority: high, medium, low.

Each topic should separate:
- Learning/course completion.
- User confidence (1-5 or not rated).
- Assessment evidence (not assessed / needs work / progressing / strong).
- Practical evidence notes.
- Interview-ready flag (user-controlled or assessment-informed, never implied solely by course completion).
- Last and next revision dates.

## 9.4 Course tracker

- Display course and module order.
- Editable progress 0-100.
- Status can be derived from percentage (0 = not started, 1-99 = in progress, 100 = completed); status can be displayed but percentage remains canonical.
- Show notes, resource URL and last studied date.
- Recalculate average progress from modules after each update.
- Preserve exact imported module titles and initial percentages.

## 9.5 Daily planner

### Task fields
- Title.
- Category: DSA, Java, Spring Boot, CS fundamentals, system design, project, interview, job search, other.
- Planned date.
- Estimated minutes.
- Priority: low, normal, high.
- Status: pending, in_progress, completed, deferred.
- Optional linked DSA question or learning topic.
- Notes.

### Planning behavior
- User sets daily available minutes.
- User can add tasks manually.
- Provide a “suggest today's plan” action based on due revisions, incomplete high-priority topics and user-entered tasks.
- Deterministic priority order: overdue revisions, tasks explicitly marked high, due revisions, high-priority weak topics, then other planned tasks.
- Never auto-create a large schedule. Suggest no more than the configured minutes and show any omitted work.
- Allow user to accept/edit the proposed plan before tasks are saved.
- Carry forward overdue tasks through an explicit action; do not shift them silently.

## 9.6 Resume-wide interview question bank

Build the static, useful question bank in Phase 2 so the user does not need AI or paid APIs to study.

- Follow `docs/17_INTERVIEW_QUESTION_BANK_AND_SKILL_TAXONOMY.md`, `seed-data/interview-skills-catalog.json`, `seed-data/interview-question-bank-seed.json` and `prompts/08_QUESTION_BANK_SEED.md`.
- Support browse by technology/skill and by topic.
- Import/seed the initial skill inventory only after the user can review it.
- Populate starter question content for every confirmed resume skill. Aim for at least 10-12 questions per critical/high skill, 6-8 per medium skill, and 3-5 per low-priority skill. If a skill has no verified content yet, show `content pending`; never make the bank appear complete with placeholders.
- Question types: conceptual, coding, debugging, practical scenario, design, behavioral, project deep dive and SQL exercise.
- Store expected answer points, concise sample answer, follow-up prompts, source/attribution, difficulty, priority and target-role tags.
- The user can attempt an answer, reveal answer points, add notes, set status/confidence and schedule revision.
- Add combined filtering/search and a skill coverage map.
- Static bank must work with AI disabled. AI answer scoring and new question generation are Phase 4 only.

### Grind 75 collection
- Add the official Grind 75 Core 75 as a dedicated collection within DSA Practice, using `seed-data/grind75-track.json` as collection metadata.
- Source: https://www.techinterviewhandbook.org/grind75/ . Preserve imported official order, title, difficulty, topic tags, canonical LeetCode URL and import snapshot date.
- The official list is dynamic/customizable. Do not hardcode counts as permanent or invent problem entries. If verified import is not possible, provide official link + CSV import and clearly show the collection as not imported.
- Store collection metadata on existing DSA problems or link collection membership to existing problems after deduplication; never create a second record for a problem already tracked.
- The aggregate 350+ solved statement does not mark exact Grind 75 items as completed.

## 9.7 30-day interview sprint and planner

- Implement the plan described in `docs/18_FIRST_30_DAY_INTERVIEW_SPRINT.md`.
- Ask for sprint start date, target role focus and available daily minutes before generating.
- Include Grind 75 tasks and daily technology/topic-based question-bank tasks. Include review checkpoints and project/behavioral practice.
- Generate a preview, compute total workload from estimated question times, warn if it exceeds available capacity, and obtain acceptance before task creation.
- Offer 30-day intensive, 45-day and 60-day capacity-adjusted plans. Do not silently schedule beyond available minutes.
- Do not assume every question in the full skill bank can be completed in 30 days. The sprint is a prioritized coverage pass; the full library remains available for continued preparation.
- At Day 30, reassess skills and switch to rolling priority-based planning for Day 31+.

## 9.8 Dashboard v2

Live cards:
- Today's planned minutes vs completed minutes.
- DSA question counts by status and difficulty.
- Due/overdue revisions.
- Course progress and modules in progress/not started.
- Weak or unassessed high-priority topics.
- “Today's Focus” with no more than three recommended next actions.

All metrics must be derived from stored records. Include tooltips or labels explaining calculation where ambiguous.

## 9.9 CSV import/export

DSA import columns in `templates/dsa_questions_import.csv` and technical interview question columns in `templates/interview_questions_import.csv`. Validate per row; do not invent missing values. Preview duplicates before commit. Export all active and archived records on request.

## 9.10 Exit criteria

- [ ] DSA question CRUD and filters work with real Supabase data.
- [ ] Multiple attempts are retained.
- [ ] Revision create/complete/reschedule flow works and is tested.
- [ ] Course module percentages persist and recompute aggregate.
- [ ] Topic readiness is separate from course progress.
- [ ] Daily tasks persist, complete and reschedule.
- [ ] Suggested plan respects available-minute cap.
- [ ] Dashboard values are derived, not hardcoded.
- [ ] CSV import previews rows and reports errors/duplicates.
- [ ] Interview question bank can browse by skill and topic and has non-empty starter content.
- [ ] User can record answer notes/status/confidence and schedule question revision.
- [ ] Grind 75 collection has official attribution, verified import state, source links and duplicate linking.
- [ ] 30-day sprint preview contains DSA and skill-based tasks, checks workload capacity and requires acceptance.
- [ ] Day 31+ priority continuation explains its ranking reasons.
- [ ] All important flows pass browser checks on desktop and mobile.
