import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  aiRateLimiter,
  geminiService,
  verifyPromptSchema,
  AiServiceError,
} from "@/features/ai";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      configured: geminiService.isConfigured(),
      model: geminiService.getModel(),
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_ERROR",
          message: "Internal server error.",
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to verify Gemini connectivity.",
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    // 2. Rate limit check (per user)
    const rateLimit = aiRateLimiter.check(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before retrying.`,
            status: 429,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    // 3. Parse and validate request body
    let body: unknown = {};
    try {
      const text = await request.text();
      if (text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Malformed JSON payload.",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const parseResult = verifyPromptSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: parseResult.error.issues.map((i) => i.message).join(", "),
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const prompt =
      parseResult.data.prompt && parseResult.data.prompt.length > 0
        ? parseResult.data.prompt
        : "Respond with 'CareerOS AI connection verified.' in 10 words or fewer.";

    // 4. Check if Gemini service is configured
    if (!geminiService.isConfigured()) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_API_KEY",
            message:
              "Gemini AI is not configured. Please set the GEMINI_API_KEY environment variable on the server.",
            status: 503,
          },
        },
        { status: 503 }
      );
    }

    // 5. Execute verification generation
    const result = await geminiService.generateContent({
      prompt,
      maxOutputTokens: 300,
      timeoutMs: 15_000,
    });

    return NextResponse.json({
      success: true,
      model: result.model,
      message: result.text,
      usage: result.usage,
    });
  } catch (err: unknown) {
    if (err instanceof AiServiceError) {
      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
            status: err.status,
          },
        },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_ERROR",
          message: "Failed to communicate with AI provider.",
          status: 502,
        },
      },
      { status: 502 }
    );
  }
}
