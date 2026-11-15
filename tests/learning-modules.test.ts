import { describe, it, expect } from "vitest";
import { calculateCourseProgress } from "@/lib/domain/progress";

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
