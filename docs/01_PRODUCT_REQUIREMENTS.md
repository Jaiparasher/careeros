# 1. Product Requirements Document (PRD)

## 1.1 Product summary

CareerOS is a personal career-preparation workspace for a software engineer moving from a services-company engineering role toward a Java backend, full-stack or SDE-I role at a product company or high-growth technology company. It consolidates learning history, DSA practice, revision, daily planning, project stories, interview preparation and job applications.

It is not intended to become a public SaaS product during the initial build. It is a single-user application with a codebase that can be extended later if real usage justifies it.

## 1.2 Problem statement

The user already has meaningful preparation and professional experience, but the information is spread across a DSA playlist, solved-problem history, a structured Spring Boot course, personal notes, an unfinished practical project, resume files and job applications. A generic beginner roadmap would waste time by repeating completed learning. A generic task tracker would fail to distinguish course completion from actual interview readiness.

CareerOS must create one trustworthy baseline, reveal gaps relevant to target roles, help the user decide what to do next, and record evidence of progress.

## 1.3 Product goals

1. Establish an accurate, editable profile and learning baseline from supplied data.
2. Make daily DSA practice and spaced revision easy to record.
3. Preserve exact progress across the 20 Coding Shuttle modules.
4. Turn incomplete or weak areas into manageable study tasks.
5. Track projects and applications without spreadsheet overhead.
6. Add AI assistance only after core data and workflows work reliably.
7. Minimize build and maintenance time so the user spends most of their time preparing and applying.

## 1.4 Success measures

Product usage measures:
- User can complete a daily study update in approximately 2 minutes.
- DSA question, attempt and revision history persists across sessions.
- Course module status and progress values match supplied baseline.
- Dashboard highlights overdue revision and today's unfinished tasks.
- Job applications can be added or advanced through a pipeline in under a minute.

Career-preparation measures (tracked, not promised by the app):
- DSA questions solved and revised by pattern and difficulty.
- Topics with recent assessment evidence.
- Mock-interview performance trends by category.
- Applications, interview conversion and outcomes.
- Number of actionable weak areas closed.

Do not create vanity metrics that cannot be tied to user-entered evidence.

## 1.5 Primary user and permissions

Initial user: one owner. All records are private to the authenticated owner. There is no public directory, team, organization, shared workspace, admin console or public registration product flow.

Use Supabase Auth for a secure owner session. RLS must restrict rows to `auth.uid()`. Do not rely only on hiding UI routes.

## 1.6 Functional scope

### P0 - first usable release
- Owner authentication and profile setup.
- App navigation and responsive dashboard.
- Existing learning baseline import.
- DSA question CRUD, attempts, tags, status and revision schedule.
- Course-module tracker with exact module progress.
- Topic roadmap with confidence/readiness separated from completion.
- Daily study tasks and simple weekly view.

### P1 - after the first usable release
- Project tracker for the existing AI-powered builder project.
- Job application pipeline and follow-up dates.
- Resume upload/metadata and job-description comparison workflow.
- Basic application analytics.

### P2 - AI assistance
- Text-based technical mock interviews.
- Answer feedback and suggested ideal answer.
- JD-to-profile comparison.
- Study recommendations grounded in stored user context.

### Later / optional
- Voice mock interviews.
- External job-board ingestion.
- Calendar integration.
- Browser extension.
- Public multi-user SaaS.
- Automatic LeetCode synchronization (only if supported and compliant with provider terms).

## 1.7 Non-functional requirements

- Responsive desktop-first layout that works on mobile.
- Accessible semantic controls, keyboard navigation and visible focus states.
- Server-side secret handling.
- Database-level row ownership and least privilege.
- No paid AI requests without user action.
- Useful error messages; do not swallow failed saves.
- Good performance for a small personal dataset; do not prematurely optimize for scale.
- Export/import paths for user-owned data.

## 1.8 Product principles

- Baseline first: import what the user has already done.
- Evidence over labels: course completion does not equal mastery.
- Action over dashboards: metrics should lead to a next task.
- Small surface area: each page should have a clear job.
- Transparent AI: show input context, evaluation criteria and limitations.
- User control: allow manual edits and corrections.

## 1.9 Out of scope

- Replacing LeetCode or providing a proprietary code execution environment.
- Teaching every computer-science topic from scratch.
- Guaranteeing an offer, salary or interview outcome.
- Automatic resume claims unsupported by the user's source material.
- Complex agent swarms or autonomous job applications.
- Building CareerOS with the very technologies the user is trying to study (for example a Java microservice platform).
