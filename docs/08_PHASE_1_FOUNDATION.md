# 8. Phase 1 - Application Foundation

## Objective

Create the secure app shell, owner profile, first-run baseline review and a real dashboard connected to Supabase. Phase 1 establishes reliable navigation and persistence before adding detailed productivity workflows.

## 8.1 Authentication and owner access

- Use Supabase Auth with the simplest current supported email sign-in flow (magic link or password; choose one and document it).
- Initial signup should be restricted to the owner. Do not create open public registration.
- Protect all `(app)` routes on the server.
- Sign-out must clear session state.
- RLS is the final data boundary.
- Provide clear unauthenticated and expired-session behavior.

## 8.2 App shell

Implement:
- Responsive sidebar and header.
- Current section active state.
- Account menu and sign-out.
- Theme preference (light/dark); persist preference locally or in profile, but avoid complex theme infrastructure.
- Global toast/notification pattern.

MVP navigation: Dashboard, DSA Practice, Learning Roadmap, Study Planner, Settings. Later links may be feature-flagged or hidden until their phase is implemented; do not show dead links.

## 8.3 Profile and onboarding

On first login:
1. Create or fetch profile row.
2. Present a reviewable profile form prefilled from `seed-data/profile.json`.
3. Allow user to confirm or edit target roles, target compensation goal, timezone and daily available minutes.
4. Show a summary of imported learning baseline and require an explicit confirmation before seeding.
5. Seed records idempotently.

Do not make onboarding a large questionnaire. Use supplied defaults and allow later edits in Settings.

## 8.4 Baseline import

- Import course modules from `seed-data/coding-shuttle-modules.json` using stable keys.
- Save completed DSA playlist metadata and the aggregate 350+ solved count as profile/learning-source facts.
- Add the Lovable project metadata only if the project table is introduced in a later migration; otherwise retain it in seed JSON until Phase 3.
- Do not invent individual DSA question rows from the aggregate count.
- Show import summary and any skipped/duplicate rows.

## 8.5 Dashboard v1

Until the DSA/planner modules exist, display:
- Career goal summary.
- Course completion summary.
- Completed playlist and aggregate DSA history statement.
- A neutral “next setup step” card linking to the next available module.

Once Phase 2 data exists, dashboard cards become live computed summaries.

## 8.6 Settings

Allow updates to:
- Display name.
- Target roles.
- Target salary range (optional).
- Preparation horizon.
- Timezone.
- Daily available minutes.
- Theme preference.

## Implementation details

- Keep profile form validation shared between client and server where practical.
- Enforce unique profile row per `auth.users.id`.
- Use loading and error states on onboarding and settings.
- Make seeding idempotent and non-destructive. Existing module edits must survive re-login and refresh.

## Exit criteria

- [ ] Owner can sign in and sign out.
- [ ] Protected routes reject unauthenticated access.
- [ ] Profile is read/write persistent.
- [ ] First-run baseline summary is accurate.
- [ ] 20 Coding Shuttle modules seed once with exact percentages.
- [ ] Calculated course aggregate equals 40.55% rounded to two decimals.
- [ ] Refresh and a new login preserve changes.
- [ ] RLS tests/manual checks confirm another user cannot read the owner rows.
- [ ] Responsive shell and empty/loading/error states are checked.
