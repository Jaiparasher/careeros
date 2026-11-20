import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateDay31Prioritization,
  type AdaptiveCandidateItem,
} from "@/features/planner/workload";
import {
  getUserStudyCapacity,
  toggleTaskStatus,
  rescheduleTask,
  generateSprintPreview,
} from "@/features/planner/service";

describe("Planner Workload: Day 31+ Adaptive Prioritization", () => {
  it("prioritizes candidate items based on transparent 5-factor weighting", () => {
    const candidates: AdaptiveCandidateItem[] = [
      {
        id: "item-low-priority",
        title: "Basic CSS syntax",
        type: "interview_question",
        roleRelevance: 0.2, // 6 pts
        confidenceScore: 5, // 5 pts (mastered)
        skillImportance: "low", // 5 pts
        isRevisionDue: false, // 0 pts
        daysUntilInterview: null, // 0 pts
        // Total ~16 pts
      },
      {
        id: "item-critical-gap",
        title: "Spring Security Architecture & Filter Chain",
        type: "interview_question",
        roleRelevance: 1.0, // 30 pts
        confidenceScore: 1, // 25 pts (large knowledge gap)
        skillImportance: "critical", // 20 pts
        isRevisionDue: true, // 12 pts
        daysUntilInterview: 5, // 8 pts
        // Total ~95 pts
      },
      {
        id: "item-overdue-dsa",
        title: "LRU Cache Design",
        type: "dsa",
        roleRelevance: 0.9, // 27 pts
        confidenceScore: 2, // 20 pts
        skillImportance: "critical", // 20 pts
        isRevisionDue: true,
        isOverdueRevision: true, // 15 pts
        daysUntilInterview: 7, // 8 pts
        // Total ~90 pts
      },
    ];

    const prioritized = calculateDay31Prioritization(candidates);

    expect(prioritized[0]!.id).toBe("item-critical-gap");
    expect(prioritized[0]!.finalScore).toBeGreaterThan(90);
    expect(prioritized[0]!.reasoning).toContain("High target role alignment");
    expect(prioritized[0]!.reasoning).toContain("High knowledge gap");

    expect(prioritized[1]!.id).toBe("item-overdue-dsa");
    expect(prioritized[1]!.scoreBreakdown.revisionScore).toBe(15);

    expect(prioritized[2]!.id).toBe("item-low-priority");
    expect(prioritized[2]!.finalScore).toBeLessThan(30);
  });
});

describe("Planner Service Operations", () => {
  it("reads actual study capacity from user profile", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                daily_available_minutes: 150,
                target_roles: ["Backend Lead", "Java Architect"],
              },
            }),
          }),
        }),
      })),
    } as unknown as SupabaseClient;

    const capacity = await getUserStudyCapacity(mockSupabase, "user-123");
    expect(capacity.dailyAvailableMinutes).toBe(150);
    expect(capacity.targetRoles).toContain("Backend Lead");
  });

  it("toggles task completion status and sets completed_at timestamp", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "t-1",
                status: "completed",
                completed_at: "2026-11-15T18:00:00.000Z",
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

    const task = await toggleTaskStatus(mockSupabase, "user-123", "t-1", true);
    expect(task.status).toBe("completed");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
      })
    );
  });

  it("reschedules task to a new target date", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "t-1",
                planned_for: "2026-11-20",
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

    const task = await rescheduleTask(mockSupabase, "user-123", "t-1", "2026-11-20");
    expect(task.planned_for).toBe("2026-11-20");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        planned_for: "2026-11-20",
      })
    );
  });
});

describe("Planner Service: generateSprintPreview DSA Metadata (M-11)", () => {
  function createSprintPreviewSupabase(dsaResult: { data: unknown[] | null; error: { message: string } | null }) {
    const dsaSelectSpy = vi.fn();

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { daily_available_minutes: 120, target_roles: ["Java Backend"] },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "dsa_questions") {
          dsaSelectSpy.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(dsaResult),
              }),
            }),
          });
          return { select: dsaSelectSpy };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    return { supabase, dsaSelectSpy };
  }

  it("queries dsa_questions.patterns (not topic) and maps single, multiple, and empty patterns safely", async () => {
    const { supabase, dsaSelectSpy } = createSprintPreviewSupabase({
      data: [
        {
          collection_order: 1,
          title: "Two Sum",
          difficulty: "easy",
          patterns: ["Hash Map"],
        },
        {
          collection_order: 2,
          title: "Valid Palindrome",
          difficulty: "easy",
          patterns: ["String", "Two Pointers"],
        },
        {
          collection_order: 3,
          title: "Merge Intervals",
          difficulty: "medium",
          patterns: [],
        },
        {
          collection_order: 4,
          title: "LRU Cache",
          difficulty: "medium",
          patterns: null,
        },
      ],
      error: null,
    });

    const preview = await generateSprintPreview(supabase, "user-123", 30, "2026-11-18");

    expect(dsaSelectSpy).toHaveBeenCalledWith("collection_order, title, difficulty, patterns");
    expect(dsaSelectSpy.mock.calls[0]?.[0]).not.toContain("topic");

    expect(preview.dailyAvailableMinutes).toBe(120);
    expect(preview.schedule.durationDays).toBe(30);
    expect(preview.schedule.totalGrindScheduled).toBe(75);

    // One pattern
    expect(preview.grindProblemsMap[1]).toEqual({
      title: "Two Sum",
      difficulty: "easy",
      topic: "Hash Map",
      patterns: ["Hash Map"],
    });

    // Multiple patterns
    expect(preview.grindProblemsMap[2]).toEqual({
      title: "Valid Palindrome",
      difficulty: "easy",
      topic: "String, Two Pointers",
      patterns: ["String", "Two Pointers"],
    });

    // Empty array pattern fallback
    expect(preview.grindProblemsMap[3]).toEqual({
      title: "Merge Intervals",
      difficulty: "medium",
      topic: "Algorithms",
      patterns: [],
    });

    // Null pattern fallback
    expect(preview.grindProblemsMap[4]).toEqual({
      title: "LRU Cache",
      difficulty: "medium",
      topic: "Algorithms",
      patterns: [],
    });
  });

  it("returns empty grindProblemsMap safely when no DSA questions exist", async () => {
    const { supabase } = createSprintPreviewSupabase({ data: [], error: null });

    const preview = await generateSprintPreview(supabase, "user-123", 45, "2026-11-18");
    expect(preview.schedule.durationDays).toBe(45);
    expect(preview.grindProblemsMap).toEqual({});
  });

  it("throws explicit error when dsa_questions query fails", async () => {
    const { supabase } = createSprintPreviewSupabase({
      data: null,
      error: { message: "permission denied" },
    });

    await expect(
      generateSprintPreview(supabase, "user-123", 30, "2026-11-18")
    ).rejects.toThrow("Failed to fetch Grind 75 problems metadata: permission denied");
  });
});
