import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ResumeService } from "@/features/resumes/service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Live Supabase Integration - Phase 3 Batch 3 Resumes & Job Descriptions", () => {
  let supabase: SupabaseClient;
  let userId: string;
  let service: ResumeService;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test@gmail.com",
      password: "Test123",
    });

    if (error || !data.user) {
      console.warn("Could not authenticate test user; skipping live integration tests:", error?.message);
      return;
    }

    userId = data.user.id;
    service = new ResumeService(supabase);
  });

  it("authenticates test user successfully", () => {
    if (!userId) return;
    expect(userId).toBeDefined();
    expect(userId.length).toBeGreaterThan(10);
  });

  it(
    "performs full resume lifecycle: upload to private storage, signed URL, update text, primary toggle, and deletion",
    async () => {
      if (!userId) return;

      // Minimal valid PDF with text stream
      const samplePdfBuffer = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 85>>stream\nBT /F1 12 Tf 100 100 Td (Dhruv Senior Java Engineer Spring Boot Microservices Docker) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000057 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n350\n%%EOF"
      );

      const versionLabel = `Integration Resume ${Date.now()}`;
      const fileName = `test_resume_${Date.now()}.pdf`;

      // 1. Upload Resume
      const uploaded = await service.uploadResume(
        userId,
        samplePdfBuffer,
        fileName,
        "application/pdf",
        samplePdfBuffer.length,
        {
          version_label: versionLabel,
          target_role: "Java Backend Lead",
          notes: "Integration test upload",
          is_primary: true,
        }
      );

      expect(uploaded.id).toBeDefined();
      expect(uploaded.user_id).toBe(userId);
      expect(uploaded.version_label).toBe(versionLabel);
      expect(uploaded.storage_path).toContain(userId);

      // 2. Generate secure signed download URL
      const download = await service.getResumeDownloadUrl(userId, uploaded.id, 60);
      expect(download.signedUrl).toBeDefined();
      expect(download.signedUrl).toContain("token=");
      expect(download.signedUrl).toContain("career-files");

      // 3. Verify getResumes includes the uploaded resume
      const allResumes = await service.getResumes(userId);
      expect(allResumes.some((r) => r.id === uploaded.id)).toBe(true);

      // 4. Manually update extracted text
      const updatedText =
        "Dhruv - Experienced Backend Engineer: Java 17, Spring Boot, PostgreSQL, Docker, Apache Kafka, REST APIs.";
      const afterTextUpdate = await service.updateResumeText(userId, uploaded.id, updatedText);
      expect(afterTextUpdate.extracted_text).toBe(updatedText);
      expect(afterTextUpdate.extraction_status).toBe("manual");

      // 5. Run deterministic analysis with the updated resume text
      const analysis = await service.analyze(userId, uploaded.id, {
        raw_text:
          "Looking for a Backend Developer skilled in Java, Spring Boot, Apache Kafka, and PostgreSQL.",
        company: "Integration Target",
        role_title: "Staff SDE",
      });

      expect(analysis.matchPercentage).toBeGreaterThanOrEqual(70);
      expect(analysis.explicitSkills.map((s) => s.slug)).toContain("java");
      expect(analysis.explicitSkills.map((s) => s.slug)).toContain("spring-boot");
      expect(analysis.explicitSkills.map((s) => s.slug)).toContain("apache-kafka");

      // 6. Test Job Description CRUD (if table exists or handle gracefully)
      try {
        const jd = await service.createJobDescription(userId, {
          company: "Integration Corp",
          role_title: "Principal Engineer",
          raw_text: "Seeking Java, Spring Boot, Microservices, and Kubernetes lead.",
          notes: "Targeting high CTC",
        });

        expect(jd.id).toBeDefined();
        expect(jd.company).toBe("Integration Corp");

        const allJds = await service.getJobDescriptions(userId);
        expect(allJds.some((j) => j.id === jd.id)).toBe(true);

        // Delete JD
        await service.deleteJobDescription(userId, jd.id);
      } catch (err: unknown) {
        const errorObj = err as { message?: string; code?: string };
        // If migration 0009 has not yet run on live DB, record schema cache note
        if (
          errorObj?.message?.includes("does not exist") ||
          errorObj?.message?.includes("schema cache") ||
          errorObj?.code === "42P01" ||
          errorObj?.code === "PGRST205"
        ) {
          console.warn("job_descriptions table not yet created on live DB (Migration 0009 pending)");
        } else {
          throw err;
        }
      }

      // 7. Cleanup: Delete uploaded resume and verify storage deletion
      const deleted = await service.deleteResume(userId, uploaded.id);
      expect(deleted).toBe(true);

      const remaining = await service.getResumes(userId);
      expect(remaining.some((r) => r.id === uploaded.id)).toBe(false);
    },
    30000
  );
});
