# 14. Backlog and Product Decision Log

## 14.1 Explicitly deferred backlog

Do not implement these until the core product is stable and the user explicitly sees value:
- Voice-based mock interviews.
- Automatic job search scraping or applying.
- External calendar sync.
- LeetCode account synchronization.
- Code execution sandbox.
- Multi-user accounts, teams and billing.
- Mobile native application.
- Push notifications.
- RAG/vector search over all learning notes.
- Redis, Kafka, queues, cron workers or microservices.
- Custom Java/Spring Boot backend.

## 14.2 Day 31+ preparation behavior

After the initial 30-day sprint, the planner should generate rolling 7-day schedules and an ordered backlog. Start from the weighted priority rule in `docs/18_FIRST_30_DAY_INTERVIEW_SPRINT.md`: target-role/JD relevance 30%, demonstrated gap 25%, resume/role importance 20%, due revision 15%, user preference/upcoming interview 10%. Show the reason for every recommendation and allow the user to edit weights. Do not auto-create an endless daily schedule; preview and accept each new plan.

## 14.3 Recommended future enhancements (optional)

- Interview round history per application.
- Export a weekly progress report.
- Generate a project deep-dive sheet for interviews.
- Store links to curated company-specific interview experiences.
- Add a calendar file export (ICS) rather than a full calendar integration.
- Add a lightweight “interview in N days” prep mode.

## 14.4 Decision log

| Decision | Choice | Reason | Revisit when |
|---|---|---|---|
| Architecture | Next.js modular monolith | Lowest maintenance for vibe coding | Proven scaling or clear separation need |
| Backend | Next.js server actions/routes | Avoid separate service | External API or workload requires it |
| Database/Auth | Supabase | Managed Postgres/Auth/RLS | Pricing or requirements change |
| Styling | Tailwind + shadcn/ui | Fast, consistent UI | Accessibility/design issue requires alternative |
| AI provider | Google Gemini via AI Studio API key, Phase 4 only | Configurable model, optional usage | Model availability and pricing may change |
| Initial user count | One owner | Personal utility first | User explicitly wants SaaS |
| Vector DB | None | No genuine retrieval need in MVP | Large searchable knowledge corpus exists |
| Interview bank | Static seeded catalog + per-user progress | Useful without AI, supports every resume skill | Real scale or shared product needs justify a content service |
| 30-day plan | Deterministic, capacity-aware template | Predictable and inspectable; no AI cost | User data demonstrates need for adaptive ranking |
| Deployment | Vercel + Supabase | Minimal operations | Hosting limits or cost justify move |

## 14.5 Risks and mitigations

- **Scope creep:** Keep P0 list fixed; put ideas in this backlog.
- **AI-generated incorrect advice:** Ground feedback in supplied data; label uncertainty; preserve user control.
- **False mastery signal:** Separate course completion, confidence, assessment evidence and interview readiness.
- **Lost learning history:** Idempotent seeding, backups/export, migration history.
- **Unexpected API costs:** User-triggered AI only, bounded prompts and usage limits.
- **Sensitive resume leakage:** Private storage and explicit consent for AI analysis.
- **Vibe-coding regressions:** Small phases, tests and browser verification.

## 14.6 Implementation status template

Create `docs/IMPLEMENTATION_STATUS.md` when Phase 0 starts with:

```md
# Implementation Status

## Current phase
- Phase: 0
- Status: not_started | in_progress | blocked | complete

## Completed
- ...

## Verification performed
- Commands:
- Browser checks:
- Database/RLS checks:

## Known issues / deferred items
- ...

## Decisions made
- ...

## Next phase
- ...
```
