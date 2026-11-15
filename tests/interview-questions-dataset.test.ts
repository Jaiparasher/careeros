import { describe, it, expect } from "vitest";
import catalogData from "../seed-data/interview-skills-catalog.json";
import questionBankSeed from "../seed-data/interview-question-bank-seed.json";

describe("Interview Question Bank Dataset Verification", () => {
  it("contains at least 330 distinct questions", () => {
    expect(questionBankSeed.total_questions).toBeGreaterThanOrEqual(330);
    expect(questionBankSeed.questions.length).toBe(questionBankSeed.total_questions);
    
    // Check uniqueness of external IDs
    const ids = new Set(questionBankSeed.questions.map((q) => q.source_external_id));
    expect(ids.size).toBe(questionBankSeed.questions.length);
  });

  it("covers all 11 catalog categories", () => {
    const catalogCats = catalogData.categories.map((c) => c.slug);
    const datasetCats = new Set(questionBankSeed.questions.map((q) => q.skill_category));

    expect(datasetCats.size).toBe(11);
    for (const cat of catalogCats) {
      expect(datasetCats.has(cat)).toBe(true);
    }
  });

  it("covers all 42 catalog skills without exception", () => {
    const catalogSkills = catalogData.categories.flatMap((c) => c.skills.map((s) => s.slug));
    expect(catalogSkills.length).toBe(42);

    const datasetSkills = new Set(questionBankSeed.questions.map((q) => q.skill_slug));
    expect(datasetSkills.size).toBe(42);

    for (const skill of catalogSkills) {
      expect(datasetSkills.has(skill)).toBe(true);
    }
  });

  it("prioritizes core Java Backend skills with highest volume", () => {
    const skillCounts: Record<string, number> = {};
    for (const q of questionBankSeed.questions) {
      skillCounts[q.skill_slug] = (skillCounts[q.skill_slug] || 0) + 1;
    }

    // Java Backend priority skills
    expect(skillCounts["java"]).toBeGreaterThanOrEqual(10);
    expect(skillCounts["spring-framework"]).toBeGreaterThanOrEqual(10);
    expect(skillCounts["spring-boot"]).toBeGreaterThanOrEqual(12);
    expect(skillCounts["spring-security"]).toBeGreaterThanOrEqual(10);
    expect(skillCounts["hibernate-jpa"]).toBeGreaterThanOrEqual(10);
    expect(skillCounts["microservices"]).toBeGreaterThanOrEqual(10);
    expect(skillCounts["apache-kafka"]).toBeGreaterThanOrEqual(10);
    expect(skillCounts["sql"]).toBeGreaterThanOrEqual(12);
  });

  it("guarantees every question has rubric, sample answer, follow-ups and CareerOS attribution", () => {
    for (const q of questionBankSeed.questions) {
      expect(q.source_name).toBe("CareerOS curated");
      expect(q.question_title.trim().length).toBeGreaterThan(5);
      expect(q.question_prompt.trim().length).toBeGreaterThan(15);
      expect(Array.isArray(q.expected_answer_points)).toBe(true);
      expect(q.expected_answer_points.length).toBeGreaterThanOrEqual(2);
      expect(typeof q.sample_answer).toBe("string");
      expect(q.sample_answer.trim().length).toBeGreaterThan(20);
      expect(Array.isArray(q.follow_up_questions)).toBe(true);
      expect(q.follow_up_questions.length).toBeGreaterThanOrEqual(1);
      expect(q.estimated_minutes).toBeGreaterThan(0);
      expect(["basic", "intermediate", "advanced"]).toContain(q.difficulty);
      expect(["critical", "high", "medium", "low"]).toContain(q.priority);
    }
  });
});
