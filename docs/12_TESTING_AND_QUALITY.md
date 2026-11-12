# 12. Testing and Quality Strategy

## 12.1 Quality principle

Test the user journey, not just component rendering. A feature is not complete until persistence, permissions, date behavior and error states are verified.

## 12.2 Test layers

### Unit tests
Use for pure deterministic functions:
- Course progress mean and rounding.
- Revision interval calculation.
- Timezone/day-boundary behavior.
- Daily plan duration cap and prioritization.
- Application stage/status validation.
- CSV row normalization and validation.
- AI response schema validation (Phase 4).

### Integration tests
Where practical, test:
- Supabase queries and ownership behavior against a local/test project.
- Server actions with valid and invalid payloads.
- Seed idempotency.
- Revision creation without duplicates.
- File authorization policies.

### End-to-end smoke tests
At minimum:
1. Sign in.
2. Review imported baseline.
3. Open dashboard.
4. Create a DSA question.
5. Record an attempt.
6. Schedule and complete a revision.
7. Edit one course module percentage and verify aggregate recalculates.
8. Create and complete a study task.
9. Refresh and verify persistence.
10. Sign out and verify protected routes are unavailable.

Add Phase 3 job/project/resume journeys and Phase 4 mock-interview journeys when those features exist.

## 12.3 Manual QA checklist per page

- Responsive at desktop and mobile widths.
- Keyboard focus and dialog close behavior.
- Form labels, validation and server error presentation.
- Loading, no-data and network error states.
- Duplicate submission prevention.
- Confirmations for destructive actions.
- No fake metrics or stale cached summaries.
- RLS ownership confirmed.

## 12.4 Commands

Document actual scripts in README. Expected categories:
- `dev`
- `lint`
- `typecheck`
- `test`
- `build`
- optional `test:e2e`

Run relevant scripts after each implementation batch and all checks before phase completion. Report skipped commands and why.

## 12.5 Browser verification

Use Antigravity's browser capabilities when available to inspect the implemented page. Capture or describe:
- Main desktop layout.
- Mobile layout.
- Main happy path.
- At least one validation/error state.

Fix serious overflow, clipped content, inaccessible controls and inconsistent styles. Do not over-polish animations before core flows work.

## 12.6 Regression protection

- Keep migrations additive and versioned.
- Add tests for bugs that have previously occurred.
- Avoid broad refactors during a feature phase.
- Update docs after schema or behavior changes.
