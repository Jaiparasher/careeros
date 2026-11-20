"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ResumeJdAnalysisService } from "./ai-analysis-service";
import {
  runAiAnalysisInputSchema,
  targetedInterviewQuestionSchema,
  type RunAiAnalysisInput,
  type AiResumeJdAnalysisReport,
  type TargetedInterviewQuestion,
} from "./ai-analyzer-schema";

const analysisIdSchema = z.string().uuid("Invalid analysis ID");

const listAnalysesFilterSchema = z
  .object({
    resumeId: z.string().uuid("Invalid resume ID").optional(),
    jdId: z.string().uuid("Invalid job description ID").optional(),
  })
  .optional();

const connectAnalysisSchema = z.object({
  analysisId: z.string().uuid("Invalid analysis ID"),
  applicationId: z.string().uuid("Invalid application ID").nullable(),
});

export async function runAiResumeJdAnalysisAction(
  rawInput: RunAiAnalysisInput
): Promise<{ success: boolean; data?: AiResumeJdAnalysisReport; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const parsed = runAiAnalysisInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input parameters.",
      };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const report = await service.runAnalysis(user.id, parsed.data);

    return { success: true, data: report };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to run AI analysis.";
    return { success: false, error: message };
  }
}

export async function getAiResumeJdAnalysisAction(
  analysisId: string
): Promise<{ success: boolean; data?: AiResumeJdAnalysisReport; error?: string }> {
  try {
    const parsed = analysisIdSchema.safeParse(analysisId);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid analysis ID.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const report = await service.getAnalysis(user.id, parsed.data);

    if (!report) {
      return { success: false, error: "Analysis report not found or access denied." };
    }

    return { success: true, data: report };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve analysis.";
    return { success: false, error: message };
  }
}

export async function listAiResumeJdAnalysesAction(
  filters?: { resumeId?: string; jdId?: string }
): Promise<{ success: boolean; data?: AiResumeJdAnalysisReport[]; error?: string }> {
  try {
    const parsed = listAnalysesFilterSchema.safeParse(filters);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid filter parameters.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const list = await service.listAnalyses(user.id, parsed.data);

    return { success: true, data: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list analyses.";
    return { success: false, error: message };
  }
}

export async function connectAnalysisToApplicationAction(
  analysisId: string,
  applicationId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = connectAnalysisSchema.safeParse({ analysisId, applicationId });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid connection parameters.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    await service.connectApplication(user.id, parsed.data.analysisId, parsed.data.applicationId);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect application.";
    return { success: false, error: message };
  }
}

export async function saveGeneratedQuestionToBankAction(
  question: TargetedInterviewQuestion
): Promise<{ success: boolean; questionBankId?: string; error?: string }> {
  try {
    const parsed = targetedInterviewQuestionSchema.safeParse(question);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid question payload.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const newId = await service.saveGeneratedQuestionToBank(user.id, parsed.data);

    return { success: true, questionBankId: newId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save question to question bank.";
    return { success: false, error: message };
  }
}

export async function deleteAiAnalysisAction(
  analysisId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = analysisIdSchema.safeParse(analysisId);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid analysis ID.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    await service.deleteAnalysis(user.id, parsed.data);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete analysis.";
    return { success: false, error: message };
  }
}
