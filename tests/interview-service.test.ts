import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getAllCategories,
  getAllSkills,
  getSkillBySlug,
  getCategoryById,
} from "@/features/interview/taxonomy";
import {
  seedQuestionBankIfEmpty,
  recordQuestionAnswer,
  getQuestionBankStats,
  getQuestions,
  resolveSkillFilterSlugs,
} from "@/features/interview/service";

describe("Interview Taxonomy", () => {
  it("covers all 11 categories", () => {
    const categories = getAllCategories();
    expect(categories.length).toBe(11);
    const categoryIds = categories.map((c) => c.id);
    expect(categoryIds).toContain("programming-languages");
    expect(categoryIds).toContain("java-backend");
    expect(categoryIds).toContain("databases");
    expect(categoryIds).toContain("frontend");
    expect(categoryIds).toContain("api-and-integration");
    expect(categoryIds).toContain("devops-tools");
    expect(categoryIds).toContain("computer-science");
    expect(categoryIds).toContain("system-design");
    expect(categoryIds).toContain("cloud-ai");
    expect(categoryIds).toContain("career-and-projects");
    expect(categoryIds).toContain("node-ecosystem");
  });

  it("covers all 42 skills and supports both hyphen and underscore lookups", () => {
    const skills = getAllSkills();
    expect(skills.length).toBe(42);
    expect(getSkillBySlug("java")?.name).toBe("Java");
    expect(getSkillBySlug("spring_boot")?.priority).toBe("critical");
    expect(getSkillBySlug("spring-boot")?.priority).toBe("critical");
    expect(getCategoryById("java_backend")?.name).toContain("Java Backend");
    expect(getCategoryById("java-backend")?.name).toContain("Java Backend");
  });
});

describe("Interview Service Logic", () => {
  it("seeds questions idempotently when user question bank is empty", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "interview_question_bank") {
          return {
            select: mockSelect,
            insert: mockInsert,
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const result = await seedQuestionBankIfEmpty(mockSupabase, "user-123");
    expect(result.inserted).toBe(376);
    expect(mockInsert).toHaveBeenCalled();
  });

  it("skips questions that are already seeded", async () => {
    // Simulate all already existing using actual seed external IDs
    const seedQuestions = (await import("../seed-data/interview-question-bank-seed.json")).questions;
    const existing = seedQuestions.map((q) => ({
      source_external_id: q.source_external_id,
    }));
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: existing, error: null }),
    });

    const mockSupabase = {
      from: vi.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
      })),
    } as unknown as SupabaseClient;

    const result = await seedQuestionBankIfEmpty(mockSupabase, "user-123");
    expect(result.inserted).toBe(0);
    expect(result.skipped).toBe(seedQuestions.length);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("records question answer and updates status and revision date", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "q-1",
                status: "strong",
                confidence_score: 5,
                next_revision_at: "2026-11-22",
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    const mockSupabase = {
      from: vi.fn(() => ({
        update: mockUpdate,
      })),
    } as unknown as SupabaseClient;

    const updated = await recordQuestionAnswer(mockSupabase, "user-123", {
      questionId: "a0000000-0000-0000-0000-000000000001",
      status: "strong",
      confidenceScore: 5,
      answerNotes: "Deep dive complete.",
      nextRevisionDays: 7,
    });

    expect(updated.status).toBe("strong");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "strong",
        confidence_score: 5,
        answer_notes: "Deep dive complete.",
      })
    );
  });

  it("computes stats accurately from database rows", async () => {
    const mockData = [
      { skill_category: "java_backend", status: "answered" },
      { skill_category: "java_backend", status: "strong" },
      { skill_category: "java_backend", status: "needs_revision" },
      { skill_category: "programming_languages", status: "strong" },
      { skill_category: "databases", status: "not_started" },
    ];

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      })),
    } as unknown as SupabaseClient;

    const stats = await getQuestionBankStats(mockSupabase, "user-123");
    expect(stats.total).toBe(5);
    expect(stats.answered).toBe(3); // 1 answered + 2 strong
    expect(stats.strong).toBe(2);
    expect(stats.needsRevision).toBe(1);

    const javaCat = stats.categoryStats.find(
      (c) => c.categoryId === "java-backend" || c.categoryId === "java_backend"
    );
    expect(javaCat?.total).toBe(3);
    expect(javaCat?.answered).toBe(2);
  });
});

describe("Interview Question Bank Skill Filter Normalization (M-09)", () => {
  function createMockQuerySupabase() {
    const eqCalls: Array<[string, unknown]> = [];
    const inCalls: Array<[string, unknown[]]> = [];

    const builder: Record<string, unknown> = {
      select: vi.fn().mockImplementation(() => builder),
      eq: vi.fn().mockImplementation((col: string, val: unknown) => {
        eqCalls.push([col, val]);
        return builder;
      }),
      in: vi.fn().mockImplementation((col: string, vals: unknown[]) => {
        inCalls.push([col, vals]);
        return builder;
      }),
      ilike: vi.fn().mockImplementation(() => builder),
      or: vi.fn().mockImplementation(() => builder),
      order: vi.fn().mockImplementation(() => builder),
      range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
    };

    const supabase = {
      from: vi.fn(() => builder),
    } as unknown as SupabaseClient;

    return { supabase, eqCalls, inCalls };
  }

  it("normalizes Spring Boot, spring-boot, and spring_boot to identical stored slug variants", () => {
    expect(resolveSkillFilterSlugs("Spring Boot")).toEqual(["spring-boot", "spring_boot"]);
    expect(resolveSkillFilterSlugs("spring-boot")).toEqual(["spring-boot", "spring_boot"]);
    expect(resolveSkillFilterSlugs("spring_boot")).toEqual(["spring-boot", "spring_boot"]);
  });

  it("resolves multi-word skill names including Hibernate and JPA, REST APIs, Spring Security, and System Design", () => {
    expect(resolveSkillFilterSlugs("Hibernate and JPA")).toEqual(["hibernate-jpa", "hibernate_jpa"]);
    expect(resolveSkillFilterSlugs("Hibernate & JPA")).toEqual(["hibernate-jpa", "hibernate_jpa"]);
    expect(resolveSkillFilterSlugs("REST APIs")).toEqual(["rest-apis", "rest_apis"]);
    expect(resolveSkillFilterSlugs("Spring Security")).toEqual(["spring-security", "spring_security"]);
    expect(resolveSkillFilterSlugs("System Design")).toEqual(["lld", "hld"]);
  });

  it("preserves single-word skills cleanly", () => {
    expect(resolveSkillFilterSlugs("Java")).toEqual(["java"]);
    expect(resolveSkillFilterSlugs("java")).toEqual(["java"]);
    expect(resolveSkillFilterSlugs("SQL")).toEqual(["sql"]);
    expect(resolveSkillFilterSlugs("Docker")).toEqual(["docker"]);
  });

  it("normalizes unknown skills strictly without weakening filtering", () => {
    expect(resolveSkillFilterSlugs("Quantum Computing")).toEqual([
      "quantum-computing",
      "quantum_computing",
    ]);
    expect(resolveSkillFilterSlugs("rust")).toEqual(["rust"]);
  });

  it("returns empty slug list and skips skill filter when skill parameter is missing or blank", async () => {
    expect(resolveSkillFilterSlugs("")).toEqual([]);
    expect(resolveSkillFilterSlugs("   ")).toEqual([]);

    const { supabase, eqCalls, inCalls } = createMockQuerySupabase();
    await getQuestions(supabase, "user-123", { page: 1, pageSize: 20, mode: "skill" });

    expect(eqCalls.find(([col]) => col === "skill_slug")).toBeUndefined();
    expect(inCalls.find(([col]) => col === "skill_slug")).toBeUndefined();
  });

  it("applies normalized skill_slug filters in getQuestions() for multi-word and single-word deep links", async () => {
    const multi = createMockQuerySupabase();
    await getQuestions(multi.supabase, "user-123", { skill: "Spring Boot", page: 1, pageSize: 20, mode: "skill" });
    expect(multi.inCalls).toContainEqual(["skill_slug", ["spring-boot", "spring_boot"]]);

    const hibernate = createMockQuerySupabase();
    await getQuestions(hibernate.supabase, "user-123", { skill: "Hibernate and JPA", page: 1, pageSize: 20, mode: "skill" });
    expect(hibernate.inCalls).toContainEqual(["skill_slug", ["hibernate-jpa", "hibernate_jpa"]]);

    const single = createMockQuerySupabase();
    await getQuestions(single.supabase, "user-123", { skill: "Java", page: 1, pageSize: 20, mode: "skill" });
    expect(single.eqCalls).toContainEqual(["skill_slug", "java"]);
  });
});
