"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { StudyRecommendationService } from "./recommendation-service";
import {
  type RecommendationSessionResult,
  acceptRecommendationInputSchema,
  acceptAllRecommendationsInputSchema,
  generateRecommendationsInputSchema,
  type AcceptRecommendationInput,
  type AcceptAllRecommendationsInput,
  type GenerateRecommendationsInput,
} from "./recommendation-schema";
import type { StudyTaskItem } from "./service";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function generateStudyRecommendationsAction(
  rawOptions?: GenerateRecommendationsInput
): Promise<ActionResponse<RecommendationSessionResult>> {
  try {
    const validated = generateRecommendationsInputSchema.safeParse(rawOptions || {});
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid targetDate format (expected YYYY-MM-DD).",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const service = new StudyRecommendationService(supabase);
    const result = await service.generateRecommendations(user.id, validated.data);

    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate study recommendations.";
    return { success: false, error: message };
  }
}

export async function acceptStudyRecommendationAction(
  rawInput: AcceptRecommendationInput
): Promise<ActionResponse<StudyTaskItem>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = acceptRecommendationInputSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid recommendation input.",
      };
    }

    const service = new StudyRecommendationService(supabase);
    const createdTask = await service.acceptRecommendation(user.id, validated.data);

    revalidatePath("/planner");
    revalidatePath("/planner/recommendations");

    return { success: true, data: createdTask };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to accept recommendation.";
    return { success: false, error: message };
  }
}

export async function acceptAllStudyRecommendationsAction(
  rawInput: AcceptAllRecommendationsInput
): Promise<ActionResponse<StudyTaskItem[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = acceptAllRecommendationsInputSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid recommendations input.",
      };
    }

    const service = new StudyRecommendationService(supabase);
    const createdTasks = await service.acceptAllRecommendations(
      user.id,
      validated.data.recommendations,
      validated.data.plannedFor
    );

    revalidatePath("/planner");
    revalidatePath("/planner/recommendations");

    return { success: true, data: createdTasks };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to accept recommendations.";
    return { success: false, error: message };
  }
}
