import { describe, it, expect } from "vitest";
import { calculateCourseProgress } from "@/lib/domain/progress";

describe("Course Progress Calculation (calculateCourseProgress)", () => {
  it("returns 0 when module list is empty or undefined", () => {
    expect(calculateCourseProgress([])).toBe(0);
    // @ts-expect-error test undefined input
    expect(calculateCourseProgress(undefined)).toBe(0);
  });

  it("calculates progress for a single module", () => {
    expect(calculateCourseProgress([{ completion_percent: 50 }])).toBe(50);
    expect(calculateCourseProgress([{ completion_percent: 100 }])).toBe(100);
    expect(calculateCourseProgress([{ completion_percent: 0 }])).toBe(0);
  });

  it("clamps percentages between 0 and 100", () => {
    expect(calculateCourseProgress([{ completion_percent: 150 }])).toBe(100);
    expect(calculateCourseProgress([{ completion_percent: -20 }])).toBe(0);
  });

  it("correctly computes the arithmetic mean rounded to 2 decimal places", () => {
    const modules = [
      { completion_percent: 33.333 },
      { completion_percent: 66.666 },
    ];
    // (33.333 + 66.666) / 2 = 49.9995 -> 50.00
    expect(calculateCourseProgress(modules)).toBe(50);
  });

  it("matches the exact 20 Coding Shuttle module baseline (40.55%)", () => {
    // 8 modules @ 100%, 1 @ 11%, 11 @ 0%
    const baseline = [
      { completion_percent: 100 },
      { completion_percent: 100 },
      { completion_percent: 100 },
      { completion_percent: 0 },
      { completion_percent: 100 },
      { completion_percent: 100 },
      { completion_percent: 11 },
      { completion_percent: 0 },
      { completion_percent: 100 },
      { completion_percent: 0 },
      { completion_percent: 0 },
      { completion_percent: 0 },
      { completion_percent: 0 },
      { completion_percent: 0 },
      { completion_percent: 100 },
      { completion_percent: 100 },
      { completion_percent: 0 },
      { completion_percent: 0 },
      { completion_percent: 0 },
      { completion_percent: 0 },
    ];

    expect(calculateCourseProgress(baseline)).toBe(40.55);
  });
});
