# Phase 4 Prompt - AI Interview Coach and Recommendations

Implement only Phase 4 from `docs/11_PHASE_4_AI_ASSISTANCE.md`.

Use OpenRouter behind a server-only provider abstraction. Keep API keys server-side. AI calls must be user-triggered, bounded, schema-validated and recorded with provider/model/prompt version. Do not add vector search, pgvector or an agent framework unless a separate documented need is demonstrated.

Build a text-based mock interview that asks one question at a time, evaluates technical correctness/completeness/clarity/practical depth/trade-off awareness, returns actionable feedback and a follow-up. Add user-triggered study recommendations and JD/profile comparison, ensuring no invented career claims.

Add failure handling so submitted answers are never lost. Add input/output limits and basic usage safeguards. Test provider errors, invalid model output, empty context and normal flow. Update docs and implementation status with model configuration instructions and cost-control behavior.
