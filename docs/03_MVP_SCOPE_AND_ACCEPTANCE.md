# 3. MVP Scope and Acceptance Criteria

## 3.1 MVP boundary

The first release must do four things well:
1. Show a trustworthy personal dashboard.
2. Track DSA questions, attempts and revisions.
3. Preserve learning/course progress and topic confidence.
4. Turn a small available-time budget into a daily task list.

Do not implement job CRM, resume AI, voice, automatic job scraping, or advanced AI during this first release.

## 3.2 MVP user stories

### Identity and profile
- As the owner, I can sign in securely and see only my records.
- I can review and edit my career goal and study availability.
- I can inspect the imported learning baseline before it becomes my source of truth.

### Dashboard
- I can see today's tasks, overdue DSA revisions, overall DSA counts and course progress.
- I can quickly add a DSA question or a study task from the dashboard.
- Empty states explain how to begin instead of showing fake statistics.

### DSA
- I can create, edit, archive and search a question.
- I can assign a problem name, URL, difficulty, one or more patterns, source, notes and current status.
- I can record multiple attempts for the same question.
- I can schedule a revision after solving or flag a problem for review.
- Due revisions are visible and can be completed/rescheduled.

### Learning tracker
- All 20 supplied Coding Shuttle modules appear in the right order with exact percentages.
- I can update module completion and add notes/resources.
- Course completion percentage is calculated from module percentages; it is not manually hardcoded.
- A separate self-confidence and assessment state prevents course completion from being mistaken for mastery.

### Planner
- I can add tasks, choose date, duration, category and priority, and mark tasks done.
- Incomplete tasks remain visible and can be rescheduled; they are not silently deleted.
- I can see a simple week view and daily completion ratio.
- Initial recommendations use deterministic rules, not AI calls.

## 3.3 Acceptance checklist

### Global
- [ ] App starts locally from documented commands.
- [ ] Production build succeeds.
- [ ] No TypeScript errors or lint errors.
- [ ] All user-specific database tables have RLS policies.
- [ ] Refreshing a page does not lose saved changes.
- [ ] Loading, empty and error states exist for main pages.
- [ ] Desktop and mobile layouts are checked.
- [ ] No secrets are present in source control.

### Baseline
- [ ] User profile is prefilled with supplied details.
- [ ] DSA playlist is marked completed, with the correct URL.
- [ ] 350+ solved is stored as an aggregate user-reported count only.
- [ ] All 20 course modules are imported with the exact percentages.
- [ ] Aggregate completion displays 40.55% (subject to rounding).
- [ ] Lovable project is `in_progress`.

### DSA
- [ ] CRUD works.
- [ ] Multiple attempts per question work.
- [ ] Revision due dates are derived from the configured interval rules.
- [ ] Filters and search work together.
- [ ] CSV import validates rows and reports rejected rows.
- [ ] Duplicate prevention warns on normalized name or URL matches.

### Learning and planner
- [ ] Course percentage recalculates after editing a module.
- [ ] User can distinguish `course_complete` from `interview_ready`.
- [ ] Planner supports task creation, editing, completion and rescheduling.
- [ ] Time budget does not create more tasks than available minutes.

## 3.4 Release gate

The MVP is releasable only when the above critical items are checked. A beautiful UI populated with static mock data does not pass. If an item is deferred, mark it explicitly in `docs/IMPLEMENTATION_STATUS.md` rather than representing it as complete.

## 3.5 Priority labels

- P0: blocks initial usable release.
- P1: useful after first release.
- P2: AI / optional.
- Deferred: explicitly excluded unless user asks later.
