"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  updateModuleProgressSchema,
  updateTopicAssessmentSchema,
  type UpdateModuleProgressInput,
  type UpdateTopicAssessmentInput,
} from "./schema";
import {
  updateModuleProgress,
  updateTopicAssessment,
  seedDefaultTopicsIfEmpty,
} from "./service";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateModuleProgressAction(
  rawInput: UpdateModuleProgressInput
): Promise<ActionResult> {
  try {
    const parsed = updateModuleProgressSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const updated = await updateModuleProgress(supabase, user.id, parsed.data);
    revalidatePath("/learning");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update module" };
  }
}

export async function updateTopicAssessmentAction(
  rawInput: UpdateTopicAssessmentInput
): Promise<ActionResult> {
  try {
    const parsed = updateTopicAssessmentSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const updated = await updateTopicAssessment(supabase, user.id, parsed.data);
    revalidatePath("/learning");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update topic" };
  }
}

export async function seedDefaultTopicsAction(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const count = await seedDefaultTopicsIfEmpty(supabase, user.id);
    revalidatePath("/learning");

    return { success: true, data: { count } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to seed topics" };
  }
}
