-- CareerOS — Migration 0013: Concurrency-Safe Deduplication on interview_question_bank
-- Forward-only migration. DO NOT APPLY TO LIVE SUPABASE AS PART OF BATCH B.
--
-- Architectural Analysis & Existing Index Sufficiency:
-- The existing partial unique index from Migration 0006:
--   interview_question_bank_external_uidx (user_id, source_name, source_external_id)
--   WHERE source_external_id is not null
-- ALREADY fully protects against concurrent duplicate saves because AI-generated
-- questions deterministically compute source_external_id = 'ai-gen-' || sha256(...)
-- with constant source_name = 'AI Generated (JD Alignment)'.
--
-- This forward-only migration provides defense-in-depth prompt-level deduplication
-- strictly scoped to AI-generated questions.
--
-- Scoping & Safety Guarantee:
-- The partial index predicate `WHERE source_name = 'AI Generated (JD Alignment)'`
-- ensures that:
-- 1. Curated questions ('CareerOS curated') are completely excluded.
-- 2. User-added questions ('user_added') and imports are completely excluded.
-- 3. Only AI-generated JD-alignment questions are constrained.
-- 4. No legitimate multi-source questions with identical prompts can be blocked.
-- 5. Safe to apply to populated databases as it cannot conflict with curated seed data.

create unique index if not exists interview_question_bank_ai_prompt_uidx
  on public.interview_question_bank(user_id, md5(lower(trim(question_prompt))))
  where source_name = 'AI Generated (JD Alignment)';
