# Google Gemini API Key Setup & Integration Guide

CareerOS integrates Google Gemini via the official `@google/genai` SDK starting in Phase 4. All AI operations are kept strictly server-side.

---

## 1. Security Rules (Non-Negotiable)

- **Never** expose the key through client components, browser requests, public environment variables (`NEXT_PUBLIC_*`), error messages, logs, or chat.
- **Never** commit `.env` or `.env.local` files containing real keys to Git.
- Store the key exclusively in:
  - Local development: `.env.local` (ignored by Git).
  - Vercel deployment: Project Settings → Environment Variables (Server-only / Encrypted).
- If a key is accidentally exposed, immediately revoke it in [Google AI Studio](https://aistudio.google.com/) and create a replacement.

---

## 2. Obtaining an API Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** in the top navigation or sidebar.
4. Click **"Create API key"** and choose or create a Google Cloud project.
5. Copy your generated key string (keep it secure).

---

## 3. Local Environment Configuration

In your project root, add or update your `.env.local` file:

```dotenv
# Server-only AI configuration
GEMINI_API_KEY=your_actual_google_ai_studio_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Note**: Do NOT add `NEXT_PUBLIC_` before `GEMINI_API_KEY`. The variable must remain private to the server runtime.

---

## 4. Vercel Production Configuration

1. In the [Vercel Dashboard](https://vercel.com/), select your CareerOS project.
2. Navigate to **Settings** → **Environment Variables**.
3. Add the following variables:
   - `GEMINI_API_KEY`: Paste your Google AI Studio API key. (Keep "Automatically expose to the browser" unchecked).
   - `GEMINI_MODEL`: `gemini-2.5-flash` (or your chosen model).
4. Select all target environments: **Production**, **Preview**, and **Development**.
5. Redeploy your application to apply the new environment variables.

---

## 5. Architecture & Protection Safeguards

### In-Memory Rate Limiting
- To protect against accidental request storms and runaway quota consumption, requests to the AI endpoints are rate limited in server memory.
- Default limit: **10 requests per minute per authenticated user**.
- When exceeded, the server returns HTTP `429 Too Many Requests` with a `Retry-After` header.

### Request Size Limits
- Connectivity verification prompts are capped at **1,000 characters**.
- General AI task prompts are capped at **10,000 characters** with a max output token budget (up to 8,192 tokens).
- Payloads exceeding these bounds are rejected immediately with HTTP `400 Bad Request` before reaching the Gemini API.

### Safe Error Normalization
All API errors (SDK exceptions, timeouts, safety blocks, quota exhaustion) are intercepted and mapped to structured, sanitized JSON error responses without leaking credentials, request URLs, or internal stack traces:

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | User is not authenticated in Supabase session. |
| `INVALID_REQUEST` | 400 | Payload validation failed or exceeded character limits. |
| `CONTENT_FILTERED` | 400 | Model safety filters blocked the input or generated content. |
| `QUOTA_EXCEEDED` | 429 | Gemini API rate limit or project quota reached. |
| `PROVIDER_ERROR` | 502 | Upstream communication error with Google GenAI. |
| `MISSING_API_KEY` | 503 | Server is missing `GEMINI_API_KEY` environment variable. |
| `TIMEOUT` | 504 | Request exceeded timeout limit (15s–30s). |

---

## 6. Verifying AI Connectivity

A minimal protected endpoint is provided at `/api/ai/verify`:

### GET `/api/ai/verify`
Checks whether the server environment has configured the Gemini API key.
- **Authentication**: Requires authenticated Supabase session.
- **Response**:
  ```json
  {
    "success": true,
    "configured": true,
    "model": "gemini-2.5-flash"
  }
  ```

### POST `/api/ai/verify`
Runs a small test generation to confirm end-to-end connectivity with Gemini.
- **Authentication**: Requires authenticated Supabase session.
- **Request Body (optional)**:
  ```json
  {
    "prompt": "Say hello in 5 words."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "model": "gemini-2.5-flash",
    "message": "Hello! How can I help?",
    "usage": {
      "promptTokens": 6,
      "completionTokens": 7,
      "totalTokens": 13
    }
  }
  ```

---

## 7. Cost & Usage Monitoring

- **Google AI Studio Tiering**: Google AI Studio provides free tiers for development with rate limits (requests per minute and per day).
- **Pay-as-you-go**: If you link a Google Cloud billing account, you are charged per 1 million input/output tokens.
- **Monitoring**: Check your active token usage and quotas at [Google AI Studio Dashboard](https://aistudio.google.com/) or the Google Cloud Console Metrics Explorer.
