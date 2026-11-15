import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Interview Question Bank - Skills Catalog Verification", () => {
  const catalogPath = path.resolve(process.cwd(), "seed-data/interview-skills-catalog.json");
  const raw = fs.readFileSync(catalogPath, "utf-8");
  const catalog = JSON.parse(raw);

  it("contains exactly 11 skill categories", () => {
    expect(catalog.categories).toHaveLength(11);
  });

  it("contains all 42 confirmed skills across the resume", () => {
    const totalSkills = catalog.categories.reduce(
      (acc: number, cat: { skills: unknown[] }) => acc + cat.skills.length,
      0
    );
    expect(totalSkills).toBe(42);
  });

  it("includes all critical and high priority resume skills", () => {
    const allSkills = catalog.categories.flatMap(
      (cat: { skills: Array<{ slug: string; priority: string; name: string }> }) => cat.skills
    );
    const criticalAndHigh = allSkills.filter(
      (s: { priority: string }) => s.priority === "critical" || s.priority === "high"
    );

    const criticalSlugs = criticalAndHigh.map((s: { slug: string }) => s.slug);

    // Core Java Backend
    expect(criticalSlugs).toContain("java");
    expect(criticalSlugs).toContain("spring-framework");
    expect(criticalSlugs).toContain("spring-boot");
    expect(criticalSlugs).toContain("spring-security");
    expect(criticalSlugs).toContain("hibernate-jpa");
    expect(criticalSlugs).toContain("sql");
    expect(criticalSlugs).toContain("rest-apis");
    expect(criticalSlugs).toContain("microservices");
    expect(criticalSlugs).toContain("apache-kafka");

    // System Design & Projects
    expect(criticalSlugs).toContain("lld");
    expect(criticalSlugs).toContain("tcs-project-deep-dive");
    expect(criticalSlugs).toContain("lovable-project-deep-dive");

    // Frontend & Web
    expect(criticalSlugs).toContain("react");
    expect(criticalSlugs).toContain("javascript");
  });

  it("ensures every skill defines topics and role relevance", () => {
    catalog.categories.forEach((cat: { skills: Array<{ topics: string[]; role_relevance: string[] }> }) => {
      cat.skills.forEach((skill) => {
        expect(Array.isArray(skill.topics)).toBe(true);
        expect(skill.topics.length).toBeGreaterThan(0);
        expect(Array.isArray(skill.role_relevance)).toBe(true);
      });
    });
  });
});
