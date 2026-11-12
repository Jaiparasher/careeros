---
name: phase-implementation
description: Implement one CareerOS phase at a time from the phase specification, preserving the minimal stack, data baseline, acceptance criteria and working state.
---

# CareerOS Phase Implementation Skill

1. Read root `AGENTS.md`, the matching phase document and referenced architecture/data/UI documents.
2. Inspect the repository and current implementation status before editing.
3. Confirm the phase boundary and list concrete deliverables. Do not implement later phases.
4. Inspect existing migrations and code before creating or replacing files.
5. Implement the smallest end-to-end vertical slice first, using real persistence for features declared complete.
6. Validate inputs at server boundaries; enforce ownership with RLS.
7. Keep deterministic business logic separate and unit-testable.
8. Keep secrets server-side and avoid unnecessary dependencies or infrastructure.
9. Run relevant tests, lint, typecheck and build. Browser-check affected user journeys when UI changes.
10. Update `docs/IMPLEMENTATION_STATUS.md` with completed work, verification, known issues and next step.
11. Report what is complete, what is not, and commands actually executed.

Never fabricate personal profile facts or mark course completion as mastery. Never silently change supplied seed data.
