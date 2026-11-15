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
} from "@/features/interview/service";

describe("Interview Taxonomy", () => {
  it("covers all 11 categories", () => {
    const categories = getAllCategories();
    expect(categories.length).toBe(11);
    const categoryIds = categories.map((c) => c.id);
    expect(categoryIds).toContain("programming_languages");
    expect(categoryIds).toContain("java_backend");
    expect(categoryIds).toContain("databases");
    expect(categoryIds).toContain("frontend");
    expect(categoryIds).toContain("api_and_integration");
    expect(categoryIds).toContain("devops_tools");
    expect(categoryIds).toContain("computer_science");
    expect(categoryIds).toContain("system_design");
    expect(categoryIds).toContain("cloud_ai");
    expect(categoryIds).toContain("career_and_projects");
    expect(categoryIds).toContain("node_ecosystem");
  });

  it("covers all 42 skills", () => {
    const skills = getAllSkills();
    expect(skills.length).toBe(42);
    expect(getSkillBySlug("java")?.name).toBe("Java");
    expect(getSkillBySlug("spring_boot")?.priority).toBe("critical");
    expect(getCategoryById("java_backend")?.name).toContain("Java Backend");
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

    const javaCat = stats.categoryStats.find((c) => c.categoryId === "java_backend");
    expect(javaCat?.total).toBe(3);
    expect(javaCat?.answered).toBe(2);
  });
});
