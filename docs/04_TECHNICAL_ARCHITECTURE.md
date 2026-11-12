# 4. Technical Architecture

## 4.1 Architecture decision

Use a single Next.js application with Supabase as a managed backend platform. The goal is to avoid maintaining separate frontend/backend deployments or infrastructure.

### Stack
- Next.js App Router with React and TypeScript.
- Tailwind CSS and shadcn/ui for UI primitives.
- Supabase PostgreSQL for data.
- Supabase Auth for owner identity.
- Supabase Storage only for private resume files in Phase 3.
- Zod for validating form inputs and server boundaries.
- Vercel for hosting.
- OpenRouter for optional LLM access in Phase 4.
- Vitest or the current ecosystem's compatible unit test runner; Playwright for essential end-to-end flows if lightweight setup is practical.

Use stable versions compatible with each other at setup time. Do not pin outdated versions from this document; record the selected versions in `package.json` and `docs/IMPLEMENTATION_STATUS.md`.

## 4.2 High-level component map

```text
Browser
  |
  v
Next.js App Router
  |-- Server Components (read and render)
  |-- Client Components (interactive state only)
  |-- Server Actions / Route Handlers (validated mutations)
  |-- Domain services (revision rules, progress calculations, recommendations)
  |-- Supabase server client (session-aware)
  |-- AI provider service (Phase 4 only)
  |
  v
Supabase
  |-- Auth
  |-- PostgreSQL + RLS
  |-- Private Storage (Phase 3 resumes)

Vercel hosts the Next.js application.
OpenRouter is called only from a server-side route/action in Phase 4.
```

## 4.3 Suggested project structure

```text
careeros/
├── .agents/
│   └── skills/
├── app/
│   ├── (auth)/login/
│   ├── (app)/dashboard/
│   ├── (app)/dsa/
│   ├── (app)/learning/
│   ├── (app)/planner/
│   ├── (app)/projects/          # Phase 3
│   ├── (app)/applications/      # Phase 3
│   ├── (app)/resume/            # Phase 3
│   └── api/                     # only when route handlers are appropriate
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── layout/
│   └── features/
├── lib/
│   ├── supabase/
│   ├── validations/
│   ├── dates/
│   └── utils/
├── features/
│   ├── profile/
│   ├── dashboard/
│   ├── dsa/
│   ├── learning/
│   ├── planner/
│   ├── projects/                # Phase 3
│   ├── applications/            # Phase 3
│   ├── resume/                  # Phase 3
│   └── ai/                      # Phase 4
├── supabase/
│   └── migrations/
├── seed-data/
├── docs/
└── tests/
```

Do not create every folder empty at bootstrap. Add folders when the phase needs them. Keep feature code cohesive; avoid abstractions with only one trivial use.

## 4.4 Data access conventions

- Use a session-aware Supabase client on the server for protected data.
- Never expose the Supabase service-role key to browser code.
- Prefer server components for initial data reads and server actions/route handlers for writes.
- For client-side queries, use only the anon/publishable key and rely on RLS.
- Validate IDs, enums/status values, dates and user inputs at the server boundary.
- Return a small typed success/error result. Do not leak raw SQL errors or secrets to the user.
- Revalidate the relevant route/cache after a successful mutation.
- Do not mix Supabase calls directly into large presentational components; put data access in a feature service or repository file when the logic warrants it.

## 4.5 Domain logic boundaries

Keep deterministic logic in testable pure functions:
- `calculateCourseProgress(modules)`.
- `getNextRevisionDate(solvedAt, interval, timezone)`.
- `getDueRevisions(asOfDate)`.
- `buildDailyPlan(availableMinutes, candidateTasks)`.
- `calculateApplicationFunnel(applications)`.

AI must not own arithmetic, validation, authorization, CRUD, due-date calculation or status transitions.

## 4.6 Time and date handling

- Persist timestamps in UTC (`timestamptz`).
- Store the user's IANA timezone in profile settings; default to `Asia/Kolkata` based on current user context, editable in Settings.
- Date-only fields (planned date, application date, target date) should use PostgreSQL `date` where time-of-day is not meaningful.
- Display dates in the user's configured timezone.
- Do not use browser-local timezone assumptions in server-side revision calculations.

## 4.7 Error and observability approach

For MVP, use structured server logs and user-facing toast/error states. Do not add a paid observability platform initially. Log identifiers and operation names, not resume contents, tokens, or full private notes. Add an error reporting service only if real usage warrants it.

## 4.8 Architecture decisions

- Modular monolith over microservices.
- Supabase-managed PostgreSQL/Auth over custom backend.
- No pgvector in initial versions; there is no retrieval workload that requires it yet.
- No vector/RAG pipeline for a single-user MVP. Phase 4 can use bounded profile context passed directly to the model.
- No background job system initially; user-triggered tasks and local date calculations are enough.
