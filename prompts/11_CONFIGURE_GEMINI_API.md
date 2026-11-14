# Configure Google Gemini Provider (Phase 4)

Read `docs/11_PHASE_4_AI_ASSISTANCE.md` and `docs/GEMINI_API_KEY_SETUP.md`.

Use Google Gemini from Google AI Studio as the primary LLM provider through the official `@google/genai` SDK. Implement a small server-only provider adapter. Read `GEMINI_API_KEY` and `GEMINI_MODEL` from server environment variables. Never expose secrets to client-side code or `NEXT_PUBLIC_*`. Add schema validation, request timeouts, sensible input/output limits, user-triggered calls only, and graceful quota/rate-limit errors.

Do not ask me to paste my API key into chat. Tell me to place it in my local `.env.local` file and Vercel server environment settings. Do not hardcode model IDs; instruct me to select a currently available model and set `GEMINI_MODEL`. Test with a mocked provider in automated tests so tests do not consume API quota. Do not implement OpenRouter unless I explicitly ask for it.
