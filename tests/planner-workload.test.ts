import { describe, it, expect } from "vitest";
import {
  calculateDailyWorkload,
  evaluateCapacity,
  generateSprintSchedule,
  type DailyWorkloadItem,
} from "@/features/planner/workload";

describe("Study Sprint Workload & Capacity Engine", () => {
  it("calculates exact daily workload in minutes from individual task estimates", () => {
    const tasks: DailyWorkloadItem[] = [
      { title: "Two Sum", estimated_minutes: 15, category: "grind75" },
      { title: "Valid Parentheses", estimated_minutes: 15, category: "grind75" },
      { title: "Merge Two Sorted Lists", estimated_minutes: 15, category: "grind75" },
      { title: "HashMap Internals in Java", estimated_minutes: 15, category: "interview_question" },
      { title: "equals() and hashCode() Contract", estimated_minutes: 15, category: "interview_question" },
      { title: "Java Memory Model & GC Recap", estimated_minutes: 15, category: "interview_question" },
      { title: "Daily Review & Answer Notes", estimated_minutes: 15, category: "other" },
    ];

    const totalMinutes = calculateDailyWorkload(tasks);
    // 15 * 7 = 105 minutes
    expect(totalMinutes).toBe(105);
  });

  it("detects workload capacity and returns clean status when within daily limit", () => {
    const dailyAvailable = 120;
    const requiredMinutes = 105;

    const evaluation = evaluateCapacity(requiredMinutes, dailyAvailable);
    expect(evaluation.isOverloaded).toBe(false);
    expect(evaluation.excessMinutes).toBe(0);
    expect(evaluation.utilizationPercent).toBeCloseTo(87.5, 1);
  });

  it("triggers overload warning when workload exceeds daily available minutes", () => {
    const dailyAvailable = 120; // from user profile
    const requiredMinutes = 160; // 3 Medium/Hard problems + 4 technical questions

    const evaluation = evaluateCapacity(requiredMinutes, dailyAvailable);
    expect(evaluation.isOverloaded).toBe(true);
    expect(evaluation.excessMinutes).toBe(40);
    expect(evaluation.warningMessage).toContain("exceeds your daily available study time by 40 minutes");
  });

  it("generates realistic alternatives for 30, 45, and 60 days", () => {
    const dailyAvailable = 120;
    const totalGrindProblems = 75;

    const sprint30 = generateSprintSchedule({
      durationDays: 30,
      dailyAvailableMinutes: dailyAvailable,
      startDate: new Date("2026-11-16"),
    });

    const sprint45 = generateSprintSchedule({
      durationDays: 45,
      dailyAvailableMinutes: dailyAvailable,
      startDate: new Date("2026-11-16"),
    });

    const sprint60 = generateSprintSchedule({
      durationDays: 60,
      dailyAvailableMinutes: dailyAvailable,
      startDate: new Date("2026-11-16"),
    });

    // 30-day plan has 30 days
    expect(sprint30.days).toHaveLength(30);
    // 45-day plan has 45 days
    expect(sprint45.days).toHaveLength(45);
    // 60-day plan has 60 days
    expect(sprint60.days).toHaveLength(60);

    // All 75 Grind 75 problems must be included in each plan
    const grindIn30 = sprint30.days.flatMap((d) => d.grindProblemOrders);
    const uniqueGrind30 = new Set(grindIn30);
    expect(uniqueGrind30.size).toBe(totalGrindProblems);

    // 45-day and 60-day plans distribute the load so daily time is lower
    expect(sprint45.averageDailyMinutes).toBeLessThan(sprint30.averageDailyMinutes);
    expect(sprint60.averageDailyMinutes).toBeLessThan(sprint45.averageDailyMinutes);
  });
});
