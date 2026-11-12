---
name: feature-verification
description: Verify a CareerOS feature end to end, including persistence, RLS, validation, responsive UI, failure states and documentation.
---

# CareerOS Feature Verification Skill

For each feature under review:

1. Identify the user story and acceptance criteria in `docs/`.
2. Confirm the happy path using real persisted data.
3. Confirm invalid input is rejected on the server, not only in the UI.
4. Confirm loading, empty, error and success states.
5. Refresh and re-authenticate to confirm persistence.
6. Check ownership/RLS and ensure a different user cannot access the record (use a safe test account or policy-level verification).
7. For dates, verify timezone/day-boundary cases.
8. For destructive actions, verify confirmation and expected child-record behavior.
9. Check browser layout at desktop and mobile widths and keyboard accessibility for key controls.
10. Run the relevant test suite, lint, typecheck and production build.
11. Record actual results in `docs/IMPLEMENTATION_STATUS.md`.

Do not mark the feature complete if it uses static placeholder data where persistence is required.
