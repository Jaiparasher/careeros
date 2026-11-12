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

## 9.6 Dashboard v2

Live cards:
- Today's planned minutes vs completed minutes.
- DSA question counts by status and difficulty.
- Due/overdue revisions.
- Course progress and modules in progress/not started.
- Weak or unassessed high-priority topics.
- “Today's Focus” with no more than three recommended next actions.

All metrics must be derived from stored records. Include tooltips or labels explaining calculation where ambiguous.

## 9.7 CSV import/export

DSA import columns in `templates/dsa_questions_import.csv`. Validate per row; don't invent missing values. Export all active and archived records on request.

## Exit criteria

- [ ] DSA question CRUD and filters work with real Supabase data.
- [ ] Multiple attempts are retained.
- [ ] Revision create/complete/reschedule flow works and is tested.
- [ ] Course module percentages persist and recompute aggregate.
- [ ] Topic readiness is separate from course progress.
- [ ] Daily tasks persist, complete and reschedule.
- [ ] Suggested plan respects available-minute cap.
- [ ] Dashboard values are derived, not hardcoded.
- [ ] CSV import previews rows and reports errors/duplicates.
- [ ] All important flows pass browser checks on desktop and mobile.
