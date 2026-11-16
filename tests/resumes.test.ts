import { describe, it, expect } from "vitest";
import {
  ALLOWED_RESUME_MIME_TYPES,
  MAX_RESUME_FILE_SIZE_BYTES,
  uploadResumeInputSchema,
  updateResumeTextSchema,
  jobDescriptionInputSchema,
} from "@/features/resumes/schema";
import {
  cleanExtractedText,
  extractTextFromPdf,
  extractTextFromDocx,
  extractResumeText,
} from "@/features/resumes/text-extractor";
import { analyzeResumeAgainstJd } from "@/features/resumes/analyzer";

describe("Phase 3 Batch 3: Resume & JD Schemas", () => {
  it("validates allowed resume MIME types", () => {
    expect(ALLOWED_RESUME_MIME_TYPES).toContain("application/pdf");
    expect(ALLOWED_RESUME_MIME_TYPES).toContain(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(ALLOWED_RESUME_MIME_TYPES).not.toContain("text/plain");
    expect(ALLOWED_RESUME_MIME_TYPES).not.toContain("application/zip");
  });

  it("enforces 10MB maximum file size limit", () => {
    expect(MAX_RESUME_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it("validates uploadResumeInputSchema properly", () => {
    const valid = uploadResumeInputSchema.parse({
      version_label: "SDE II - 2026",
      target_role: "Java Backend Engineer",
      notes: "Tailored for distributed systems",
      is_primary: true,
    });
    expect(valid.version_label).toBe("SDE II - 2026");
    expect(valid.is_primary).toBe(true);

    // Empty version label should fail
    expect(() =>
      uploadResumeInputSchema.parse({
        version_label: "   ",
      })
    ).toThrow();
  });

  it("validates updateResumeTextSchema", () => {
    const valid = updateResumeTextSchema.parse({
      id: "a0000000-0000-0000-0000-000000000001",
      extracted_text: "Experienced Java and Spring Boot engineer with 4 years at TCS.",
    });
    expect(valid.extracted_text).toContain("TCS");

    // Empty text should fail
    expect(() =>
      updateResumeTextSchema.parse({
        id: "a0000000-0000-0000-0000-000000000001",
        extracted_text: "   ",
      })
    ).toThrow();
  });

  it("validates jobDescriptionInputSchema", () => {
    const valid = jobDescriptionInputSchema.parse({
      company: "Google",
      role_title: "Software Engineer II",
      raw_text:
        "We are looking for a Senior Software Engineer with strong expertise in Java, Spring Boot, Microservices, and Apache Kafka.",
    });
    expect(valid.company).toBe("Google");
    expect(valid.raw_text.length).toBeGreaterThan(10);

    // Short text should fail
    expect(() =>
      jobDescriptionInputSchema.parse({
        company: "Google",
        role_title: "SWE",
        raw_text: "Too short",
      })
    ).toThrow();
  });
});

describe("Phase 3 Batch 3: Resume Text Extractor", () => {
  it("cleans extracted text by normalizing newlines and removing null bytes", () => {
    const raw = "Hello\0 World\r\n\r\n\r\n\r\nNext Paragraph\rEnd";
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).not.toContain("\0");
    expect(cleaned).not.toContain("\r");
    expect(cleaned).toBe("Hello World\n\nNext Paragraph\nEnd");
  });

  it("handles empty PDF buffer safely with failed status", async () => {
    const result = await extractTextFromPdf(Buffer.from(""));
    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.errorMessage).toContain("empty");
  });

  it("handles malformed/corrupted PDF buffer safely without crashing", async () => {
    const badPdf = Buffer.from("NOT_A_PDF_DOCUMENT_CONTENT");
    const result = await extractTextFromPdf(badPdf);
    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.errorMessage).toContain("valid PDF header");
  });

  it("handles empty DOCX buffer safely with failed status", async () => {
    const result = await extractTextFromDocx(Buffer.from(""));
    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.errorMessage).toContain("empty");
  });

  it("handles corrupt DOCX safely without crashing", async () => {
    const badDocx = Buffer.from("RANDOM_CORRUPT_BYTES");
    const result = await extractTextFromDocx(badDocx);
    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.errorMessage).toContain("ZIP/DOCX archive");
  });

  it("rejects unsupported MIME types gracefully in router", async () => {
    const result = await extractResumeText(Buffer.from("some text"), "text/plain");
    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.errorMessage).toContain("Unsupported MIME type");
  });
});

describe("Phase 3 Batch 3: Deterministic Resume / JD Alignment Engine", () => {
  const sampleResume = `
    Dhruv - Senior Software Engineer
    Core Skills: Java, Spring Boot, Spring Core, Hibernate, PostgreSQL, Docker, Git, REST APIs, Microservices, JUnit, DBMS.
    Experience:
    Tata Consultancy Services (TCS) - Full Stack Developer
    - Architected scalable microservices using Java 17 and Spring Boot for high-throughput enterprise banking.
    - Designed RESTful APIs handling over 2M requests daily with sub-50ms latency.
    - Containerized backend workloads with Docker and orchestrated continuous integration pipelines.
    - Optimized PostgreSQL database queries, reducing query response times by 35%.
  `;

  it("detects explicit skill matches accurately", () => {
    const jd = `
      Required Qualifications:
      - 3+ years experience with Java, Spring Boot, and REST APIs.
      - Experience with Microservices architecture and PostgreSQL databases.
      - Proficiency in Docker containerization and Git version control.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd, {
      company: "Acme Corp",
      roleTitle: "Backend Engineer",
      resumeVersion: "v1 - TCS Experience",
    });

    const explicitSlugs = analysis.explicitSkills.map((s) => s.slug);
    expect(explicitSlugs).toContain("java");
    expect(explicitSlugs).toContain("spring-boot");
    expect(explicitSlugs).toContain("rest-apis");
    expect(explicitSlugs).toContain("microservices");
    expect(explicitSlugs).toContain("docker");
    expect(explicitSlugs).toContain("git-github");
  });

  it("detects partially demonstrated skills with helpful rationale", () => {
    const jd = `
      We are looking for engineers with:
      - Java and Spring Boot experience.
      - Experience implementing Spring Security and OAuth2 authentication.
      - Experience with Kubernetes cluster deployments.
      - Experience with Apache Kafka event streaming.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd);

    // Spring Security is partial because candidate has Java + Spring Boot + REST APIs
    const partialSlugs = analysis.partialSkills.map((s) => s.slug);
    expect(partialSlugs).toContain("spring-security");

    const secMatch = analysis.partialSkills.find((s) => s.slug === "spring-security");
    expect(secMatch?.explanation).toContain("Found related competencies");

    // Kubernetes is partial because candidate has Docker
    expect(partialSlugs).toContain("kubernetes");

    // Apache Kafka is partial because candidate has Microservices
    expect(partialSlugs).toContain("apache-kafka");
  });

  it("identifies missing skills that candidate has zero evidence of", () => {
    const jd = `
      Qualifications:
      - Strong Python and C++ programming.
      - Experience with MongoDB and Firebase.
      - Next.js and Redux Toolkit frontend state management.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd);
    const missingSlugs = analysis.missingSkills.map((s) => s.slug);
    const partialSlugs = analysis.partialSkills.map((s) => s.slug);

    // Frontend skills are completely absent from candidate's backend resume
    expect(missingSlugs).toContain("nextjs");
    expect(missingSlugs).toContain("redux");

    // C++ is classified as partial because candidate has strong Java language foundation
    expect(partialSlugs).toContain("cpp");
  });

  it("extracts missing domain technical keywords from JD", () => {
    const jd = `
      The ideal candidate will implement caching with Redis, configure Grafana and Prometheus monitoring,
      and ensure resilient architecture using circuit breaker patterns and CQRS.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd);
    expect(analysis.missingKeywords).toContain("redis");
    expect(analysis.missingKeywords).toContain("grafana");
    expect(analysis.missingKeywords).toContain("prometheus");
    expect(analysis.missingKeywords).toContain("circuit breaker");
  });

  it("generates actionable resume bullet improvements using Google X-Y-Z formula", () => {
    const jd = `
      Required: Java, Spring Boot, Apache Kafka, Redis.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd);
    expect(analysis.bulletSuggestions.length).toBeGreaterThan(0);
    const hasXyzAdvice = analysis.bulletSuggestions.some((s) =>
      s.includes("Google X-Y-Z formula")
    );
    expect(hasXyzAdvice).toBe(true);
  });

  it("maps missing/partial skills to CareerOS Interview Bank topics with valid URLs", () => {
    const jd = `
      Looking for Spring Security, Apache Kafka, and Kubernetes engineers.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd);
    expect(analysis.recommendedInterviewTopics.length).toBeGreaterThan(0);

    for (const topic of analysis.recommendedInterviewTopics) {
      expect(topic.interviewBankUrl).toMatch(/^\/interview-questions\?category=/);
      expect(topic.topicName).toBeDefined();
      expect(topic.reason).toBeDefined();
    }
  });

  it("computes deterministic match score and includes non-ATS disclaimer", () => {
    const jd = `
      Requirements: Java, Spring Boot, Microservices, REST APIs, Docker, Git.
    `;

    const analysis = analyzeResumeAgainstJd(sampleResume, jd);
    expect(analysis.matchPercentage).toBeGreaterThanOrEqual(80);
    expect(analysis.disclaimer).toContain("Deterministic Keyword & Skill Analysis");
    expect(analysis.disclaimer).toContain("not an official proprietary ATS score");
  });
});
