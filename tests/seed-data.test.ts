import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { calculateCourseProgress } from "@/lib/domain/progress";

describe("Seed Data Baseline Integrity", () => {
  const seedDir = path.resolve(__dirname, "../seed-data");

  it("validates coding-shuttle-modules.json matches exact baseline", () => {
    const raw = fs.readFileSync(path.join(seedDir, "coding-shuttle-modules.json"), "utf-8");
    const data = JSON.parse(raw);

    expect(data.module_count).toBe(20);
    expect(data.completed_modules).toBe(8);
    expect(data.partially_completed_modules).toBe(1);
    expect(data.not_started_modules).toBe(11);
    expect(data.mean_completion_percent).toBe(40.55);
    expect(data.modules).toHaveLength(20);

    // Verify calculated mean using domain progress function
    const calculated = calculateCourseProgress(data.modules);
    expect(calculated).toBe(40.55);

    // Verify keys and ordering
    const keys = new Set<string>();
    data.modules.forEach((mod: { module_number: number; module_key: string; completion_percent: number }, idx: number) => {
      expect(mod.module_number).toBe(idx + 1);
      expect(mod.module_key).toBeDefined();
      expect(keys.has(mod.module_key)).toBe(false);
      keys.add(mod.module_key);
    });
  });

  it("validates profile.json matches user facts", () => {
    const raw = fs.readFileSync(path.join(seedDir, "profile.json"), "utf-8");
    const profile = JSON.parse(raw);

    expect(profile.display_name).toBe("Jai");
    expect(profile.current_employer).toBe("Tata Consultancy Services");
    expect(profile.current_title).toBe("Associate System Engineer");
    expect(profile.timezone).toBe("Asia/Kolkata");
    expect(profile.target_roles).toContain("Java Backend Developer");
    expect(profile.target_roles).toContain("Software Engineer");
    expect(profile.target_compensation_lpa.min).toBe(10);
    expect(profile.target_compensation_lpa.max).toBe(15);
    expect(profile.education[0].degree).toBe("B.Tech Computer Science");
  });

  it("validates grind75-track.json metadata", () => {
    const raw = fs.readFileSync(path.join(seedDir, "grind75-track.json"), "utf-8");
    const grind = JSON.parse(raw);

    expect(grind.collection_key).toBe("grind75_core_75");
    expect(grind.publisher).toBe("Tech Interview Handbook");
    expect(grind.sprint_target.target_question_count).toBe(75);
    expect(grind.sprint_target.target_days).toBe(30);
    expect(grind.import_policy.never_infer_solved_from_aggregate_350_plus).toBe(true);
  });

  it("validates learning-baseline.json DSA and topic configuration", () => {
    const raw = fs.readFileSync(path.join(seedDir, "learning-baseline.json"), "utf-8");
    const baseline = JSON.parse(raw);

    expect(baseline.dsa.playlist_completed).toBe(true);
    expect(baseline.dsa.aggregate_solved_count).toBe(350);
    expect(baseline.learning_topics.length).toBeGreaterThan(15);
  });

  it("validates lovable-project.json status", () => {
    const raw = fs.readFileSync(path.join(seedDir, "lovable-project.json"), "utf-8");
    const project = JSON.parse(raw);

    expect(project.name).toBe("Lovable");
    expect(project.status).toBe("in_progress");
    expect(project.technologies_used_or_explored).toContain("Spring Boot");
    expect(project.technologies_used_or_explored).toContain("pgvector");
  });
});
