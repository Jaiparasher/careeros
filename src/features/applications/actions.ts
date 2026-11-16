"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createApplicationSchema,
  updateApplicationSchema,
  createInterviewRoundSchema,
  updateInterviewRoundSchema,
  stageChangeSchema,
  type CreateApplicationInput,
  type UpdateApplicationInput,
  type CreateInterviewRoundInput,
  type UpdateInterviewRoundInput,
  type ApplicationStage,
} from "./schema";
import {
  createApplication,
  updateApplication,
  deleteApplication,
  changeApplicationStage,
  createInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  checkDuplicateApplication,
  type JobApplicationRecord,
} from "./service";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createApplicationAction(
  input: CreateApplicationInput
): Promise<ActionResult> {
  try {
    const validated = createApplicationSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const app = await createApplication(supabase, user.id, validated);
    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true, data: app };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create application";
    return { success: false, error: message };
  }
}

export async function updateApplicationAction(
  applicationId: string,
  input: UpdateApplicationInput
): Promise<ActionResult> {
  try {
    const validated = updateApplicationSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const app = await updateApplication(supabase, user.id, applicationId, validated);
    revalidatePath("/applications");
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/dashboard");

    return { success: true, data: app };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update application";
    return { success: false, error: message };
  }
}

export async function changeApplicationStageAction(
  applicationId: string,
  newStage: ApplicationStage,
  notes?: string
): Promise<ActionResult> {
  try {
    const validated = stageChangeSchema.parse({ new_stage: newStage, notes });
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const app = await changeApplicationStage(
      supabase,
      user.id,
      applicationId,
      validated.new_stage,
      validated.notes
    );

    revalidatePath("/applications");
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/dashboard");

    return { success: true, data: app };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change stage";
    return { success: false, error: message };
  }
}

export async function deleteApplicationAction(
  applicationId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await deleteApplication(supabase, user.id, applicationId);
    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete application";
    return { success: false, error: message };
  }
}

export async function checkDuplicateAction(
  company: string,
  roleTitle: string,
  jobUrl?: string | null,
  excludeId?: string
): Promise<ActionResult<{ hasDuplicate: boolean; duplicateApp?: JobApplicationRecord; reason?: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await checkDuplicateApplication(
      supabase,
      user.id,
      company,
      roleTitle,
      jobUrl,
      excludeId
    );

    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to check duplicates";
    return { success: false, error: message };
  }
}

// ─── INTERVIEW ROUND ACTIONS ──────────────────────────────────────────────────

export async function createInterviewRoundAction(
  applicationId: string,
  input: CreateInterviewRoundInput
): Promise<ActionResult> {
  try {
    const validated = createInterviewRoundSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const round = await createInterviewRound(supabase, user.id, applicationId, validated);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/applications");

    return { success: true, data: round };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create interview round";
    return { success: false, error: message };
  }
}

export async function updateInterviewRoundAction(
  applicationId: string,
  roundId: string,
  input: UpdateInterviewRoundInput
): Promise<ActionResult> {
  try {
    const validated = updateInterviewRoundSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const round = await updateInterviewRound(supabase, user.id, roundId, validated);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/applications");

    return { success: true, data: round };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update interview round";
    return { success: false, error: message };
  }
}

export async function deleteInterviewRoundAction(
  applicationId: string,
  roundId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await deleteInterviewRound(supabase, user.id, roundId);
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/applications");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete interview round";
    return { success: false, error: message };
  }
}
