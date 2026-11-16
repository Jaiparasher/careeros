"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ResumeService } from "./service";
import {
  uploadResumeInputSchema,
  updateResumeTextSchema,
  jobDescriptionInputSchema,
  JobDescriptionInput,
  ResumeRow,
  JobDescriptionRow,
  ResumeJdAnalysis,
} from "./schema";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server action to upload a resume file and metadata.
 */
export async function uploadResumeAction(formData: FormData): Promise<ActionResult<ResumeRow>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Please select a resume file to upload." };
    }

    const version_label = (formData.get("version_label") as string) || "Version 1";
    const target_role = (formData.get("target_role") as string) || "";
    const notes = (formData.get("notes") as string) || "";
    const is_primary = formData.get("is_primary") === "true";

    const validatedInput = uploadResumeInputSchema.parse({
      version_label,
      target_role,
      notes,
      is_primary,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const service = new ResumeService(supabase);
    const resume = await service.uploadResume(
      user.id,
      buffer,
      file.name,
      file.type,
      file.size,
      validatedInput
    );

    revalidatePath("/resume");
    return { success: true, data: resume };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload resume";
    return { success: false, error: message };
  }
}

/**
 * Server action to generate a secure signed download URL.
 */
export async function getResumeDownloadUrlAction(
  resumeId: string
): Promise<ActionResult<{ signedUrl: string; fileName: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    const result = await service.getResumeDownloadUrl(user.id, resumeId, 60);

    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get download URL";
    return { success: false, error: message };
  }
}

/**
 * Server action to mark a resume as primary.
 */
export async function setPrimaryResumeAction(resumeId: string): Promise<ActionResult<ResumeRow>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    const updated = await service.setPrimaryResume(user.id, resumeId);

    revalidatePath("/resume");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to set primary resume";
    return { success: false, error: message };
  }
}

/**
 * Server action to update extracted text manually.
 */
export async function updateResumeTextAction(
  resumeId: string,
  extractedText: string
): Promise<ActionResult<ResumeRow>> {
  try {
    const validated = updateResumeTextSchema.parse({
      id: resumeId,
      extracted_text: extractedText,
    });

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    const updated = await service.updateResumeText(user.id, validated.id, validated.extracted_text);

    revalidatePath("/resume");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update resume text";
    return { success: false, error: message };
  }
}

/**
 * Server action to delete a resume (both storage and database).
 */
export async function deleteResumeAction(resumeId: string): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    await service.deleteResume(user.id, resumeId);

    revalidatePath("/resume");
    return { success: true, data: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete resume";
    return { success: false, error: message };
  }
}

/**
 * Server action to save a job description.
 */
export async function createJobDescriptionAction(
  input: JobDescriptionInput
): Promise<ActionResult<JobDescriptionRow>> {
  try {
    const validated = jobDescriptionInputSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    const jd = await service.createJobDescription(user.id, validated);

    revalidatePath("/resume");
    return { success: true, data: jd };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create job description";
    return { success: false, error: message };
  }
}

/**
 * Server action to update a job description.
 */
export async function updateJobDescriptionAction(
  jdId: string,
  input: Partial<JobDescriptionInput>
): Promise<ActionResult<JobDescriptionRow>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    const updated = await service.updateJobDescription(user.id, jdId, input);

    revalidatePath("/resume");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update job description";
    return { success: false, error: message };
  }
}

/**
 * Server action to delete a job description.
 */
export async function deleteJobDescriptionAction(jdId: string): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    await service.deleteJobDescription(user.id, jdId);

    revalidatePath("/resume");
    return { success: true, data: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete job description";
    return { success: false, error: message };
  }
}

/**
 * Server action to run deterministic resume vs JD alignment analysis.
 */
export async function analyzeResumeJdAction(
  resumeId: string,
  jdInput: { raw_text: string; company?: string; role_title?: string; jdId?: string }
): Promise<ActionResult<ResumeJdAnalysis>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const service = new ResumeService(supabase);
    const analysis = await service.analyze(user.id, resumeId, jdInput);

    return { success: true, data: analysis };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to run analysis";
    return { success: false, error: message };
  }
}
