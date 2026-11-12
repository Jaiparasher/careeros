# 15. Using This Pack with Google Antigravity

This pack uses Antigravity's filesystem-based project instructions and skills.

## Workspace setup

Keep `AGENTS.md` at the repository root. Keep project-specific skills in `.agents/skills/<skill-name>/SKILL.md`. These should be committed to Git so the project instructions travel with the repository.

## How to work

- Start from `prompts/00_KICKOFF.md` and request a plan before code changes.
- After review, use the corresponding phase prompt.
- Use `/phase-implementation` when you want the agent to follow the implementation skill.
- Use `/feature-verification` when a feature is implemented and needs an acceptance review.
- Use `prompts/06_RELEASE_REVIEW.md` before calling a phase release-ready.

## Avoid relying on legacy Workflows

Antigravity documentation currently describes Skills as reusable multi-step procedures and Rules/AGENTS.md as persistent project constraints. The older Workflows feature is being deprecated/migrated in current documentation. This pack therefore uses `AGENTS.md` plus Skills rather than depending on legacy workflow files.

## Official documentation

- Rules and project instruction discovery: https://antigravity.google/docs/rules/
- Agent Skills: https://antigravity.google/docs/skills/
- Customization discovery: https://antigravity.google/docs/customization-discovery/
- Getting started: https://antigravity.google/docs/getting-started/

Antigravity UI and commands can change. If the UI differs, follow the current official docs while preserving the repository file layout and project constraints in this pack.
