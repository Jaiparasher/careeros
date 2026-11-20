import crypto from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  type RunAiAnalysisInput,
  type AiResumeJdAnalysisReport,
  type TargetedInterviewQuestion,
} from "./ai-analyzer-schema";
import { generateAiResumeJdAnalysis } from "./ai-analyzer";
import { getAllSkills } from "@/features/interview/taxonomy";
import { aiRateLimiter, AiServiceError } from "@/features/ai";

export class ResumeJdAnalysisService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Executes AI-driven resume vs JD alignment analysis and persists report.
   */
  async runAnalysis(
    userId: string,
    input: RunAiAnalysisInput
  ): Promise<AiResumeJdAnalysisReport> {
    // 1. Verify and fetch resume
    const { data: resume, error: resumeErr } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("id", input.resumeId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (resumeErr || !resume) {
      throw new Error("Resume not found or access denied.");
    }

    if (!resume.extracted_text || resume.extracted_text.trim().length === 0) {
      throw new Error(
        "The selected resume has no extracted text. Please paste text manually in the Extracted Text editor before running AI analysis."
      );
    }

    // 2. Fetch or resolve Job Description
    let company = input.customCompany || "Target Company";
    let roleTitle = input.customRoleTitle || "Software Engineer";
    let jdText = input.customJdText || "";
    let effectiveJdId: string | null = null;
    let effectiveAppId: string | null = input.applicationId || null;

    if (input.jobDescriptionId) {
      const { data: jd, error: jdErr } = await this.supabase
        .from("job_descriptions")
        .select("*")
        .eq("id", input.jobDescriptionId)
        .eq("user_id", userId)
        .single();

      if (jdErr || !jd) {
        throw new Error("Job description not found or access denied.");
      }

      company = jd.company;
      roleTitle = jd.role_title;
      jdText = jd.raw_text;
      effectiveJdId = jd.id;
      if (!effectiveAppId && jd.application_id) {
        effectiveAppId = jd.application_id;
      }
    }

    if (!jdText || jdText.trim().length < 10) {
      throw new Error("Job description text must contain at least 10 characters.");
    }

    // 3. Rate limit check (M-01)
    const rateLimit = aiRateLimiter.check(userId);
    if (!rateLimit.allowed) {
      throw new AiServiceError(
        `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before retrying.`,
        "RATE_LIMITED",
        429
      );
    }

    // 4. Query existing 376-question bank for skills identified in JD
    const allTaxonomySkills = getAllSkills();
    const lowerJd = jdText.toLowerCase();
    const matchedSkills = allTaxonomySkills
      .filter((s) => lowerJd.includes(s.name.toLowerCase()) || lowerJd.includes(s.slug))
      .map((s) => s.name);

    let bankQuery = this.supabase
      .from("interview_question_bank")
      .select("id, skill_name, topic, difficulty, question_prompt, expected_answer_points, follow_up_questions")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (matchedSkills.length > 0) {
      bankQuery = bankQuery.in("skill_name", matchedSkills.slice(0, 8));
    }

    const { data: bankQuestions } = await bankQuery.limit(6);

    // 5. Run AI Analysis via Gemini
    const report = await generateAiResumeJdAnalysis({
      resumeText: resume.extracted_text,
      resumeVersion: resume.version_label || "v1",
      jdText,
      company,
      roleTitle,
      targetRole: input.targetRole || resume.target_role || undefined,
      bankQuestions: bankQuestions || [],
    });

    report.resumeId = resume.id;
    report.jobDescriptionId = effectiveJdId;
    report.applicationId = effectiveAppId;

    // 6. Persist analysis into resume_jd_analyses table
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      resume_id: resume.id,
      job_description_id: effectiveJdId,
      application_id: effectiveAppId,
      company_name: company,
      role_title: roleTitle,
      target_role: input.targetRole || resume.target_role || null,
      analysis_json: report,
    };

    const { data: inserted, error: insertErr } = await this.supabase
      .from("resume_jd_analyses")
      .insert(insertPayload)
      .select("id, created_at")
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Failed to persist resume analysis report: ${insertErr?.message || "Unknown database error"}`);
    }

    report.id = inserted.id;

    return report;
  }

  /**
   * Retrieves an analysis report by ID.
   */
  async getAnalysis(
    userId: string,
    analysisId: string
  ): Promise<AiResumeJdAnalysisReport | null> {
    const { data, error } = await this.supabase
      .from("resume_jd_analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    const report = data.analysis_json as AiResumeJdAnalysisReport;
    return {
      ...report,
      id: data.id,
      resumeId: data.resume_id,
      jobDescriptionId: data.job_description_id,
      applicationId: data.application_id,
      company: data.company_name,
      roleTitle: data.role_title,
      targetRole: data.target_role,
      analyzedAt: data.created_at,
    };
  }

  /**
   * Lists analyses for the user with optional resume / JD filters.
   */
  async listAnalyses(
    userId: string,
    filters?: { resumeId?: string; jdId?: string }
  ): Promise<AiResumeJdAnalysisReport[]> {
    let query = this.supabase
      .from("resume_jd_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.resumeId) {
      query = query.eq("resume_id", filters.resumeId);
    }
    if (filters?.jdId) {
      query = query.eq("job_description_id", filters.jdId);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data.map((row) => {
      const report = row.analysis_json as AiResumeJdAnalysisReport;
      return {
        ...report,
        id: row.id,
        resumeId: row.resume_id,
        jobDescriptionId: row.job_description_id,
        applicationId: row.application_id,
        company: row.company_name,
        roleTitle: row.role_title,
        targetRole: row.target_role,
        analyzedAt: row.created_at,
      };
    });
  }

  /**
   * Connects an analysis report to a job application.
   */
  async connectApplication(
    userId: string,
    analysisId: string,
    applicationId: string | null
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("resume_jd_analyses")
      .update({
        application_id: applicationId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to update application link: ${error.message}`);
    }

    return true;
  }

  /**
   * Explicitly saves a Gemini-generated interview question into the user's interview question bank.
   */
  async saveGeneratedQuestionToBank(
    userId: string,
    question: TargetedInterviewQuestion
  ): Promise<string> {
    const normalizedPrompt = question.questionText.trim();
    // Deterministic external ID for the question based on normalized prompt and skill
    const promptHash = crypto
      .createHash("sha256")
      .update(normalizedPrompt.toLowerCase())
      .digest("hex")
      .slice(0, 32);
    const sourceExternalId = `ai-gen-${promptHash}`;

    // Fast path: Check for existing question for this user to avoid duplicates (M-06)
    const { data: existingQuestion } = await this.supabase
      .from("interview_question_bank")
      .select("id")
      .eq("user_id", userId)
      .eq("question_prompt", normalizedPrompt)
      .maybeSingle();

    if (existingQuestion) {
      return existingQuestion.id;
    }

    const diffMap: Record<string, string> = {
      easy: "basic",
      beginner: "basic",
      medium: "intermediate",
      hard: "advanced",
    };
    const dbDiff = diffMap[question.difficulty] || question.difficulty;

    const allSkills = getAllSkills();
    const matchedSkill = allSkills.find(
      (s) =>
        s.name.toLowerCase() === question.skill.toLowerCase() ||
        s.slug.toLowerCase() === question.skill.toLowerCase()
    );

    const skillSlug = matchedSkill?.slug || question.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const skillCategory = matchedSkill?.category || "software-engineering";
    const title = question.topic
      ? `${question.topic} - Practice Question`
      : question.questionText.slice(0, 50);

    const payload = {
      user_id: userId,
      skill_slug: skillSlug,
      skill_name: matchedSkill?.name || question.skill,
      skill_category: skillCategory,
      topic: question.topic || "Core Concepts",
      question_title: title,
      question_prompt: question.questionText,
      question_type: "conceptual",
      difficulty: dbDiff,
      expected_answer_points: question.expectedAnswerPoints || [],
      follow_up_questions: question.followUpQuestions || [],
      origin: "ai_generated",
      source_name: "AI Generated (JD Alignment)",
      source_external_id: sourceExternalId,
      is_active: true,
    };

    const { data, error } = await this.supabase
      .from("interview_question_bank")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      // Concurrency conflict handling (M-06):
      // If another concurrent request inserted the identical question between the check and insert,
      // Postgres rejects with code 23505 (unique_violation).
      // Catch the conflict and return the existing record's ID without error.
      const isConflict =
        error.code === "23505" ||
        error.message?.includes("duplicate") ||
        error.message?.includes("unique") ||
        error.message?.includes("interview_question_bank");

      if (isConflict) {
        // Query by normalized question prompt
        const { data: conflictRecord } = await this.supabase
          .from("interview_question_bank")
          .select("id")
          .eq("user_id", userId)
          .eq("question_prompt", normalizedPrompt)
          .maybeSingle();

        if (conflictRecord) {
          return conflictRecord.id;
        }

        // Query by deterministic source_external_id
        const { data: extRecord } = await this.supabase
          .from("interview_question_bank")
          .select("id")
          .eq("user_id", userId)
          .eq("source_external_id", sourceExternalId)
          .maybeSingle();

        if (extRecord) {
          return extRecord.id;
        }
      }

      throw new Error(`Failed to save question to bank: ${error.message || "Unknown error"}`);
    }

    if (!data) {
      throw new Error("Failed to save question to bank: No record returned.");
    }

    return data.id;
  }

  /**
   * Deletes an analysis record.
   */
  async deleteAnalysis(userId: string, analysisId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("resume_jd_analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }

    return true;
  }
}
