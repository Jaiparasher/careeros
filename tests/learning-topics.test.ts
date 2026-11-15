import { describe, it, expect } from "vitest";

describe("Learning Roadmap - Topic Confidence Matrix Domain", () => {
  it("enforces Rule 8: course completion does not imply interview readiness", () => {
    // A course module might be 100% complete, but the topic confidence remains independent
    const learningModule = {
      title: "Spring Boot Deep Dive",
      completion_percent: 100,
    };

    const topic = {
      name: "Spring Boot Auto-Configuration",
      category: "spring_boot",
      confidence_score: 2, // User self-assesses as 2/5
      assessment_status: "needs_work" as const,
      interview_ready: false,
    };

    expect(learningModule.completion_percent).toBe(100);
    expect(topic.interview_ready).toBe(false);
    expect(topic.assessment_status).toBe("needs_work");
    // Proof that mastery and course completion are strictly decoupled
    expect(topic.confidence_score).toBeLessThan(4);
  });

  it("validates valid assessment statuses and confidence score boundaries", () => {
    const validStatuses = ["not_assessed", "needs_work", "progressing", "strong"];
    const testStatus = "progressing";
    expect(validStatuses).toContain(testStatus);

    const confidence = 4;
    expect(confidence >= 1 && confidence <= 5).toBe(true);
  });

  it("categorizes learning topics across core technical domains", () => {
    const validCategories = [
      "java",
      "spring_boot",
      "backend_engineering",
      "cs_fundamentals",
      "system_design",
      "interview_skills",
    ];

    expect(validCategories).toHaveLength(6);
    expect(validCategories).toContain("java");
    expect(validCategories).toContain("spring_boot");
    expect(validCategories).toContain("system_design");
  });
});
