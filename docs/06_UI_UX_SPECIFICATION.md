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
5. Settings

Add after Phase 3:
6. Projects
7. Job Applications
8. Resume

Add after Phase 4:
9. Interview Coach

## 6.5 Dashboard layout

Top row:
- Greeting and current date.
- Editable study-time target or progress summary.

Main content:
- Today's Focus: no more than 3 suggested priorities, with one clear action each.
- Today's Tasks: completion checklist and remaining estimated minutes.
- DSA Snapshot: total tracked questions, solved, needs revision, overdue.
- Learning Snapshot: course progress, topics requiring assessment, incomplete high-priority modules.
- Upcoming Revisions: next few due items.
- Career Pipeline summary appears only after Phase 3 data exists.

Do not show fake placeholder metrics. If there is no data, show a short empty state and an action to add/import data.

## 6.6 DSA Practice pages

List view:
- Search by title.
- Filters: pattern, difficulty, status, revision due, source.
- Columns: problem, difficulty, patterns, status, last attempted, next revision.
- Quick actions: record attempt, mark solved, schedule revision.

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

## 6.8 Study Planner pages

- Daily agenda with task title, category, estimated minutes, priority and status.
- Week view with lightweight day columns or list grouping.
- Quick add task.
- Carry-forward/reschedule action for incomplete tasks.
- Show planned vs completed minutes.
- Never generate more estimated task minutes than available study minutes without explicitly showing an over-capacity warning.

## 6.9 Phase 3 pages

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

## 6.10 Phase 4 AI pages

Interview Coach:
- Pick topic, difficulty and session duration.
- Ask one question at a time.
- Show answer box and submit action.
- After evaluation, show score, what was good, gaps, improved answer and next follow-up.
- Keep the model/provider metadata and prompt version available in the session record.
- Label AI evaluation as feedback, not an objective hiring prediction.

## 6.11 Interaction states

Every data page must include:
- Initial loading or skeleton state.
- Empty state with a relevant next step.
- Validation error feedback.
- Server/network error feedback and retry where appropriate.
- Success confirmation for save/update/delete.
- Confirmation before destructive actions.
- Disabled/loading state during mutations to prevent duplicate submissions.

## 6.12 Accessibility

- Semantic heading order.
- Inputs have visible labels and accessible errors.
- Buttons have action-oriented names.
- Keyboard accessible menus, dialogs, tabs and kanban alternatives.
- Do not rely on drag-and-drop as the only way to change application stage; provide a select/action menu too.
