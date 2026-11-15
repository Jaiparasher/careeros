"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  acceptSprintPlanSchema,
  toggleTaskSchema,
  rescheduleTaskSchema,
  createCustomTaskSchema,
  type AcceptSprintPlanInput,
  type ToggleTaskInput,
  type RescheduleTaskInput,
  type CreateCustomTaskInput,
} from "./schema";
import {
  acceptSprintPlan,
  toggleTaskStatus,
  rescheduleTask,
  createCustomTask,
} from "./service";

export async function acceptSprintPlanAction(input: AcceptSprintPlanInput) {
  try {
    const validated = acceptSprintPlanSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const durationDays = parseInt(validated.durationDays, 10) as 30 | 45 | 60;
    const plan = await acceptSprintPlan(supabase, user.id, durationDays, validated.startDate);

    revalidatePath("/planner");
    revalidatePath("/planner/sprint");
    revalidatePath("/dashboard");

    return { success: true, plan };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to accept sprint plan";
    return { success: false, error: message };
  }
}

export async function toggleTaskAction(input: ToggleTaskInput) {
  try {
    const validated = toggleTaskSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const task = await toggleTaskStatus(supabase, user.id, validated.taskId, validated.completed);

    revalidatePath("/planner");
    revalidatePath("/dashboard");

    return { success: true, task };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle task";
    return { success: false, error: message };
  }
}

export async function rescheduleTaskAction(input: RescheduleTaskInput) {
  try {
    const validated = rescheduleTaskSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const task = await rescheduleTask(supabase, user.id, validated.taskId, validated.newDate);

    revalidatePath("/planner");
    revalidatePath("/dashboard");

    return { success: true, task };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reschedule task";
    return { success: false, error: message };
  }
}

export async function createCustomTaskAction(input: CreateCustomTaskInput, planId?: string) {
  try {
    const validated = createCustomTaskSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const task = await createCustomTask(supabase, user.id, validated, planId);

    revalidatePath("/planner");
    revalidatePath("/dashboard");

    return { success: true, task };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create task";
    return { success: false, error: message };
  }
}
