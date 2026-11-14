# 11. Phase 4 - AI Career Assistant and Mock Interviews

## Objective

Add carefully scoped AI features after the underlying profile, learning history and career records are reliable. AI is an optional assistant, not the system of record.

## 11.1 Database prerequisite

Apply `supabase/migrations/0005_interview_tables.sql` when starting Phase 4. It adds interview sessions and per-question evaluation records.

## 11.2 Provider integration

- Primary provider: Google Gemini using the official `@google/genai` JavaScript/TypeScript SDK.
- Install the SDK only when Phase 4 begins: `npm install @google/genai`.
- Read the API key from `process.env.GEMINI_API_KEY` in server-only code.
- Read the model ID from `process.env.GEMINI_MODEL`; do not hardcode a model ID throughout the codebase. Choose a currently available model in Google AI Studio and record it in `docs/IMPLEMENTATION_STATUS.md`.
- Keep the provider behind a small interface so another provider can be added later without changing feature code. Do not build multi-provider UI in the MVP.
- Never expose the API key in `NEXT_PUBLIC_*`, browser code, client components, logs, Git, or chat messages.
- Store `GEMINI_API_KEY` only in Vercel/server environment settings and local ignored `.env.local`.
- See `docs/GEMINI_API_KEY_SETUP.md` for setup and troubleshooting.
- Add request timeout, output length limits, basic rate limiting and friendly error handling.
- Do not add a vector database or RAG pipeline initially. Use concise, user-approved context assembled from the database.

## 11.3 User-triggered AI use cases

P2-A: Technical mock interview
- Select target role, skill/technology, topic, difficulty and duration.
- Choose questions from the Phase 2 interview question bank or request a fresh AI-generated question.
- Start a session with one question at a time.
- User submits answer.
- AI evaluates answer against a rubric and asks one relevant follow-up or ends the question.
- Store question, answer, feedback, model and prompt version. Record whether a question came from the curated bank, the user, an external import or on-demand AI generation.

P2-B: Question-bank answer coaching
- The user may request feedback on an answer to a saved question.
- Compare against stored expected answer points and explicitly identify uncertainty or multiple valid approaches.
- AI-generated questions must be tagged with origin, provider/model and prompt version; user must approve before saving to the bank.

P2-C: Answer evaluation rubric
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

P2-D: Personalized study recommendation
- Input: due revisions, weak/unassessed topics, incomplete modules, daily available minutes and target role.
- Output: at most three actions with reasons and estimated time.
- Deterministic planner remains responsible for time/date calculations and scheduling. AI may rank/explain candidates; user must accept before tasks are created.

P2-E: Job description comparison
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
- [ ] Mock interview asks one question at a time and can use selected skill-bank content.
- [ ] AI-generated questions are user-triggered, tagged and deduplicated before saving.
- [ ] Existing static question bank remains fully usable without AI.
- [ ] Answer evaluation includes the stated rubric.
- [ ] Model output is schema-validated.
- [ ] Context is bounded and grounded in user-approved data.
- [ ] JD analysis cannot create unsupported resume claims.
- [ ] Failure does not lose submitted answer.
- [ ] Model, prompt version and timestamp are recorded.
- [ ] Cost/usage guard is present.
