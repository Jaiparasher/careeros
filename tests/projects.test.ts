import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  createProjectSchema,
  updateProjectSchema,
  createFeatureSchema,
  updateFeatureSchema,
  createBugSchema,
  updateBugSchema,
  architectureDetailsSchema,
  interviewPrepSchema,
} from "@/features/projects/schema";

describe("Phase 3 Project Tracker - Schema & Baseline Tests", () => {
  const seedDir = path.resolve(__dirname, "../seed-data");

  describe("Lovable Project Seed Baseline", () => {
    it("validates lovable-project.json exists and strictly enforces constraints", () => {
      const raw = fs.readFileSync(path.join(seedDir, "lovable-project.json"), "utf-8");
      const data = JSON.parse(raw);

      expect(data.name).toBe("Lovable");
      expect(data.status).toBe("in_progress"); // Non-negotiable constraint: must not be completed
      expect(data.technologies_used_or_explored).toContain("Java");
      expect(data.technologies_used_or_explored).toContain("Spring Boot");
      expect(data.technologies_used_or_explored).toContain("Spring AI");
      expect(data.technologies_used_or_explored).toContain("PostgreSQL");
      expect(data.technologies_used_or_explored).toContain("pgvector");
      expect(data.technologies_used_or_explored).toHaveLength(13);

      // Ensures no fake metrics or fake URLs are seeded
      expect(data.repository_url).toBeUndefined();
      expect(data.demo_url).toBeUndefined();
      expect(data.known_project_constraints).toBeDefined();
      expect(data.known_project_constraints).toContain("Do not mark project completed.");
    });
  });

  describe("Project Schema Validation", () => {
    it("accepts a valid project with required fields and defaults", () => {
      const valid = {
        name: "CareerOS",
        project_type: "Full Stack Application",
        status: "in_progress",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
      };
      const parsed = createProjectSchema.parse(valid);
      expect(parsed.name).toBe("CareerOS");
      expect(parsed.status).toBe("in_progress");
      expect(parsed.technologies).toHaveLength(4);
      expect(parsed.objectives).toEqual([]);
      expect(parsed.key_achievements).toEqual([]);
    });

    it("accepts all valid project statuses including on_hold", () => {
      const statuses = [
        "planned",
        "in_progress",
        "completed",
        "on_hold",
        "blocked",
        "archived",
      ] as const;

      statuses.forEach((status) => {
        const parsed = createProjectSchema.parse({
          name: `Test Project ${status}`,
          status,
        });
        expect(parsed.status).toBe(status);
      });
    });

    it("rejects invalid project status", () => {
      expect(() => {
        createProjectSchema.parse({
          name: "Invalid Project",
          status: "non_existent_status",
        });
      }).toThrow();
    });

    it("rejects project name shorter than 2 characters", () => {
      expect(() => {
        createProjectSchema.parse({
          name: "X",
        });
      }).toThrow();
    });

    it("validates URL formats for repository_url and demo_url", () => {
      const validUrls = {
        name: "Valid URL Project",
        repository_url: "https://github.com/example/repo",
        demo_url: "https://example.com/demo",
      };
      const parsed = createProjectSchema.parse(validUrls);
      expect(parsed.repository_url).toBe("https://github.com/example/repo");

      expect(() => {
        createProjectSchema.parse({
          name: "Bad Repo",
          repository_url: "not-a-valid-url",
        });
      }).toThrow();
    });

    it("validates updateProjectSchema partial updates", () => {
      const parsed = updateProjectSchema.parse({
        status: "completed",
        summary: "Updated project description",
      });
      expect(parsed.status).toBe("completed");
      expect(parsed.summary).toBe("Updated project description");
      expect(parsed.name).toBeUndefined();
    });
  });

  describe("Feature Schema Validation", () => {
    it("accepts valid feature with all defined statuses and critical priority", () => {
      const validStatuses = [
        "planned",
        "in_progress",
        "implemented",
        "blocked",
        "done",
      ] as const;

      validStatuses.forEach((status) => {
        const parsed = createFeatureSchema.parse({
          title: `Feature ${status}`,
          status,
          priority: "critical",
          tech_used: ["Java", "Spring Boot"],
        });
        expect(parsed.status).toBe(status);
        expect(parsed.priority).toBe("critical");
      });
    });

    it("rejects unknown feature status", () => {
      expect(() => {
        createFeatureSchema.parse({
          title: "Feature",
          status: "wont_do",
        });
      }).toThrow();
    });

    it("validates updateFeatureSchema partial updates", () => {
      const update = { status: "implemented" as const };
      const parsed = updateFeatureSchema.parse(update);
      expect(parsed.status).toBe("implemented");
      expect(parsed.title).toBeUndefined();
    });
  });

  describe("Bug / Issue Schema Validation", () => {
    it("accepts valid bug with severity and status", () => {
      const bug = {
        title: "SSE connection timeout under heavy load",
        description: "EventSource drops after 60s idle without heartbeat",
        severity: "high" as const,
        status: "open" as const,
        resolution_notes: "",
      };
      const parsed = createBugSchema.parse(bug);
      expect(parsed.severity).toBe("high");
      expect(parsed.status).toBe("open");
    });

    it("validates bug status progression to fixed and closed with resolution", () => {
      const resolvedBug = {
        title: "SSE timeout",
        status: "fixed" as const,
        severity: "critical" as const,
        resolution_notes: "Implemented periodic 15s ping frame keep-alive",
        resolved_at: new Date().toISOString(),
      };
      const parsed = createBugSchema.parse(resolvedBug);
      expect(parsed.status).toBe("fixed");
      expect(parsed.resolution_notes).toContain("ping frame");
    });

    it("rejects invalid bug severity", () => {
      expect(() => {
        createBugSchema.parse({
          title: "Bug",
          severity: "urgent", // invalid; must be low, medium, high, critical
        });
      }).toThrow();
    });

    it("validates updateBugSchema partial updates", () => {
      const parsed = updateBugSchema.parse({
        status: "closed",
        resolution_notes: "Fix verified in staging environment",
      });
      expect(parsed.status).toBe("closed");
      expect(parsed.resolution_notes).toContain("staging");
      expect(parsed.title).toBeUndefined();
    });
  });

  describe("Architecture Details Schema Validation", () => {
    it("validates structured 8-section architecture schema", () => {
      const arch = {
        overview: "Spring Boot backend orchestrating multi-step AI agent workflows",
        major_decisions: "Adopted PostgreSQL + pgvector instead of standalone vector DB",
        database_design: "Relational tables for projects, vector embeddings for chunks",
        api_design: "REST for CRUD, SSE for real-time token streaming",
        challenges_solutions: "Handling rate limits via exponential backoff with jitter",
        scalability: "Stateless container workers horizontally scalable on Kubernetes",
        security: "Spring Security OAuth2 with JWT bearer tokens and fine-grained RLS",
        lessons_learned: "Streaming responses early improves perceived latency drastically",
      };

      const parsed = architectureDetailsSchema.parse(arch);
      expect(parsed.overview).toBeDefined();
      expect(parsed.major_decisions).toContain("pgvector");
      expect(parsed.database_design).toBeDefined();
      expect(parsed.api_design).toBeDefined();
      expect(parsed.challenges_solutions).toBeDefined();
      expect(parsed.scalability).toBeDefined();
      expect(parsed.security).toBeDefined();
      expect(parsed.lessons_learned).toBeDefined();
    });

    it("defaults empty strings for optional architecture sections", () => {
      const parsed = architectureDetailsSchema.parse({});
      expect(parsed.overview).toBe("");
      expect(parsed.database_design).toBe("");
      expect(parsed.scalability).toBe("");
    });
  });

  describe("Interview Prep Schema Validation", () => {
    it("validates 1-minute pitch, 5-minute deep dive, and follow-up questions", () => {
      const prep = {
        elevator_pitch_1min: "Lovable is an agentic developer assistant...",
        architecture_deep_dive_5min: "The orchestrator receives prompt, decomposes tasks...",
        challenges_and_solutions: "Token budgeting and state sync during long generations...",
        tradeoffs_and_decisions: "Chose SSE over WebSockets due to unidirectional stream needs...",
        interviewer_followups: [
          "How do you prevent hallucinations in code edits?",
          "How do you handle multi-tenant isolation in pgvector?",
        ],
      };

      const parsed = interviewPrepSchema.parse(prep);
      expect(parsed.elevator_pitch_1min).toBeDefined();
      expect(parsed.architecture_deep_dive_5min).toBeDefined();
      expect(parsed.challenges_and_solutions).toBeDefined();
      expect(parsed.tradeoffs_and_decisions).toBeDefined();
      expect(parsed.interviewer_followups).toHaveLength(2);
      expect(parsed.interviewer_followups[0]).toContain("hallucinations");
    });
  });
});
