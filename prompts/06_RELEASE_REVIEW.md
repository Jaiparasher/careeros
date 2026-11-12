# Release Review Prompt

Review the current implementation against the documentation and release criteria. Do not add features or perform broad refactors.

1. Inspect `AGENTS.md`, `docs/IMPLEMENTATION_STATUS.md` and the relevant phase specification.
2. Run lint, typecheck, unit/integration tests and production build.
3. Verify database migrations and RLS policies. Check that no secrets are committed or exposed in browser bundles.
4. Walk through critical user journeys in the browser at desktop and mobile widths.
5. Identify fake/static data, missing error states, broken persistence, accessibility issues and unimplemented UI actions.
6. Fix only release-blocking defects within scope.
7. Produce a release report with passed/failed checks, command output summary, unresolved issues and recommendation: ready / not ready.

Do not claim a test or security check passed unless it was actually executed.
