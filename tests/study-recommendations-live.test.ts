import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { StudyRecommendationService } from "@/features/planner/recommendation-service";
import type { RecommendationSessionResult, StudyRecommendation } from "@/features/planner/recommendation-schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aukdilhlchhnwbqxwpeq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TmbZGcJiMNt7IzV6yYhpWQ_mqP_4PMO";

describe("Phase 4 Batch 4 Live Integration & Security Audit (Supabase + Gemini)", () => {
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;
  let userA_id: string;
  let userB_id: string;
  let serviceA: StudyRecommendationService;
  let serviceB: StudyRecommendationService;

  let sessionResult: RecommendationSessionResult;
  let createdTaskId: string | null = null;
  const todayStr = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    const rawClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Authenticate User A
    const { data: authA, error: errA } = await rawClient.auth.signInWithPassword({
      email: "test@gmail.com",
      password: "Test123",
    });
    if (errA || !authA.user || !authA.session) {
      throw new Error(`User A auth failed: ${errA?.message}`);
    }
    userA_id = authA.user.id;
    clientA = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    });
    serviceA = new StudyRecommendationService(clientA);

    // 2. Authenticate User B
    const { data: authB, error: errB } = await rawClient.auth.signInWithPassword({
      email: "test_audit_user_b@careeros-audit.com",
      password: "AuditPass123!",
    });
    if (errB || !authB.user || !authB.session) {
      throw new Error(`User B auth failed: ${errB?.message}`);
    }
    userB_id = authB.user.id;
    clientB = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    });
    serviceB = new StudyRecommendationService(clientB);
  });

  afterAll(async () => {
    // Teardown created test task
    if (createdTaskId && clientA) {
      await clientA.from("study_tasks").delete().eq("id", createdTaskId);
    }
  });

  describe("1. Recommendation Generation & Live Data Grounding", () => {
    it("generates at most 3 personalized recommendations grounded in real user data", async () => {
      // Record initial study_tasks count before generating recommendations
      const { count: countBefore } = await clientA
        .from("study_tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userA_id)
        .eq("planned_for", todayStr);

      sessionResult = await serviceA.generateRecommendations(userA_id);

      expect(sessionResult).toBeDefined();
      expect(sessionResult.advisorHeadline).toBeTruthy();
      expect(["gemini", "deterministic_fallback"]).toContain(sessionResult.generationSource);
      console.log(
        `[LIVE ADVISOR] Source: ${sessionResult.generationSource} | Headline: ${sessionResult.advisorHeadline} | FallbackReason: ${sessionResult.fallbackReason ?? "none"}`
      );
      if (sessionResult.generationSource === "gemini") {
        expect(sessionResult.fallbackReason).toBeNull();
      } else {
        expect(sessionResult.fallbackReason).toBeTruthy();
      }
      expect(sessionResult.dailyAvailableMinutes).toBeGreaterThan(0);
      expect(sessionResult.recommendations.length).toBeLessThanOrEqual(3);

      // CRITICAL: Generating / previewing recommendations MUST NOT create any database task!
      const { count: countAfter } = await clientA
        .from("study_tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userA_id)
        .eq("planned_for", todayStr);

      expect(countAfter).toBe(countBefore);

      if (sessionResult.recommendations.length > 0) {
        for (const rec of sessionResult.recommendations) {
          expect(rec.source).toBe(sessionResult.generationSource);
        }
        const topRec = sessionResult.recommendations[0]!;
        expect(topRec.title).toBeTruthy();
        expect(topRec.reason).toBeTruthy();
        expect(topRec.expectedOutcome).toBeTruthy();
        expect(topRec.estimatedMinutes).toBeGreaterThanOrEqual(5);
        expect(topRec.estimatedMinutes).toBeLessThanOrEqual(180);
        expect(["dsa_revision", "weak_topic", "incomplete_module", "interview_question"]).toContain(topRec.type);
      }
    }, 60000);
  });

  describe("2. Task Acceptance & Idempotency", () => {
    it("creates a study task in live Supabase only after explicit user acceptance", async () => {
      const sampleRec: StudyRecommendation = sessionResult?.recommendations?.[0] || {
        id: `rec_test_${Date.now()}`,
        candidateId: "dsa_rev_test_live",
        type: "weak_topic",
        title: "Practice Java Concurrency: Thread Pools & Atomics",
        topicOrSkill: "Java Multithreading",
        category: "java",
        entityId: "topic-concurrency-audit",
        priority: "high",
        reason: "Core competency for senior Java backend interviews.",
        expectedOutcome: "Solidify lock-free synchronization understanding.",
        estimatedMinutes: 25,
        context: "Weak topic gap",
      };

      const task = await serviceA.acceptRecommendation(userA_id, {
        candidateId: sampleRec.candidateId,
        type: sampleRec.type,
        title: sampleRec.title,
        category: sampleRec.category,
        entityId: sampleRec.entityId,
        priority: sampleRec.priority === "high" ? "high" : sampleRec.priority === "low" ? "low" : "normal",
        estimatedMinutes: sampleRec.estimatedMinutes,
        reason: sampleRec.reason,
        expectedOutcome: sampleRec.expectedOutcome,
        plannedFor: todayStr,
      });

      expect(task).toBeDefined();
      expect(task.id).toBeTruthy();
      expect(task.title).toBe(sampleRec.title);
      expect(task.planned_for).toBe(todayStr);
      createdTaskId = task.id;

      // Verify row genuinely exists in public.study_tasks
      const { data: dbRow, error } = await clientA
        .from("study_tasks")
        .select("*")
        .eq("id", task.id)
        .single();

      expect(error).toBeNull();
      expect(dbRow).toBeDefined();
      expect(dbRow.user_id).toBe(userA_id);
      expect(dbRow.status).toBe("pending");
      expect(dbRow.title).toBe(sampleRec.title);
    });

    it("prevents duplicate task creation if user double-clicks accept (idempotency check)", async () => {
      if (!createdTaskId) return;

      const sampleRec = sessionResult?.recommendations?.[0] || {
        id: `rec_test_${Date.now()}`,
        candidateId: "dsa_rev_test_live",
        type: "weak_topic" as const,
        title: "Practice Java Concurrency: Thread Pools & Atomics",
        topicOrSkill: "Java Multithreading",
        category: "java" as const,
        entityId: "topic-concurrency-audit",
        priority: "high" as const,
        reason: "Core competency for senior Java backend interviews.",
        expectedOutcome: "Solidify lock-free synchronization understanding.",
        estimatedMinutes: 25,
        context: "Weak topic gap",
      };

      // Call acceptRecommendation second time with identical input
      const secondCallTask = await serviceA.acceptRecommendation(userA_id, {
        candidateId: sampleRec.candidateId,
        type: sampleRec.type,
        title: sampleRec.title,
        category: sampleRec.category,
        entityId: sampleRec.entityId,
        priority: sampleRec.priority === "high" ? "high" : sampleRec.priority === "low" ? "low" : "normal",
        estimatedMinutes: sampleRec.estimatedMinutes,
        reason: sampleRec.reason,
        expectedOutcome: sampleRec.expectedOutcome,
        plannedFor: todayStr,
      });

      // Must return the SAME task ID without inserting a duplicate!
      expect(secondCallTask.id).toBe(createdTaskId);

      // Verify count in database on today's date for this title is exactly 1
      const { count } = await clientA
        .from("study_tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userA_id)
        .eq("planned_for", todayStr)
        .eq("title", sampleRec.title);

      expect(count).toBe(1);
    });
  });

  describe("3. Multi-Tenant Security & RLS Isolation", () => {
    it("User B cannot SELECT User A's study tasks (RLS filters out)", async () => {
      if (!createdTaskId) return;

      const { data, error } = await clientB
        .from("study_tasks")
        .select("*")
        .eq("id", createdTaskId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // RLS filtered
    });

    it("User B cannot UPDATE User A's study task", async () => {
      if (!createdTaskId) return;

      const { data, error } = await clientB
        .from("study_tasks")
        .update({ title: "HACKED_BY_USER_B" })
        .eq("id", createdTaskId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // 0 rows affected

      // Confirm User A's task was untouched
      const { data: realRow } = await clientA
        .from("study_tasks")
        .select("title")
        .eq("id", createdTaskId)
        .single();

      expect(realRow?.title).not.toBe("HACKED_BY_USER_B");
    });

    it("User B cannot DELETE User A's study task", async () => {
      if (!createdTaskId) return;

      const { data, error } = await clientB
        .from("study_tasks")
        .delete()
        .eq("id", createdTaskId)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(0); // 0 rows deleted
    });

    it("User B cannot insert study tasks spoofing User A's user_id", async () => {
      const { data, error } = await clientB
        .from("study_tasks")
        .insert({
          user_id: userA_id, // Spoof User A!
          title: "Malicious Task",
          category: "other",
          planned_for: todayStr,
          estimated_minutes: 30,
        })
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it("serviceB cannot accept a recommendation on behalf of User A", async () => {
      expect(userB_id).toBeTruthy();
      await expect(
        serviceB.acceptRecommendation(userA_id, {
          candidateId: "spoof_candidate",
          type: "weak_topic",
          title: "Malicious Cross-Tenant Task",
          category: "java",
          entityId: "00000000-0000-0000-0000-000000000001",
          priority: "normal",
          estimatedMinutes: 30,
        })
      ).rejects.toThrow();
    });
  });

  describe("4. Database-Level Idempotency & Concurrent Acceptance Verification", () => {
    const cleanupTaskIds: string[] = [];

    afterAll(async () => {
      const uniqueIds = Array.from(new Set(cleanupTaskIds));
      if (uniqueIds.length > 0 && clientA) {
        for (const id of uniqueIds) {
          await clientA.from("study_tasks").delete().eq("id", id);
        }
      }
    });

    it("verifies Migration 0012 schema: idempotency_key column, partial unique index, and SECURITY INVOKER RPC", async () => {
      // 1. Verify column study_tasks.idempotency_key exists
      const { error: colErr } = await clientA
        .from("study_tasks")
        .select("id, idempotency_key")
        .limit(1);
      expect(colErr).toBeNull();

      // 2. Verify accept_study_recommendation() rejects unauthenticated callers (enforces auth.uid())
      const anonClient = createClient(supabaseUrl, supabaseAnonKey);
      const { error: unauthErr } = await anonClient.rpc("accept_study_recommendation", {
        p_title: "Unauthenticated RPC Test",
        p_category: "other",
        p_planned_for: todayStr,
        p_estimated_minutes: 15,
        p_priority: "normal",
        p_idempotency_key: `unauth_test_${Date.now()}`,
      });
      expect(unauthErr).toBeTruthy();
      expect(unauthErr?.message).toContain("Unauthorized");

      // 3. Verify RPC creates a task with auth.uid() ownership and study_tasks_user_idempotency_idx rejects duplicates
      const verifyKey = `schema_idx_verify_${Date.now()}`;
      const { data: rpcTask, error: rpcErr } = await clientA.rpc("accept_study_recommendation", {
        p_title: "Schema Verification Task",
        p_description: "Direct RPC schema check",
        p_category: "java",
        p_planned_for: todayStr,
        p_estimated_minutes: 20,
        p_priority: "normal",
        p_study_plan_id: null,
        p_question_id: null,
        p_learning_topic_id: null,
        p_interview_question_id: null,
        p_idempotency_key: verifyKey,
        p_notes: "Schema audit",
      });
      expect(rpcErr).toBeNull();
      expect(rpcTask).toBeDefined();
      expect(rpcTask.user_id).toBe(userA_id);
      expect(rpcTask.idempotency_key).toBe(verifyKey);
      cleanupTaskIds.push(rpcTask.id);

      // Direct duplicate insert must trigger PostgreSQL 23505 on study_tasks_user_idempotency_idx
      const { error: dupErr } = await clientA.from("study_tasks").insert({
        user_id: userA_id,
        title: "Duplicate Insert Attempt",
        category: "java",
        planned_for: todayStr,
        estimated_minutes: 20,
        priority: "normal",
        status: "pending",
        idempotency_key: verifyKey,
      });
      expect(dupErr).toBeTruthy();
      expect(dupErr?.code).toBe("23505");
      expect(dupErr?.message).toContain("study_tasks_user_idempotency_idx");
    });

    it("runs 10 simultaneous acceptance requests for the same recommendation and creates strictly 1 task", async () => {
      const stamp = Date.now();
      const concurrentTitle = `Concurrent Idempotency Test ${stamp}`;
      const payload = {
        candidateId: `cand_concurrent_${stamp}`,
        type: "incomplete_module" as const,
        title: concurrentTitle,
        category: "spring_boot" as const,
        entityId: `mod_test_${stamp}`,
        priority: "normal" as const,
        estimatedMinutes: 30,
        plannedFor: todayStr,
        idempotencyKey: `rec:test_concurrent:${stamp}:${todayStr}`,
      };

      // Fire 10 simultaneous acceptance requests
      const promises = Array.from({ length: 10 }, () =>
        serviceA.acceptRecommendation(userA_id, payload)
      );

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      results.forEach((task) => {
        expect(task).toBeDefined();
        expect(task.id).toBeTruthy();
        cleanupTaskIds.push(task.id);
      });

      const uniqueTaskIds = new Set(results.map((r) => r.id));
      console.log(`[CONCURRENCY AUDIT] 10 concurrent requests generated ${uniqueTaskIds.size} unique task ID(s).`);

      const { count } = await clientA
        .from("study_tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userA_id)
        .eq("planned_for", todayStr)
        .eq("title", concurrentTitle);

      console.log(`[CONCURRENCY AUDIT] Total rows created in database: ${count}`);

      // Migration 0012 strictly guarantees exactly 1 task across all 10 simultaneous requests
      expect(uniqueTaskIds.size).toBe(1);
      expect(count).toBe(1);
    }, 30000);

    it("allows manual task creation without an idempotency key (partial unique index permits NULLs)", async () => {
      const manualTitle = `Manual Custom Task ${Date.now()}`;

      const { data: manual1, error: err1 } = await clientA
        .from("study_tasks")
        .insert({
          user_id: userA_id,
          title: manualTitle,
          category: "other",
          planned_for: todayStr,
          estimated_minutes: 20,
          priority: "normal",
          status: "pending",
        })
        .select("id, idempotency_key")
        .single();

      const { data: manual2, error: err2 } = await clientA
        .from("study_tasks")
        .insert({
          user_id: userA_id,
          title: manualTitle,
          category: "other",
          planned_for: todayStr,
          estimated_minutes: 20,
          priority: "normal",
          status: "pending",
        })
        .select("id, idempotency_key")
        .single();

      expect(err1).toBeNull();
      expect(err2).toBeNull();
      expect(manual1?.id).toBeTruthy();
      expect(manual2?.id).toBeTruthy();
      expect(manual1?.idempotency_key).toBeNull();
      expect(manual2?.idempotency_key).toBeNull();
      expect(manual1?.id).not.toBe(manual2?.id);

      if (manual1?.id) cleanupTaskIds.push(manual1.id);
      if (manual2?.id) cleanupTaskIds.push(manual2.id);
    });

    it("allows different recommendations to create separate tasks", async () => {
      const title1 = `Different Task A ${Date.now()}`;
      const title2 = `Different Task B ${Date.now()}`;

      const [task1, task2] = await Promise.all([
        serviceA.acceptRecommendation(userA_id, {
          candidateId: "cand_diff_a",
          type: "incomplete_module",
          title: title1,
          category: "spring_boot",
          entityId: "mod_diff_a",
          priority: "normal",
          estimatedMinutes: 20,
          plannedFor: todayStr,
        }),
        serviceA.acceptRecommendation(userA_id, {
          candidateId: "cand_diff_b",
          type: "incomplete_module",
          title: title2,
          category: "java",
          entityId: "mod_diff_b",
          priority: "normal",
          estimatedMinutes: 25,
          plannedFor: todayStr,
        }),
      ]);

      cleanupTaskIds.push(task1.id, task2.id);
      expect(task1.id).not.toBe(task2.id);
      expect(task1.title).toBe(title1);
      expect(task2.title).toBe(title2);
    });

    it("cross-user idempotency keys cannot collide with or access another user's task", async () => {
      const sharedKey = `shared_idempotency_key_${Date.now()}`;
      const title = `Multi-tenant Key Test ${Date.now()}`;

      // User A accepts with shared key
      const taskA = await serviceA.acceptRecommendation(userA_id, {
        candidateId: "cand_user_a",
        type: "incomplete_module",
        title: `${title} (User A)`,
        category: "spring_boot",
        entityId: "mod_shared_1",
        priority: "normal",
        estimatedMinutes: 30,
        plannedFor: todayStr,
        idempotencyKey: sharedKey,
      });
      cleanupTaskIds.push(taskA.id);

      // User B accepts with identical shared key
      const taskB = await serviceB.acceptRecommendation(userB_id, {
        candidateId: "cand_user_b",
        type: "incomplete_module",
        title: `${title} (User B)`,
        category: "spring_boot",
        entityId: "mod_shared_1",
        priority: "normal",
        estimatedMinutes: 30,
        plannedFor: todayStr,
        idempotencyKey: sharedKey,
      });

      // Cleanup User B task
      await clientB.from("study_tasks").delete().eq("id", taskB.id);

      // Must be completely separate tasks belonging to each user
      expect(taskA.id).not.toBe(taskB.id);
      expect(taskA.user_id).toBe(userA_id);
      expect(taskB.user_id).toBe(userB_id);
    });
  });
});
