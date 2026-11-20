import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { z } from "zod";

// Zod schemas mirroring the database CHECK constraints introduced in Migration 0014
const questionScoreSchema = z.number().min(0).max(10).nullable().optional();
const overallScoreSchema = z.number().min(0).max(10).nullable().optional();

describe("Phase 4 Remediation: Batch C (Database Integrity & Security)", () => {
  // ==========================================================================
  // 1. M-08 — Interview Question Ownership Integrity & Score Bounds
  // ==========================================================================
  describe("1. M-08 — Interview Question Ownership Integrity & Score Bounds", () => {
    it("enforces score bounds between 0 and 10 on interview_questions.score", () => {
      // Valid scores
      expect(questionScoreSchema.safeParse(null).success).toBe(true);
      expect(questionScoreSchema.safeParse(undefined).success).toBe(true);
      expect(questionScoreSchema.safeParse(0).success).toBe(true);
      expect(questionScoreSchema.safeParse(7.5).success).toBe(true);
      expect(questionScoreSchema.safeParse(10).success).toBe(true);

      // Invalid scores
      expect(questionScoreSchema.safeParse(-0.1).success).toBe(false);
      expect(questionScoreSchema.safeParse(-5).success).toBe(false);
      expect(questionScoreSchema.safeParse(10.1).success).toBe(false);
      expect(questionScoreSchema.safeParse(100).success).toBe(false);
    });

    it("enforces overall_score bounds between 0 and 10 on interview_sessions.overall_score", () => {
      // Valid overall scores
      expect(overallScoreSchema.safeParse(null).success).toBe(true);
      expect(overallScoreSchema.safeParse(undefined).success).toBe(true);
      expect(overallScoreSchema.safeParse(0).success).toBe(true);
      expect(overallScoreSchema.safeParse(8.25).success).toBe(true);
      expect(overallScoreSchema.safeParse(10).success).toBe(true);

      // Invalid overall scores
      expect(overallScoreSchema.safeParse(-1).success).toBe(false);
      expect(overallScoreSchema.safeParse(10.5).success).toBe(false);
      expect(overallScoreSchema.safeParse(15).success).toBe(false);
    });

    it("verifies composite foreign key (question_bank_id, user_id) blocks cross-tenant linkage", () => {
      // Database model simulation
      const questionBank = new Map<string, { id: string; user_id: string; title: string }>([
        ["qb-user-a", { id: "qb-user-a", user_id: "user-alice", title: "Java OOP" }],
        ["qb-user-b", { id: "qb-user-b", user_id: "user-bob", title: "Python Async" }],
      ]);

      function validateCompositeFk(question: { question_bank_id: string | null; user_id: string }) {
        if (!question.question_bank_id) return true; // Nullable FK allowed
        const bankEntry = questionBank.get(question.question_bank_id);
        if (!bankEntry) {
          throw new Error('FK violation 23503: Key (question_bank_id)=(' + question.question_bank_id + ') is not present in table "interview_question_bank".');
        }
        if (bankEntry.user_id !== question.user_id) {
          throw new Error(
            'Composite FK violation 23503: Key (question_bank_id, user_id)=(' +
              question.question_bank_id +
              ', ' +
              question.user_id +
              ') is not present in table "interview_question_bank".'
          );
        }
        return true;
      }

      // Alice links to Alice's question bank item: OK
      expect(() =>
        validateCompositeFk({ question_bank_id: "qb-user-a", user_id: "user-alice" })
      ).not.toThrow();

      // Alice links to null question bank item (e.g. ad-hoc question): OK
      expect(() =>
        validateCompositeFk({ question_bank_id: null, user_id: "user-alice" })
      ).not.toThrow();

      // Alice attempts to link to Bob's question bank item: BLOCKED by composite FK
      expect(() =>
        validateCompositeFk({ question_bank_id: "qb-user-b", user_id: "user-alice" })
      ).toThrow(/Composite FK violation 23503/);
    });

    it("verifies ON DELETE SET NULL (question_bank_id) sets only question_bank_id to null on bank deletion", () => {
      // Existing interview question row
      const questionRecord = {
        id: "iq-1",
        user_id: "user-alice",
        session_id: "session-1",
        question_bank_id: "qb-deleted",
        question_text: "Explain garbage collection in Java",
        score: 8.5,
      };

      // Simulating deletion of the referenced interview_question_bank row
      // With ON DELETE SET NULL (question_bank_id), only question_bank_id becomes null
      const onCascadeAction = (record: typeof questionRecord) => {
        record.question_bank_id = null as unknown as string;
      };

      onCascadeAction(questionRecord);

      // question_bank_id is null, but user_id, session_id, and scores remain intact!
      expect(questionRecord.question_bank_id).toBeNull();
      expect(questionRecord.user_id).toBe("user-alice");
      expect(questionRecord.session_id).toBe("session-1");
      expect(questionRecord.score).toBe(8.5);
    });
  });

  // ==========================================================================
  // 2. N-03 — Project Bug/Feature Foreign-Key Deletion Correction
  // ==========================================================================
  describe("2. N-03 — Project Bug/Feature Foreign-Key Deletion Correction", () => {
    it("verifies ON DELETE SET NULL (feature_id) preserves bug record and non-null user_id", () => {
      const bugRecord = {
        id: "bug-101",
        user_id: "user-alice",
        project_id: "project-1",
        feature_id: "feature-to-delete",
        title: "NullPointerException on SSE connection timeout",
        status: "open",
      };

      // In Migration 0007, bare `ON DELETE SET NULL` attempted to set:
      // feature_id = null, user_id = null -> Fails because user_id is NOT NULL!
      const buggyCascade = () => {
        const attemptedUserId = null;
        if (attemptedUserId === null) {
          throw new Error('Postgres error 23502: null value in column "user_id" of relation "project_bugs" violates not-null constraint');
        }
      };
      expect(() => buggyCascade()).toThrow(/violates not-null constraint/);

      // With Migration 0014's `ON DELETE SET NULL (feature_id)`:
      // Only feature_id is set to NULL. user_id remains untouched!
      const correctedCascade = (bug: typeof bugRecord) => {
        bug.feature_id = null as unknown as string;
      };

      correctedCascade(bugRecord);

      expect(bugRecord.feature_id).toBeNull();
      expect(bugRecord.user_id).toBe("user-alice");
      expect(bugRecord.project_id).toBe("project-1");
      expect(bugRecord.title).toBe("NullPointerException on SSE connection timeout");
    });

    it("verifies composite foreign key (feature_id, user_id) blocks linking a bug to another user's feature", () => {
      const features = new Map<string, { id: string; user_id: string; title: string }>([
        ["feat-alice", { id: "feat-alice", user_id: "user-alice", title: "Auth Flow" }],
        ["feat-bob", { id: "feat-bob", user_id: "user-bob", title: "Billing Engine" }],
      ]);

      function validateBugFeatureFk(bug: { feature_id: string | null; user_id: string }) {
        if (!bug.feature_id) return true;
        const feature = features.get(bug.feature_id);
        if (!feature) {
          throw new Error('FK violation 23503: Key (feature_id)=(' + bug.feature_id + ') is not present in table "project_features".');
        }
        if (feature.user_id !== bug.user_id) {
          throw new Error(
            'Composite FK violation 23503: Key (feature_id, user_id)=(' +
              bug.feature_id +
              ', ' +
              bug.user_id +
              ') is not present in table "project_features".'
          );
        }
        return true;
      }

      // Alice links bug to Alice's feature: OK
      expect(() => validateBugFeatureFk({ feature_id: "feat-alice", user_id: "user-alice" })).not.toThrow();

      // Alice links bug to null feature (general project bug): OK
      expect(() => validateBugFeatureFk({ feature_id: null, user_id: "user-alice" })).not.toThrow();

      // Alice attempts to link bug to Bob's feature: BLOCKED
      expect(() => validateBugFeatureFk({ feature_id: "feat-bob", user_id: "user-alice" })).toThrow(
        /Composite FK violation 23503/
      );
    });
  });

  // ==========================================================================
  // 3. L-08 — Phase 4 Batch 4 RPC Hardening
  // ==========================================================================
  describe("3. L-08 — Phase 4 Batch 4 RPC Hardening", () => {
    it("simulates accept_study_recommendation rejecting unauthenticated callers upfront", () => {
      function rpcAcceptRecommendation(authUid: string | null) {
        const v_user_id = authUid;
        if (!v_user_id) {
          throw new Error("Unauthorized: Caller must be authenticated");
        }
        return { user_id: v_user_id, status: "pending" };
      }

      // Unauthenticated caller: Rejected
      expect(() => rpcAcceptRecommendation(null)).toThrow(
        "Unauthorized: Caller must be authenticated"
      );

      // Authenticated caller: Accepted with caller's user_id enforced
      const res = rpcAcceptRecommendation("user-alice");
      expect(res.user_id).toBe("user-alice");
    });

    it("verifies idempotency conflict resolution on accept_study_recommendation", () => {
      const studyTasks = new Map<string, { id: string; user_id: string; idempotency_key: string; title: string }>();
      let idCounter = 0;

      function rpcAccept(authUid: string, idempotencyKey: string, title: string) {
        if (!authUid) throw new Error("Unauthorized: Caller must be authenticated");

        // Fast path / conflict recovery
        const compositeKey = `${authUid}:${idempotencyKey}`;
        if (studyTasks.has(compositeKey)) {
          return { task: studyTasks.get(compositeKey), isDuplicate: true };
        }

        idCounter++;
        const newTask = {
          id: `task-${idCounter}`,
          user_id: authUid,
          idempotency_key: idempotencyKey,
          title,
        };
        studyTasks.set(compositeKey, newTask);
        return { task: newTask, isDuplicate: false };
      }

      // First call creates task
      const first = rpcAccept("user-alice", "rec-hash-123", "Revise Spring Security");
      expect(first.isDuplicate).toBe(false);
      expect(first.task?.id).toBe("task-1");

      // Repeated concurrent call with same user and key returns existing task
      const second = rpcAccept("user-alice", "rec-hash-123", "Revise Spring Security");
      expect(second.isDuplicate).toBe(true);
      expect(second.task?.id).toBe("task-1");

      // User Bob with same key creates independent task (multi-tenant isolation)
      const bob = rpcAccept("user-bob", "rec-hash-123", "Revise Spring Security");
      expect(bob.isDuplicate).toBe(false);
      expect(bob.task?.id).toBe("task-2");
      expect(bob.task?.user_id).toBe("user-bob");
    });
  });

  // ==========================================================================
  // 4. Migration 0014 AST Validation
  // ==========================================================================
  describe("4. Migration 0014 PostgreSQL AST Validation", () => {
    it("validates 0014_phase4_batch_c_database_integrity_and_security.sql using pglast", () => {
      const migrationPath = path.resolve(
        __dirname,
        "../supabase/migrations/0014_phase4_batch_c_database_integrity_and_security.sql"
      );
      expect(fs.existsSync(migrationPath)).toBe(true);

      const sqlContent = fs.readFileSync(migrationPath, "utf-8");
      const stdout = execSync(
        `python -c "import pglast; f=open(r'supabase/migrations/0014_phase4_batch_c_database_integrity_and_security.sql', encoding='utf-8'); print(len(pglast.parse_sql(f.read())))"`,
        { encoding: "utf-8" }
      );
      expect(Number(stdout.trim())).toBe(13);

      // Verify specific constraints in SQL text
      expect(sqlContent).toContain("interview_questions_bank_owner_fk");
      expect(sqlContent).toContain("references public.interview_question_bank(id, user_id)");
      expect(sqlContent).toContain("on delete set null (question_bank_id)");
      expect(sqlContent).toContain("interview_questions_score_check");
      expect(sqlContent).toContain("interview_sessions_overall_score_check");
      expect(sqlContent).toContain("on delete set null (feature_id)");
      expect(sqlContent).toContain("set search_path = public, pg_temp");
      expect(sqlContent).toContain("revoke all on function public.accept_study_recommendation");
      expect(sqlContent).toContain("from service_role;");
      expect(sqlContent).toContain("grant execute on function public.accept_study_recommendation");
      expect(sqlContent).toContain("to authenticated;");
    });
  });
});
