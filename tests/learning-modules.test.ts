import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateCourseProgress } from "@/lib/domain/progress";
import { getDashboardCourseProgress } from "@/features/learning/service";

describe("Learning Roadmap - Course Modules Domain", () => {
  it("calculates accurate mean percentage across 20 modules", () => {
    // 8 completed (100%), 1 in-progress (11%), 11 not started (0%)
    const modules = [
      ...Array(8).fill({ completion_percent: 100 }),
      { completion_percent: 11 },
      ...Array(11).fill({ completion_percent: 0 }),
    ];

    const mean = calculateCourseProgress(modules);
    // (800 + 11) / 20 = 40.55
    expect(mean).toBe(40.55);
  });

  it("updates aggregate correctly when a module percentage changes", () => {
    const modules = [
      ...Array(8).fill({ completion_percent: 100 }),
      { completion_percent: 50 }, // updated from 11% to 50%
      ...Array(11).fill({ completion_percent: 0 }),
    ];

    const mean = calculateCourseProgress(modules);
    // (800 + 50) / 20 = 42.50
    expect(mean).toBe(42.5);
  });

  it("correctly derives module status from completion percentage", () => {
    function getModuleStatus(percent: number): "not_started" | "in_progress" | "completed" {
      if (percent <= 0) return "not_started";
      if (percent >= 100) return "completed";
      return "in_progress";
    }

    expect(getModuleStatus(0)).toBe("not_started");
    expect(getModuleStatus(11)).toBe("in_progress");
    expect(getModuleStatus(99.9)).toBe("in_progress");
    expect(getModuleStatus(100)).toBe("completed");
  });
});

describe("Dashboard Course Progress Loader (M-10)", () => {
  function createModulesMockSupabase(result: { data: unknown[] | null; error: { message: string } | null }) {
    const selectSpy = vi.fn();
    const orderSpy = vi.fn().mockResolvedValue(result);
    const eqSpy = vi.fn().mockReturnValue({ order: orderSpy });
    selectSpy.mockReturnValue({ eq: eqSpy });

    const supabase = {
      from: vi.fn(() => ({
        select: selectSpy,
      })),
    } as unknown as SupabaseClient;

    return { supabase, selectSpy };
  }

  it("queries only actual learning_modules columns (excludes nonexistent status) and computes completed modules", async () => {
    const { supabase, selectSpy } = createModulesMockSupabase({
      data: [
        { module_number: 1, title: "Spring Core", completion_percent: 100 },
        { module_number: 2, title: "Spring Boot", completion_percent: 100 },
      ],
      error: null,
    });

    const progress = await getDashboardCourseProgress(supabase, "user-1");
    expect(selectSpy).toHaveBeenCalledWith("module_number, title, completion_percent");
    expect(selectSpy.mock.calls[0]?.[0]).not.toContain("status");
    expect(progress.error).toBeNull();
    expect(progress.aggregateProgress).toBe(100);
    expect(progress.totalModules).toBe(2);
    expect(progress.completedCount).toBe(2);
    expect(progress.inProgressCount).toBe(0);
    expect(progress.notStartedCount).toBe(0);
    expect(progress.inProgressModule).toBeNull();
  });

  it("handles in-progress modules accurately", async () => {
    const { supabase } = createModulesMockSupabase({
      data: [
        { module_number: 1, title: "JPA", completion_percent: 40 },
        { module_number: 2, title: "Security", completion_percent: 60 },
      ],
      error: null,
    });

    const progress = await getDashboardCourseProgress(supabase, "user-1");
    expect(progress.error).toBeNull();
    expect(progress.aggregateProgress).toBe(50);
    expect(progress.completedCount).toBe(0);
    expect(progress.inProgressCount).toBe(2);
    expect(progress.notStartedCount).toBe(0);
    expect(progress.inProgressModule?.module_number).toBe(1);
    expect(progress.inProgressModule?.completion_percent).toBe(40);
  });

  it("handles not-started modules accurately", async () => {
    const { supabase } = createModulesMockSupabase({
      data: [
        { module_number: 1, title: "Intro", completion_percent: 0 },
        { module_number: 2, title: "REST", completion_percent: 0 },
      ],
      error: null,
    });

    const progress = await getDashboardCourseProgress(supabase, "user-1");
    expect(progress.error).toBeNull();
    expect(progress.aggregateProgress).toBe(0);
    expect(progress.completedCount).toBe(0);
    expect(progress.inProgressCount).toBe(0);
    expect(progress.notStartedCount).toBe(2);
    expect(progress.inProgressModule).toBeNull();
  });

  it("computes mixed module states consistent with calculateCourseProgress", async () => {
    const rows = [
      { module_number: 1, title: "M1", completion_percent: 100 },
      { module_number: 2, title: "M2", completion_percent: 100 },
      { module_number: 3, title: "M3", completion_percent: 25 },
      { module_number: 4, title: "M4", completion_percent: 0 },
    ];
    const { supabase } = createModulesMockSupabase({ data: rows, error: null });

    const progress = await getDashboardCourseProgress(supabase, "user-1");
    expect(progress.error).toBeNull();
    expect(progress.aggregateProgress).toBe(calculateCourseProgress(rows));
    expect(progress.aggregateProgress).toBe(56.25);
    expect(progress.completedCount).toBe(2);
    expect(progress.inProgressCount).toBe(1);
    expect(progress.notStartedCount).toBe(1);
    expect(progress.inProgressModule?.module_number).toBe(3);
  });

  it("handles empty module list safely without error", async () => {
    const { supabase } = createModulesMockSupabase({ data: [], error: null });

    const progress = await getDashboardCourseProgress(supabase, "user-1");
    expect(progress.error).toBeNull();
    expect(progress.totalModules).toBe(0);
    expect(progress.aggregateProgress).toBe(0);
    expect(progress.completedCount).toBe(0);
    expect(progress.inProgressModule).toBeNull();
  });

  it("surfaces database query errors explicitly instead of silently returning 0%", async () => {
    const { supabase } = createModulesMockSupabase({
      data: null,
      error: { message: "connection refused" },
    });

    const progress = await getDashboardCourseProgress(supabase, "user-1");
    expect(progress.error).toContain("connection refused");
    expect(progress.modules).toEqual([]);
    expect(progress.totalModules).toBe(0);
  });
});
