# 11. Phase 4 - AI Career Assistant and Mock Interviews

## Objective

Add carefully scoped AI features after the underlying profile, learning history and career records are reliable. AI is an optional assistant, not the system of record.

## 11.1 Database prerequisite

Apply `supabase/migrations/0005_interview_tables.sql` when starting Phase 4. It adds interview sessions and per-question evaluation records.

## 11.2 Provider integration

- Use OpenRouter through a server-only provider module.
- Keep provider/model configurable through environment variables.
- Never call OpenRouter from client-side code.
- Store `OPENROUTER_API_KEY` only in Vercel/server environment settings and local ignored `.env.local`.
- Use a model selection configuration, but do not hardcode a model that may be retired. Record selected model and provider response metadata per session.
- Add request timeout, output length limits, basic rate limiting and friendly error handling.
- Do not add a vector database or RAG pipeline initially. Use concise, user-approved context assembled from the database.

## 11.3 User-triggered AI use cases

P2-A: Technical mock interview
- Select topic/category, difficulty and duration.
- Start a session with one question at a time.
- User submits answer.
- AI evaluates answer against a rubric and asks one relevant follow-up or ends the question.
- Store question, answer, feedback, model and prompt version.

P2-B: Answer evaluation rubric
Score separately (e.g. 1-5) for:
- Technical correctness.
- Completeness.
- Clarity/structure.
- Practical depth/examples.
- Trade-off awareness where relevant.

Return:
- What was correct.
- Missing or incorrect points.
- A concise improved answer.
- One suggested follow-up question.
- Confidence/uncertainty notes when evaluation depends on assumptions.

Do not present score as a hiring probability or objective industry certification.

P2-C: Personalized study recommendation
- Input: due revisions, weak/unassessed topics, incomplete modules, daily available minutes and target role.
- Output: at most three actions with reasons and estimated time.
- Deterministic planner remains responsible for time/date calculations and scheduling. AI may rank/explain candidates; user must accept before tasks are created.

P2-D: Job description comparison
- User explicitly submits a JD and chooses a resume/profile version.
- Compare required skills with verified profile evidence.
- Categorize: direct evidence, adjacent evidence, gap, unclear.
- Suggest truthful resume wording only where evidence exists.
- Never invent experience, technologies, metrics or seniority.

## 11.4 Prompt/context design

Use concise context assembled from:
- Target role and experience summary.
- Confirmed skills and technologies.
- Learning topics and assessment evidence.
- Project notes selected by user.
- Relevant previous interview feedback.

Do not send every database row to the model. Do not include recruiter personal contact details or unrelated application notes in interview prompts.

Prompts should instruct the model to:
- Be a realistic interviewer/coach.
- Ask one question at a time.
- Prefer Java backend/SDE-I relevance.
- Distinguish fact from inference.
- Never invent details about the user's employment or projects.
- Explain uncertainty and avoid pretending to have executed code.

## 11.5 Cost and abuse controls

- AI must require an explicit click or submit.
- Display selected model where appropriate.
- Set a reasonable maximum input/output token budget.
- Do not auto-run on every page load, keystroke or dashboard refresh.
- Allow cancellation/stop when supported.
- Log token/cost metadata if provider supplies it; do not estimate as fact when unavailable.
- Add a per-day or per-session usage guard if practical.

## 11.6 Failure handling

If provider is unavailable, show the saved user answer and retry action; do not lose work. Validate structured model output with Zod. If JSON parsing or schema validation fails, show a recoverable error and optionally allow a plain-text fallback. Store raw model output only if needed for debugging, with an explicit retention rule; prefer storing normalized feedback.

## Exit criteria

- [ ] API key remains server-side.
- [ ] AI is user-triggered and does not run on page load.
- [ ] Mock interview asks one question at a time.
- [ ] Answer evaluation includes the stated rubric.
- [ ] Model output is schema-validated.
- [ ] Context is bounded and grounded in user-approved data.
- [ ] JD analysis cannot create unsupported resume claims.
- [ ] Failure does not lose submitted answer.
- [ ] Model, prompt version and timestamp are recorded.
- [ ] Cost/usage guard is present.
