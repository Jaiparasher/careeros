# 6. UI/UX Specification

## 6.1 Product feel

A calm, high-signal developer productivity tool. Visual references: Linear, Notion and Raycast. Use these as inspiration, not as a pixel-copy. The interface should feel light and fast, with restrained color and no dashboard clutter.

## 6.2 Design principles

- Clear hierarchy and generous whitespace.
- One primary action per view.
- Neutral surfaces; use accent colors for state, not decoration.
- Avoid giant hero graphics, unnecessary gradients and excessive animations.
- Tables for dense editable data; cards for summaries; a kanban board for applications.
- Use accessible contrast and visible keyboard focus.
- Provide labels and text in addition to color for every status.
- Support dark and light themes if it does not delay MVP; light theme can be default.

## 6.3 App shell

Desktop:
- Left collapsible sidebar, width around 240px expanded.
- Main content with max width appropriate to page density.
- Header includes page title, breadcrumbs only when useful, quick-create action and account menu.

Mobile:
- Sidebar becomes sheet/drawer or bottom navigation for the top-level destinations.
- Tables become compact list rows or horizontally scrollable with clear affordance.
- Forms use full-width controls and avoid multi-column cramped layouts.

## 6.4 Navigation

MVP navigation:
1. Dashboard
2. DSA Practice
3. Learning Roadmap
4. Study Planner
5. Interview Questions
6. Settings

Add after Phase 3:
7. Projects
8. Job Applications
9. Resume

Add after Phase 4:
10. Interview Coach

## 6.5 Dashboard layout

Top row:
- Greeting and current date.
- Editable study-time target or progress summary.

Main content:
- Today's Focus: no more than 3 suggested priorities, with one clear action each.
- Today's Tasks: completion checklist and remaining estimated minutes.
- DSA Snapshot: total tracked questions, Grind 75 completed/imported count, solved, needs revision, overdue.
- Interview Question Snapshot: attempted/strong/due counts grouped by top skills.
- Sprint Snapshot: current day, completion, planned versus available minutes and upcoming checkpoint.
- Learning Snapshot: course progress, topics requiring assessment, incomplete high-priority modules.
- Upcoming Revisions: next few due items.
- Career Pipeline summary appears only after Phase 3 data exists.

Do not show fake placeholder metrics. If there is no data, show a short empty state and an action to add/import data.

## 6.6 DSA Practice pages

List view:
- Search by title.
- Filters: collection (including Grind 75), pattern, difficulty, status, revision due, source.
- Columns: problem, collection/order, difficulty, patterns, status, last attempted, next revision.
- Show Grind 75 Core 75 progress and official source/import status.
- Quick actions: record attempt, mark solved, schedule revision.
- When a Grind 75 problem matches an existing DSA record by canonical URL/slug, attach the collection tag to the existing record rather than adding a duplicate.

Question detail/edit:
- Problem title and URL.
- Difficulty and pattern tags.
- Current status.
- Notes / approach.
- Complexity fields.
- Attempt history timeline.
- Revision history and next due date.

Use a modal/sheet for quick entry and a dedicated detail page for long notes. Preserve unsaved form state when validation fails.

## 6.7 Learning Roadmap pages

- Course section with module number, title, editable progress bar/percentage, and notes.
- Course header with calculated aggregate completion.
- Topic section grouped by category.
- Show independent badges/fields for course completion, self-confidence, assessment state and interview readiness.
- Provide a filter for `not assessed`, `needs work`, `in progress` and `ready`.

## 6.8 Interview Questions page

- Provide two browse modes: `By Skill` and `By Topic`.
- Skill hierarchy follows `seed-data/interview-skills-catalog.json` (e.g. Java → Collections → HashMap; React → Hooks; SQL → Joins).
- Topic browse groups across technologies (e.g. security, performance, debugging, API design, concurrency, system design, behavioral, project deep dive).
- Filters: technology/skill, topic, question type, difficulty, priority, target role, status, confidence and revision due.
- Each row/card shows skill, topic, question, difficulty, priority and progress status.
- Detail view includes question prompt, answer input/notes, revealable expected answer points, sample answer, follow-ups and source link.
- Include counts for total, not started, attempted, strong and due for revision.
- Keep DSA coding questions and Grind 75 inside DSA Practice; do not mix Grind 75 with conceptual questions.
- Show skill coverage status so the user can identify technologies with insufficient question content.

## 6.9 Study Planner pages

- Daily agenda with task title, category, estimated minutes, priority and status.
- Week view with lightweight day columns or list grouping.
- Quick add task.
- Carry-forward/reschedule action for incomplete tasks.
- Show planned vs completed minutes.
- Never generate more estimated task minutes than available study minutes without explicitly showing an over-capacity warning.

Study Planner additions:
- Add a `30-Day Interview Sprint` setup card showing start date, target role, daily minutes and Grind 75 target.
- Show a preview calendar/list before creating tasks.
- Show estimated total workload and whether it fits available minutes.
- Offer capacity-adjusted 45-/60-day alternatives when necessary.
- Show day number, daily focus, linked DSA questions, linked skill-bank questions and review block.
- After Day 30, replace the fixed sprint with a rolling priority plan and an editable backlog.

## 6.10 Phase 3 pages

Projects:
- Project overview, technologies, status, narrative, links.
- Features grouped into Planned / In Progress / Done / Blocked.
- Distinguish `used_in_project` from `studied` and `confident` technology tags.

Job Applications:
- Kanban stages exactly as specified in the career-management phase.
- Cards show company, title, application date, next follow-up and stage.
- Detail view holds job description, notes, referral information and round history.
- Filters by stage, company and follow-up date.

Resume:
- Upload a file to private storage.
- Show uploaded file name/date and delete action.
- Ask user before sending resume text to an AI provider.

## 6.11 Phase 4 AI pages

Interview Coach:
- Pick topic, difficulty and session duration.
- Ask one question at a time.
- Show answer box and submit action.
- After evaluation, show score, what was good, gaps, improved answer and next follow-up.
- Keep the model/provider metadata and prompt version available in the session record.
- Label AI evaluation as feedback, not an objective hiring prediction.

## 6.12 Interaction states

Every data page must include:
- Initial loading or skeleton state.
- Empty state with a relevant next step.
- Validation error feedback.
- Server/network error feedback and retry where appropriate.
- Success confirmation for save/update/delete.
- Confirmation before destructive actions.
- Disabled/loading state during mutations to prevent duplicate submissions.

## 6.13 Accessibility

- Semantic heading order.
- Inputs have visible labels and accessible errors.
- Buttons have action-oriented names.
- Keyboard accessible menus, dialogs, tabs and kanban alternatives.
- Do not rely on drag-and-drop as the only way to change application stage; provide a select/action menu too.
