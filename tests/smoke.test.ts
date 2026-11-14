import { describe, it, expect } from "vitest";

describe("Phase 0 Smoke Test", () => {
  it("computes arithmetic correctly", () => {
    expect(1 + 1).toBe(2);
  });

  it("calculates baseline course completion average correctly (40.55%)", () => {
    // 20 modules total: 8 modules at 100%, 1 at 11%, 11 at 0%
    const modulePercentages = [
      100, 100, 100, 0, 100, 100, 11, 0, 100, 0,
      0, 0, 0, 0, 100, 100, 0, 0, 0, 0
    ];
    const total = modulePercentages.reduce((acc, curr) => acc + curr, 0);
    const mean = total / modulePercentages.length;
    expect(Number(mean.toFixed(2))).toBe(40.55);
  });
});
