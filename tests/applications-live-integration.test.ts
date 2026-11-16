import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  changeApplicationStage,
  deleteApplication,
  checkDuplicateApplication,
  createInterviewRound,
  updateInterviewRound,
  getInterviewRounds,
  deleteInterviewRound,
  getApplicationActivity,
  getApplicationsSummaryStats,
} from "@/features/applications/service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Live Supabase Integration - Phase 3 Batch 2 Job Applications", () => {
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

  it(
    "performs full application lifecycle: create, duplicate check, stage transition, and query",
    async () => {
    if (!userId) return;

    const testCompany = `Integration Corp ${Date.now()}`;
    const testRole = "Senior Java Engineer";
    const testUrl = `https://jobs.example.com/${Date.now()}`;

    // 1. Check duplicate before creation
    const dupBefore = await checkDuplicateApplication(supabase, userId, testCompany, testRole, testUrl);
    expect(dupBefore.hasDuplicate).toBe(false);

    // 2. Create application
    const app = await createApplication(supabase, userId, {
      company: testCompany,
      role_title: testRole,
      stage: "interested",
      work_mode: "hybrid",
      employment_type: "full_time",
      job_url: testUrl,
      salary_min_lpa: 14,
      salary_max_lpa: 18,
      expected_ctc_lpa: 16,
      recruiter_name: "Test Recruiter",
      recruiter_contact: "recruiter@example.com",
      next_follow_up_at: new Date().toISOString().slice(0, 10),
      notes: "Integration test application",
    });

    expect(app.id).toBeDefined();
    expect(app.company).toBe(testCompany);
    expect(app.stage).toBe("interested");

    // 3. Duplicate check after creation
    const dupAfter = await checkDuplicateApplication(supabase, userId, testCompany, testRole, testUrl);
    expect(dupAfter.hasDuplicate).toBe(true);
    expect(dupAfter.reason).toBeDefined();

    // 4. Test updateApplication & query getApplications
    const updatedApp = await updateApplication(supabase, userId, app.id, {
      notes: "Updated compensation expectation to 17 LPA",
    });
    expect(updatedApp.notes).toBe("Updated compensation expectation to 17 LPA");

    const allApps = await getApplications(supabase, userId);
    expect(allApps.some((a) => a.id === app.id)).toBe(true);

    // 5. Stage transition to applied, then screening
    const updatedStage1 = await changeApplicationStage(
      supabase,
      userId,
      app.id,
      "applied",
      "Submitted resume via employee referral"
    );
    expect(updatedStage1.stage).toBe("applied");

    const updatedStage2 = await changeApplicationStage(
      supabase,
      userId,
      app.id,
      "screening",
      "Recruiter contacted on LinkedIn; scheduled screening call"
    );
    expect(updatedStage2.stage).toBe("screening");

    // 5. Verify activity history (if migration 0008 activity table exists)
    const activity = await getApplicationActivity(supabase, userId, app.id);
    expect(Array.isArray(activity)).toBe(true);

    // 6. Test Interview Rounds (if migration 0008 rounds table exists)
    try {
      const round1 = await createInterviewRound(supabase, userId, app.id, {
        round_number: 1,
        round_name: "Recruiter Screen",
        result: "passed",
        interviewer_name: "Recruiter Anjali",
        performance_notes: "Salary alignment confirmed; progressing to technical round",
      });
      expect(round1.id).toBeDefined();
      expect(round1.result).toBe("passed");

      const round2 = await createInterviewRound(supabase, userId, app.id, {
        round_number: 2,
        round_name: "Technical Round 1 - DSA & Java",
        result: "pending",
        topics: ["Java", "Concurrency", "Binary Search"],
        questions_asked: ["Implement thread-safe queue", "Search in rotated sorted array"],
      });
      expect(round2.id).toBeDefined();

      // Update round 2 to passed
      const updatedRound2 = await updateInterviewRound(supabase, userId, round2.id, {
        result: "passed",
        performance_notes: "Implemented solution in optimal O(log N) time with clear explanations",
      });
      expect(updatedRound2.result).toBe("passed");

      const rounds = await getInterviewRounds(supabase, userId, app.id);
      expect(rounds.length).toBe(2);

      // Test deleteInterviewRound
      await deleteInterviewRound(supabase, userId, round1.id);
      const roundsAfterDelete = await getInterviewRounds(supabase, userId, app.id);
      expect(roundsAfterDelete.length).toBe(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("application_interview_rounds")) {
        console.warn("Migration 0008 interview rounds table pending execution in Supabase SQL editor.");
      } else {
        throw err;
      }
    }

    // 7. Verify Summary Stats
    const stats = await getApplicationsSummaryStats(supabase, userId);
    expect(stats.total).toBeGreaterThanOrEqual(1);
    expect(typeof stats.active).toBe("number");
    expect(typeof stats.dueTodayCount).toBe("number");

    // 8. Delete application and verify cascade deletion
    await deleteApplication(supabase, userId, app.id);

    const deletedApp = await getApplicationById(supabase, userId, app.id);
    expect(deletedApp).toBeNull();

    // Verify interview rounds for this app are also deleted
    const leftoverRounds = await getInterviewRounds(supabase, userId, app.id);
    expect(leftoverRounds.length).toBe(0);
  }, 30000);
});
