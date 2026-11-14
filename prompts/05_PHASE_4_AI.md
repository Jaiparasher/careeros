# Phase 4 Prompt - AI Interview Coach and Recommendations

Implement only Phase 4 from `docs/11_PHASE_4_AI_ASSISTANCE.md`.

Use Google Gemini via the official `@google/genai` SDK behind a server-only provider abstraction. Follow `docs/GEMINI_API_KEY_SETUP.md`. Keep API keys server-side. AI calls must be user-triggered, bounded, schema-validated and recorded with provider/model/prompt version. Do not add vector search, pgvector or an agent framework unless a separate documented need is demonstrated.

Build a text-based mock interview that can select questions from the Phase 2 skill/topic question bank or generate a new question on explicit request. Ask one question at a time, evaluate technical correctness/completeness/clarity/practical depth/trade-off awareness, return actionable feedback and a follow-up. Preserve the question source and mark AI-generated items. Add user-triggered study recommendations, skill-question answer coaching and JD/profile comparison, ensuring no invented career claims. The 30-day and Day 31+ scheduling calculations remain deterministic and do not call AI for date or time arithmetic.

Add failure handling so submitted answers are never lost. Add input/output limits and basic usage safeguards. Test provider errors, invalid model output, empty context and normal flow. Update docs and implementation status with model configuration instructions and cost-control behavior.
