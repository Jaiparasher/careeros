"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createProjectSchema,
  updateProjectSchema,
  createFeatureSchema,
  updateFeatureSchema,
  createBugSchema,
  updateBugSchema,
  architectureDetailsSchema,
  interviewPrepSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateFeatureInput,
  type UpdateFeatureInput,
  type CreateBugInput,
  type UpdateBugInput,
  type ArchitectureDetailsInput,
  type InterviewPrepInput,
} from "./schema";
import {
  createProject,
  updateProject,
  deleteProject,
  createProjectFeature,
  updateProjectFeature,
  deleteProjectFeature,
  createProjectBug,
  updateProjectBug,
  deleteProjectBug,
  updateProjectArchitecture,
  updateProjectInterviewPrep,
  seedLovableProjectIfEmpty,
} from "./service";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createProjectAction(
  input: CreateProjectInput
): Promise<ActionResult> {
  try {
    const validated = createProjectSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await createProject(supabase, user.id, validated);
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, data: project };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    return { success: false, error: message };
  }
}

export async function updateProjectAction(
  projectId: string,
  input: UpdateProjectInput
): Promise<ActionResult> {
  try {
    const validated = updateProjectSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await updateProject(supabase, user.id, projectId, validated);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/dashboard");

    return { success: true, data: project };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update project";
    return { success: false, error: message };
  }
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await deleteProject(supabase, user.id, projectId);
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete project";
    return { success: false, error: message };
  }
}

export async function seedLovableProjectAction(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const res = await seedLovableProjectIfEmpty(supabase, user.id);
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, data: res };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to seed Lovable project";
    return { success: false, error: message };
  }
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

export async function createFeatureAction(
  projectId: string,
  input: CreateFeatureInput
): Promise<ActionResult> {
  try {
    const validated = createFeatureSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const feature = await createProjectFeature(supabase, user.id, projectId, validated);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");

    return { success: true, data: feature };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create feature";
    return { success: false, error: message };
  }
}

export async function updateFeatureAction(
  projectId: string,
  featureId: string,
  input: UpdateFeatureInput
): Promise<ActionResult> {
  try {
    const validated = updateFeatureSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const feature = await updateProjectFeature(supabase, user.id, featureId, validated);
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: feature };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update feature";
    return { success: false, error: message };
  }
}

export async function deleteFeatureAction(
  projectId: string,
  featureId: string
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

    await deleteProjectFeature(supabase, user.id, featureId);
    revalidatePath(`/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete feature";
    return { success: false, error: message };
  }
}

// ─── BUGS ─────────────────────────────────────────────────────────────────────

export async function createBugAction(
  projectId: string,
  input: CreateBugInput
): Promise<ActionResult> {
  try {
    const validated = createBugSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const bug = await createProjectBug(supabase, user.id, projectId, validated);
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: bug };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record bug";
    return { success: false, error: message };
  }
}

export async function updateBugAction(
  projectId: string,
  bugId: string,
  input: UpdateBugInput
): Promise<ActionResult> {
  try {
    const validated = updateBugSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const bug = await updateProjectBug(supabase, user.id, bugId, validated);
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: bug };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update bug";
    return { success: false, error: message };
  }
}

export async function deleteBugAction(
  projectId: string,
  bugId: string
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

    await deleteProjectBug(supabase, user.id, bugId);
    revalidatePath(`/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete bug";
    return { success: false, error: message };
  }
}

// ─── ARCHITECTURE & INTERVIEW STORY ───────────────────────────────────────────

export async function updateArchitectureAction(
  projectId: string,
  input: ArchitectureDetailsInput
): Promise<ActionResult> {
  try {
    const validated = architectureDetailsSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await updateProjectArchitecture(supabase, user.id, projectId, validated);
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: project };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update architecture details";
    return { success: false, error: message };
  }
}

export async function updateInterviewPrepAction(
  projectId: string,
  input: InterviewPrepInput
): Promise<ActionResult> {
  try {
    const validated = interviewPrepSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await updateProjectInterviewPrep(supabase, user.id, projectId, validated);
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: project };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update interview story notes";
    return { success: false, error: message };
  }
}
