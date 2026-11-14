# Import Templates

- `dsa_questions_import.csv`: import exact DSA questions you have tracked. The sample row is illustrative only; remove or replace it. Never treat it as part of your personal solved history.
- `job_applications_import.csv`: blank/template-style job import. The sample is illustrative only.

Importer requirements: preview first, validate every row, warn about duplicates, let the user choose skip/update, and return a row-by-row result. Never silently overwrite user-authored notes.

- `interview_questions_import.csv`: import technology/topic-wise interview questions, expected answer points, references and skill tags. The included sample row is illustrative only; review before import.

For question-bank starter content, follow `seed-data/interview-question-bank-seed.json` and `prompts/08_QUESTION_BANK_SEED.md`. For Grind 75, use the verified official collection import and preserve its official order; do not copy full problem statements or editorials.
