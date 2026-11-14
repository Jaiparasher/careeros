# CareerOS

CareerOS is a lightweight, single-owner personal job-switch preparation workspace built for software engineers targeting Java backend, full-stack, or SDE-I roles.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend & Auth:** Supabase (PostgreSQL with Row Level Security, Auth SSR)
- **Validation:** Zod
- **Testing:** Vitest
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js >= 20.x (Recommended: v20+ / v24.x)
- npm >= 10.x
- A Supabase account and project

### 1. Environment Setup

Copy `.env.example` to `.env.local` and provide your Supabase project credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Create optimized production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint check
- `npm run typecheck`: Run TypeScript compiler check without emitting files
- `npm test`: Run Vitest unit & smoke tests

## Database Migrations

Database migrations are located in `supabase/migrations/`:
1. `0001_profiles_and_learning_modules.sql`: Profile and baseline module structure.
2. `0002_dsa_topics_and_planner.sql`: DSA questions, attempts, revision schedules, and planner.
3. `0003_projects_and_applications.sql`: Projects and job applications tracker.
4. `0004_resumes_and_storage.sql`: Resume metadata and storage bucket policies.
5. `0005_interview_tables.sql`: Mock interview sessions and questions.
6. `0006_question_bank_and_sprint_plans.sql`: Resume-wide question bank, Grind 75 tags, and study sprint plans.

Migrations must be run in numeric order via the Supabase Dashboard SQL Editor or Supabase CLI.

## Current Status

See [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for the active phase and progress checklist.
