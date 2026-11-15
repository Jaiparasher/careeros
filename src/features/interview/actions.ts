"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordQuestionAnswerSchema, type RecordQuestionAnswerInput } from "./schema";
import { recordQuestionAnswer, seedQuestionBankIfEmpty } from "./service";

export async function recordQuestionAnswerAction(input: RecordQuestionAnswerInput) {
  try {
    const validated = recordQuestionAnswerSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const question = await recordQuestionAnswer(supabase, user.id, validated);

    revalidatePath("/interview-questions");
    revalidatePath(`/interview-questions/${validated.questionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/planner");

    return { success: true, question };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record answer";
    return { success: false, error: message };
  }
}

export async function seedQuestionBankAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await seedQuestionBankIfEmpty(supabase, user.id);

    revalidatePath("/interview-questions");
    revalidatePath("/dashboard");

    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to seed interview question bank";
    return { success: false, error: message };
  }
}
