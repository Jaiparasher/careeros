# Google Gemini API Key Setup (Google AI Studio)

CareerOS uses Google Gemini as its primary AI provider in Phase 4. You do not need a Gemini key for Phases 0-3.

## 1. Keep the key private

- Never paste the key into Antigravity chat, GitHub, source code, screenshots, or a `NEXT_PUBLIC_` environment variable.
- Store it only in a local ignored `.env.local` file and in Vercel's server environment settings.
- If a key is accidentally exposed, revoke it in Google AI Studio and create a replacement.

## 2. Local configuration

After Phase 4 begins, create or update `.env.local` in the project root:

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=choose-a-current-model-id-from-google-ai-studio
```

Do not include quote marks unless the key itself requires them. Do not commit `.env.local`. Ensure `.gitignore` contains `.env*` and explicitly allows `.env.example`.

## 3. Install the official SDK

Run this only when implementing Phase 4:

```bash
npm install @google/genai
```

Use the SDK only in server-side route handlers or server-only service modules. The AI provider adapter should read `process.env.GEMINI_API_KEY` and `process.env.GEMINI_MODEL`. Keep the model configurable because model availability and pricing can change.

## 4. Vercel configuration

In the Vercel project, open Settings → Environment Variables and add:

- `GEMINI_API_KEY` — mark as secret/server-only; do not prefix with `NEXT_PUBLIC_`.
- `GEMINI_MODEL` — model identifier selected from the current Gemini API model list.

Add the variables to the appropriate Preview and Production environments. Redeploy after changing environment variables.

## 5. Cost and usage controls

- Trigger model calls only after the user clicks an explicit AI action.
- Add input/output limits, timeouts and basic per-user rate limits.
- Show a useful error if quota, rate limits or billing settings prevent a request.
- Do not assume the API is free; check the current Google AI Studio usage and pricing information before relying on it.
- Store provider/model metadata for each AI session, but never store or log the API key.

## Official references

- Google AI Studio: https://aistudio.google.com/
- Gemini API key guidance: https://ai.google.dev/gemini-api/docs/api-key
- Gemini API getting started: https://ai.google.dev/gemini-api/docs/get-started
- Official JavaScript SDK: https://googleapis.github.io/js-genai/
