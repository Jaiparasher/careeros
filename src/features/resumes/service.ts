import { SupabaseClient } from "@supabase/supabase-js";
import {
  ALLOWED_RESUME_MIME_TYPES,
  MAX_RESUME_FILE_SIZE_BYTES,
  ResumeRow,
  JobDescriptionInput,
  JobDescriptionRow,
  ResumeJdAnalysis,
  UploadResumeInput,
} from "./schema";
import { extractResumeText } from "./text-extractor";
import { analyzeResumeAgainstJd } from "./analyzer";
import { getAllSkills } from "@/features/interview/taxonomy";

const BUCKET_NAME = "career-files";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class ResumeService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Uploads a resume file to private Supabase Storage, extracts text,
   * handles primary resume uniqueness, and persists metadata.
   */
  async uploadResume(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    fileSize: number,
    metadata: UploadResumeInput
  ): Promise<ResumeRow> {
    if (!ALLOWED_RESUME_MIME_TYPES.includes(mimeType as (typeof ALLOWED_RESUME_MIME_TYPES)[number])) {
      throw new Error(
        `Invalid file type "${mimeType}". Only PDF and Word (.docx) documents are permitted.`
      );
    }

    if (fileSize <= 0) {
      throw new Error("File is empty (0 bytes).");
    }

    if (fileSize > MAX_RESUME_FILE_SIZE_BYTES) {
      throw new Error(
        `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.`
      );
    }

    const cleanName = sanitizeFileName(fileName);
    const fileUuid = crypto.randomUUID();
    // Path MUST be scoped under <userId>/resumes/<uuid>/<fileName> for RLS storage policy
    const storagePath = `${userId}/resumes/${fileUuid}/${cleanName}`;

    // 1. Upload to Supabase private storage
    const { error: uploadError } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 2. Perform server-side text extraction
    let extractionStatus: "completed" | "failed" = "failed";
    let extractedText: string | null = null;
    try {
      const extraction = await extractResumeText(fileBuffer, mimeType);
      extractionStatus = extraction.status;
      extractedText = extraction.text || null;
    } catch {
      extractionStatus = "failed";
      extractedText = null;
    }

    // 3. If marking as primary, clear existing primary flags for this user
    if (metadata.is_primary) {
      try {
        await this.supabase
          .from("resumes")
          .update({ is_primary: false })
          .eq("user_id", userId)
          .is("deleted_at", null);
      } catch {
        // column may not exist yet if unmigrated
      }
    }

    // 4. Insert resume row into database
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      file_name: cleanName,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size_bytes: fileSize,
      version_label: metadata.version_label,
      extracted_text: extractedText,
      extraction_status: extractionStatus,
      is_primary: metadata.is_primary ?? false,
      target_role: metadata.target_role || null,
      notes: metadata.notes || null,
    };

    let { data, error } = await this.supabase
      .from("resumes")
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if extended columns are not yet in live DB
    if (error && (error.message.includes("column") || error.code === "42703")) {
      const basePayload = {
        user_id: userId,
        file_name: cleanName,
        storage_path: storagePath,
        mime_type: mimeType,
        file_size_bytes: fileSize,
        version_label: metadata.version_label,
        extracted_text: extractedText,
      };
      const res = await this.supabase
        .from("resumes")
        .insert(basePayload)
        .select()
        .single();
      data = res.data;
      error = res.error;
    }

    if (error || !data) {
      // Clean up uploaded file from storage if DB insert fails
      await this.supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      throw new Error(`Database record creation failed: ${error?.message || "Unknown error"}`);
    }

    return this.mapResumeRow(data);
  }

  /**
   * Fetches all active resumes for the authenticated user.
   */
  async getResumes(userId: string): Promise<ResumeRow[]> {
    const query = this.supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null);

    const { data, error } = await query;
    if (error) {
      if (error.message.includes("deleted_at")) {
        const fallback = await this.supabase
          .from("resumes")
          .select("*")
          .eq("user_id", userId);
        return (fallback.data || []).map((r) => this.mapResumeRow(r));
      }
      throw new Error(`Failed to fetch resumes: ${error.message}`);
    }

    const mapped = (data || []).map((r) => this.mapResumeRow(r));
    // Sort: primary first, then newest first
    return mapped.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  /**
   * Fetches a single resume by ID.
   */
  async getResumeById(userId: string, resumeId: string): Promise<ResumeRow | null> {
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapResumeRow(data);
  }

  /**
   * Generates a temporary signed download URL for the resume file.
   * Never exposes public URLs.
   */
  async getResumeDownloadUrl(
    userId: string,
    resumeId: string,
    expiresInSeconds = 60
  ): Promise<{ signedUrl: string; fileName: string }> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) {
      throw new Error("Resume not found or access denied.");
    }

    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(resume.storage_path, expiresInSeconds, {
        download: resume.file_name,
      });

    if (error || !data?.signedUrl) {
      throw new Error(`Could not generate secure download link: ${error?.message || "Storage error"}`);
    }

    return {
      signedUrl: data.signedUrl,
      fileName: resume.file_name,
    };
  }

  /**
   * Sets one resume as primary, resetting any existing primary resume for this user.
   * Uses an atomic PostgreSQL RPC when available, with a safe single-check fallback.
   */
  async setPrimaryResume(userId: string, resumeId: string): Promise<ResumeRow> {
    // 1. First verify target resume exists, belongs to user, and is not deleted
    const target = await this.getResumeById(userId, resumeId);
    if (!target) {
      throw new Error("Target resume not found or access denied.");
    }

    // 2. Try atomic database RPC function first
    const { data: rpcData, error: rpcError } = await this.supabase.rpc("set_primary_resume", {
      p_resume_id: resumeId,
    });

    if (!rpcError && rpcData) {
      return this.mapResumeRow(rpcData);
    }

    // 3. Fallback if RPC is not yet created in live database (Migration 0009 pending)
    try {
      await this.supabase
        .from("resumes")
        .update({ is_primary: false })
        .eq("user_id", userId)
        .is("deleted_at", null);
    } catch {
      // Column may not exist in schema cache
    }

    let { data, error } = await this.supabase
      .from("resumes")
      .update({ is_primary: true })
      .eq("id", resumeId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error && (error.message.includes("is_primary") || error.message.includes("column") || error.code === "PGRST204")) {
      const res = await this.supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("user_id", userId)
        .single();
      data = res.data;
      error = res.error;
    }

    if (error || !data) {
      throw new Error(`Failed to set primary resume: ${error?.message || "Not found"}`);
    }

    return this.mapResumeRow(data);
  }

  /**
   * Updates extracted text manually (e.g. when automatic parsing failed or user made edits).
   */
  async updateResumeText(
    userId: string,
    resumeId: string,
    newText: string
  ): Promise<ResumeRow> {
    let { data, error } = await this.supabase
      .from("resumes")
      .update({
        extracted_text: newText,
        extraction_status: "manual",
      })
      .eq("id", resumeId)
      .eq("user_id", userId)
      .select()
      .single();

    // Fallback if extraction_status is not yet in live DB schema cache
    if (error && (error.message.includes("extraction_status") || error.message.includes("column") || error.code === "PGRST204")) {
      const res = await this.supabase
        .from("resumes")
        .update({
          extracted_text: newText,
        })
        .eq("id", resumeId)
        .eq("user_id", userId)
        .select()
        .single();
      data = res.data ? { ...res.data, extraction_status: "manual" } : res.data;
      error = res.error;
    }

    if (error || !data) {
      throw new Error(`Failed to update resume text: ${error?.message || "Not found"}`);
    }

    return this.mapResumeRow(data);
  }

  /**
   * Deletes a resume: removes from storage and soft-deletes or hard-deletes DB record.
   * Reports storage/database failures accurately to prevent orphaned files.
   */
  async deleteResume(userId: string, resumeId: string): Promise<boolean> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) {
      throw new Error("Resume not found or access denied.");
    }

    if (resume.deleted_at) {
      throw new Error("Resume has already been deleted.");
    }

    // 1. Delete from private storage if storage path exists
    if (resume.storage_path) {
      const { error: storageError } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove([resume.storage_path]);
      if (storageError) {
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }
    }

    // 2. Mark deleted in database
    let { error } = await this.supabase
      .from("resumes")
      .update({ deleted_at: new Date().toISOString(), is_primary: false })
      .eq("id", resumeId)
      .eq("user_id", userId);

    if (error && (error.message.includes("deleted_at") || error.message.includes("column"))) {
      // Hard delete fallback if deleted_at column is not present
      const hardDel = await this.supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId)
        .eq("user_id", userId);
      error = hardDel.error;
    }

    if (error) {
      throw new Error(`Database record deletion failed: ${error.message}`);
    }

    return true;
  }

  /**
   * Fetches all saved job descriptions for user.
   */
  async getJobDescriptions(userId: string): Promise<JobDescriptionRow[]> {
    const { data, error } = await this.supabase
      .from("job_descriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.message.includes("does not exist") || error.code === "42P01") {
        return [];
      }
      throw new Error(`Failed to fetch job descriptions: ${error.message}`);
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      company: row.company,
      role_title: row.role_title,
      target_role: row.target_role || null,
      raw_text: row.raw_text,
      extracted_skills: row.extracted_skills || [],
      application_id: row.application_id || null,
      resume_id: row.resume_id || null,
      notes: row.notes || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Creates a saved job description.
   */
  async createJobDescription(
    userId: string,
    input: JobDescriptionInput
  ): Promise<JobDescriptionRow> {
    // Detect skills in JD text
    const allSkills = getAllSkills();
    const lower = input.raw_text.toLowerCase();
    const detected = allSkills
      .filter((s) => lower.includes(s.name.toLowerCase()) || lower.includes(s.slug))
      .map((s) => s.slug);

    const payload = {
      user_id: userId,
      company: input.company,
      role_title: input.role_title,
      target_role: input.target_role || null,
      raw_text: input.raw_text,
      extracted_skills: detected,
      application_id: input.application_id || null,
      resume_id: input.resume_id || null,
      notes: input.notes || "",
    };

    const { data, error } = await this.supabase
      .from("job_descriptions")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save job description: ${error?.message || "Unknown error"}`);
    }

    return data as JobDescriptionRow;
  }

  /**
   * Updates an existing job description.
   */
  async updateJobDescription(
    userId: string,
    jdId: string,
    input: Partial<JobDescriptionInput>
  ): Promise<JobDescriptionRow> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.company !== undefined) payload.company = input.company;
    if (input.role_title !== undefined) payload.role_title = input.role_title;
    if (input.target_role !== undefined) payload.target_role = input.target_role;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.application_id !== undefined) payload.application_id = input.application_id;
    if (input.resume_id !== undefined) payload.resume_id = input.resume_id;

    if (input.raw_text !== undefined) {
      payload.raw_text = input.raw_text;
      const allSkills = getAllSkills();
      const lower = input.raw_text.toLowerCase();
      payload.extracted_skills = allSkills
        .filter((s) => lower.includes(s.name.toLowerCase()) || lower.includes(s.slug))
        .map((s) => s.slug);
    }

    const { data, error } = await this.supabase
      .from("job_descriptions")
      .update(payload)
      .eq("id", jdId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update job description: ${error?.message || "Not found"}`);
    }

    return data as JobDescriptionRow;
  }

  /**
   * Deletes a job description.
   */
  async deleteJobDescription(userId: string, jdId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("job_descriptions")
      .delete()
      .eq("id", jdId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete job description: ${error.message}`);
    }

    return true;
  }

  /**
   * Runs deterministic alignment analysis between a resume and JD.
   */
  async analyze(
    userId: string,
    resumeId: string,
    jdInput: { raw_text: string; company?: string; role_title?: string; jdId?: string }
  ): Promise<ResumeJdAnalysis> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) {
      throw new Error("Resume not found or access denied.");
    }

    if (!resume.extracted_text || resume.extracted_text.trim().length === 0) {
      throw new Error(
        "The selected resume has no extracted text. Please paste text manually in the Extracted Text editor before analyzing."
      );
    }

    return analyzeResumeAgainstJd(resume.extracted_text, jdInput.raw_text, {
      company: jdInput.company || "Target Company",
      roleTitle: jdInput.role_title || "Target Role",
      resumeVersion: resume.version_label,
    });
  }

  private mapResumeRow(row: Record<string, unknown>): ResumeRow {
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      file_name: String(row.file_name),
      storage_path: String(row.storage_path),
      mime_type: String(row.mime_type),
      file_size_bytes: Number(row.file_size_bytes),
      version_label: String(row.version_label || "v1"),
      extracted_text: row.extracted_text ? String(row.extracted_text) : null,
      extraction_status: (row.extraction_status as ResumeRow["extraction_status"]) || (row.extracted_text ? "completed" : "pending"),
      is_primary: Boolean(row.is_primary),
      target_role: row.target_role ? String(row.target_role) : null,
      notes: row.notes ? String(row.notes) : null,
      created_at: String(row.created_at),
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    };
  }
}
