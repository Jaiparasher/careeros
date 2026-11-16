"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MockInterviewService } from "./mock-interview-service";
import {
  createMockInterviewSchema,
  submitAnswerSchema,
  retryEvaluationSchema,
  finishInterviewSchema,
} from "./mock-interview-schema";

export async function createMockInterviewAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to create a mock interview.");
  }

  const interviewType = (formData.get("interviewType") as string) || "Technical";
  const difficulty = (formData.get("difficulty") as string) || "medium";
  const questionCount = Number(formData.get("questionCount") || 5);
  const rawSkills = formData.getAll("skills") as string[];

  const parsed = createMockInterviewSchema.safeParse({
    interviewType,
    difficulty,
    questionCount,
    skills: rawSkills,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid interview configuration: ${parsed.error.issues.map((i) => i.message).join(", ")}`
    );
  }

  const service = new MockInterviewService(supabase);
  const session = await service.createSession(user.id, parsed.data);

  revalidatePath("/interview");
  redirect(`/interview/${session.id}`);
}

export async function submitAnswerAction(input: {
  sessionId: string;
  questionId: string;
  answer?: string;
  skip?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = submitAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const service = new MockInterviewService(supabase);
    const result = await service.submitAnswer(user.id, parsed.data);
    revalidatePath(`/interview/${input.sessionId}`);
    return { success: true, question: result.question, session: result.session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to evaluate answer.";
    return { success: false, error: message };
  }
}

export async function retryEvaluationAction(input: {
  sessionId: string;
  questionId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = retryEvaluationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters." };
  }

  try {
    const service = new MockInterviewService(supabase);
    const result = await service.retryEvaluation(
      user.id,
      parsed.data.sessionId,
      parsed.data.questionId
    );
    revalidatePath(`/interview/${input.sessionId}`);
    return { success: true, question: result.question, session: result.session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to re-evaluate answer.";
    return { success: false, error: message };
  }
}

export async function finishInterviewAction(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = finishInterviewSchema.safeParse({ sessionId });
  if (!parsed.success) {
    return { success: false, error: "Invalid session ID." };
  }

  try {
    const service = new MockInterviewService(supabase);
    const session = await service.finalizeInterview(user.id, parsed.data.sessionId);
    revalidatePath(`/interview/${sessionId}`);
    return { success: true, session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to finish interview.";
    return { success: false, error: message };
  }
}
