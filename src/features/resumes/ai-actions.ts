"use server";

import { createClient } from "@/lib/supabase/server";
import { ResumeJdAnalysisService } from "./ai-analysis-service";
import {
  runAiAnalysisInputSchema,
  type RunAiAnalysisInput,
  type AiResumeJdAnalysisReport,
  type TargetedInterviewQuestion,
} from "./ai-analyzer-schema";

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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const report = await service.getAnalysis(user.id, analysisId);

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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const list = await service.listAnalyses(user.id, filters);

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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    await service.connectApplication(user.id, analysisId, applicationId);

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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    const newId = await service.saveGeneratedQuestionToBank(user.id, question);

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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const service = new ResumeJdAnalysisService(supabase);
    await service.deleteAnalysis(user.id, analysisId);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete analysis.";
    return { success: false, error: message };
  }
}
