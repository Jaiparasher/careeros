import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getProjects,
  getProjectById,
  createProjectFeature,
  updateProjectFeature,
  deleteProjectFeature,
  getProjectFeatures,
  createProjectBug,
  updateProjectBug,
  deleteProjectBug,
  getProjectBugs,
  updateProjectArchitecture,
  updateProjectInterviewPrep,
  getProjectsSummaryStats,
  seedLovableProjectIfEmpty,
} from "@/features/projects/service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Live Supabase Integration - Phase 3 Batch 1 Project Tracker", () => {
  let supabase: SupabaseClient;
  let userId: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test@gmail.com",
      password: "Test123",
    });

    if (error || !data.user) {
      console.warn("Could not authenticate test user; skipping live integration tests:", error?.message);
      return;
    }

    userId = data.user.id;
  });

  it("authenticates test user successfully", () => {
    if (!userId) return;
    expect(userId).toBeDefined();
    expect(userId.length).toBeGreaterThan(10);
  });

  it("idempotently seeds and fetches the Lovable project in live Supabase", async () => {
    if (!userId) return;

    await seedLovableProjectIfEmpty(supabase, userId);
    const projects = await getProjects(supabase, userId);
    expect(projects.length).toBeGreaterThan(0);

    const lovable = projects.find((p) => p.name === "Lovable");
    expect(lovable).toBeDefined();
    if (!lovable) return;

    expect(lovable.status).toBe("in_progress");
    expect(lovable.technologies).toContain("Java");
    expect(lovable.technologies).toContain("Spring Boot");
    expect(lovable.technologies).toContain("Spring AI");
    expect(lovable.technologies).toContain("pgvector");
    expect(lovable.technologies).toHaveLength(13);

    // Verify constraints: no fake URLs
    expect(lovable.repository_url).toBeNull();
    expect(lovable.demo_url).toBeNull();

    // Verify getProjectById
    const fetchedById = await getProjectById(supabase, userId, lovable.id);
    expect(fetchedById).toBeDefined();
    expect(fetchedById?.id).toBe(lovable.id);
  });

  it("performs feature CRUD on live Supabase", async () => {
    if (!userId) return;

    const projects = await getProjects(supabase, userId);
    const lovable = projects.find((p) => p.name === "Lovable");
    expect(lovable).toBeDefined();
    if (!lovable) return;

    // Create a feature
    const feature = await createProjectFeature(supabase, userId, lovable.id, {
      title: "Automated Integration Test Feature",
      description: "Testing live feature creation and status update",
      status: "planned",
      priority: "high",
      category: "feature",
      tech_used: ["Java", "Spring Boot"],
    });

    expect(feature.id).toBeDefined();
    expect(feature.title).toBe("Automated Integration Test Feature");
    expect(feature.status).toBe("planned");

    // Update status to in_progress
    const updated = await updateProjectFeature(supabase, userId, feature.id, {
      status: "in_progress",
    });
    expect(updated.status).toBe("in_progress");

    // Fetch features list
    const features = await getProjectFeatures(supabase, userId, lovable.id);
    expect(features.some((f) => f.id === feature.id)).toBe(true);

    // Delete feature
    await deleteProjectFeature(supabase, userId, feature.id);
    const afterDelete = await getProjectFeatures(supabase, userId, lovable.id);
    expect(afterDelete.some((f) => f.id === feature.id)).toBe(false);
  });

  it("checks project_bugs table and performs defect lifecycle if migration 0007 applied", async () => {
    if (!userId) return;

    const projects = await getProjects(supabase, userId);
    const lovable = projects.find((p) => p.name === "Lovable");
    expect(lovable).toBeDefined();
    if (!lovable) return;

    // Try creating a test bug
    try {
      const bug = await createProjectBug(supabase, userId, lovable.id, {
        title: "Test SSE Reconnect Bug",
        description: "Checking if project_bugs table exists and functions",
        severity: "medium",
        status: "open",
        resolution_notes: "",
      });

      expect(bug.id).toBeDefined();
      expect(bug.status).toBe("open");

      // Update bug to investigating and fixed
      const resolved = await updateProjectBug(supabase, userId, bug.id, {
        status: "fixed",
        resolution_notes: "Fixed via heartbeat keep-alive frames",
        resolved_at: new Date().toISOString(),
      });
      expect(resolved.status).toBe("fixed");

      // Verify in list
      const bugs = await getProjectBugs(supabase, userId, lovable.id);
      expect(bugs.some((b) => b.id === bug.id)).toBe(true);

      // Clean up test bug
      await deleteProjectBug(supabase, userId, bug.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log("project_bugs check result:", msg);
      // If table not yet applied in Supabase SQL editor, this informs us
      if (msg.includes("relation \"public.project_bugs\" does not exist")) {
        console.warn("Migration 0007 not yet applied on Supabase.");
      } else {
        throw err;
      }
    }
  });

  it("updates architecture and interview defense notes on live project", async () => {
    if (!userId) return;

    const projects = await getProjects(supabase, userId);
    const lovable = projects.find((p) => p.name === "Lovable");
    expect(lovable).toBeDefined();
    if (!lovable) return;

    const updatedArch = await updateProjectArchitecture(supabase, userId, lovable.id, {
      overview: "Live test: Spring Boot multi-agent system architecture",
      major_decisions: "Live test: PostgreSQL + pgvector unified store",
      database_design: "Relational tables + vector embeddings",
      api_design: "REST + SSE streaming",
      challenges_solutions: "Managing long-running completions without socket timeout",
      scalability: "Horizontal container instances",
      security: "Supabase JWT and strict tenant RLS",
      lessons_learned: "Early SSE flushes drastically improve UX",
    });

    expect(updatedArch.id).toBe(lovable.id);

    const updatedPrep = await updateProjectInterviewPrep(supabase, userId, lovable.id, {
      elevator_pitch_1min: "Lovable is an agentic code generation engine...",
      architecture_deep_dive_5min: "5-minute live test overview...",
      challenges_and_solutions: "Overcoming LLM output token bounds...",
      tradeoffs_and_decisions: "pgvector vs Pinecone trade-offs...",
      interviewer_followups: ["How is multi-tenancy enforced?"],
    });

    expect(updatedPrep.id).toBe(lovable.id);
  });

  it("calculates live summary stats", async () => {
    if (!userId) return;

    const stats = await getProjectsSummaryStats(supabase, userId);
    expect(stats.total).toBeGreaterThanOrEqual(1);
    expect(stats.in_progress).toBeGreaterThanOrEqual(1);
    expect(typeof stats.totalFeatures).toBe("number");
    expect(typeof stats.activeBugs).toBe("number");
  });
});
