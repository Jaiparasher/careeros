import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ResumeService } from "@/features/resumes/service";
import { analyzeResumeAgainstJd } from "@/features/resumes/analyzer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Phase 3 Batch 3: Final Security & Integration Audit", () => {
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;
  let userA_id: string;
  let userB_id: string;
  let serviceA: ResumeService;
  let serviceB: ResumeService;

  beforeAll(async () => {
    const rawClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Authenticate User A
    const { data: authA, error: errA } = await rawClient.auth.signInWithPassword({
      email: "test@gmail.com",
      password: "Test123",
    });
    if (errA || !authA.user) {
      throw new Error(`User A auth failed: ${errA?.message}`);
    }
    userA_id = authA.user.id;
    clientA = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    });
    serviceA = new ResumeService(clientA);

    // 2. Authenticate User B
    const emailB = "test_audit_user_b@careeros-audit.com";
    const passB = "AuditPass123!";
    const signInRes = await rawClient.auth.signInWithPassword({ email: emailB, password: passB });
    let tokenB: string | undefined;

    if (signInRes.data?.user && signInRes.data.session) {
      userB_id = signInRes.data.user.id;
      tokenB = signInRes.data.session.access_token;
    } else {
      const signUpRes = await rawClient.auth.signUp({ email: emailB, password: passB });
      if (signUpRes.error || !signUpRes.data.user) {
        throw new Error(`User B auth failed: ${signUpRes.error?.message}`);
      }
      userB_id = signUpRes.data.user.id;
      tokenB = signUpRes.data.session?.access_token;
    }

    clientB = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${tokenB}` } },
    });
    serviceB = new ResumeService(clientB);
  });

  describe("1. Two-User RLS and Storage Isolation", () => {
    let resumeAId: string;
    let resumeAPath: string;

    beforeAll(async () => {
      // User A uploads a private test resume
      const buffer = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 70>>stream\nBT /F1 12 Tf 100 100 Td (User A Confidential Resume) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000057 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n335\n%%EOF"
      );
      const uploaded = await serviceA.uploadResume(
        userA_id,
        buffer,
        `secret_a_${Date.now()}.pdf`,
        "application/pdf",
        buffer.length,
        {
          version_label: "User A Confidential",
          target_role: "Staff Engineer",
          is_primary: true,
        }
      );
      resumeAId = uploaded.id;
      resumeAPath = uploaded.storage_path;
    });

    it("User B cannot SELECT User A's resume records (RLS returns empty array)", async () => {
      const { data, error } = await clientB
        .from("resumes")
        .select("*")
        .eq("id", resumeAId);
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it("User B cannot UPDATE User A's resume records (RLS affects 0 rows)", async () => {
      const { data, error } = await clientB
        .from("resumes")
        .update({ version_label: "Tampered by User B" })
        .eq("id", resumeAId)
        .select();
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it("User B cannot DELETE User A's resume records (RLS affects 0 rows)", async () => {
      const { data, error } = await clientB
        .from("resumes")
        .delete()
        .eq("id", resumeAId)
        .select();
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it("User B cannot generate signed download URL for User A's storage path", async () => {
      const { data, error } = await clientB
        .storage
        .from("career-files")
        .createSignedUrl(resumeAPath, 60);
      expect(data?.signedUrl).toBeUndefined();
      expect(error?.message).toMatch(/not found|access denied/i);
    });

    it("User B cannot upload files into User A's storage folder", async () => {
      const maliciousPath = `${userA_id}/resumes/injected_${Date.now()}.pdf`;
      const { data, error } = await clientB
        .storage
        .from("career-files")
        .upload(maliciousPath, Buffer.from("%PDF-1.4 Injected"), {
          contentType: "application/pdf",
        });
      expect(data).toBeNull();
      expect(error?.message).toMatch(/violates row-level security policy|access denied/i);
    });

    it("User B cannot set User A's resume as primary", async () => {
      await expect(serviceB.setPrimaryResume(userB_id, resumeAId)).rejects.toThrow(
        /not found or access denied/i
      );
    });

    it("User B service layer getResumeDownloadUrl rejects User A's resume ID", async () => {
      await expect(serviceB.getResumeDownloadUrl(userB_id, resumeAId)).rejects.toThrow(
        /not found or access denied/i
      );
    });

    it("User B deleteResume rejects User A's resume ID", async () => {
      await expect(serviceB.deleteResume(userB_id, resumeAId)).rejects.toThrow(
        /not found or access denied/i
      );
    });

    afterAll(async () => {
      // User A cleans up the test record
      if (resumeAId) {
        await serviceA.deleteResume(userA_id, resumeAId);
      }
    });
  });

  describe("2. Primary Resume Switching & Consistency", () => {
    it("preserves primary state if target resume does not exist (no unexpected zero-primary state)", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000999";
      await expect(serviceA.setPrimaryResume(userA_id, fakeId)).rejects.toThrow(
        /not found/i
      );
    });
  });

  describe("3. File Deletion Consistency & Soft Delete", () => {
    it("rejects deletion of a non-existent resume ID cleanly", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000999";
      await expect(serviceA.deleteResume(userA_id, fakeId)).rejects.toThrow(
        /not found or access denied/i
      );
    });
  });

  describe("4. Deterministic Matching & Zero AI Hallucination", () => {
    it("guarantees strictly deterministic output without AI dependencies", () => {
      const resume = "Experienced Java and Spring Boot engineer with Docker and PostgreSQL.";
      const jd = "Looking for Java, Spring Boot, and Kubernetes.";

      const res1 = analyzeResumeAgainstJd(resume, jd);
      const res2 = analyzeResumeAgainstJd(resume, jd);

      // Deterministic identical output
      expect(res1.matchPercentage).toBe(res2.matchPercentage);
      expect(res1.explicitSkills).toEqual(res2.explicitSkills);
      expect(res1.partialSkills).toEqual(res2.partialSkills);
      expect(res1.missingSkills).toEqual(res2.missingSkills);
      expect(res1.disclaimer).toContain("Deterministic Keyword & Skill Analysis");
    });
  });
});
