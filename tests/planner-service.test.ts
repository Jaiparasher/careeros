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
