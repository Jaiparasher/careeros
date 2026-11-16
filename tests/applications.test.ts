import { describe, it, expect } from "vitest";
import {
  createApplicationSchema,
  updateApplicationSchema,
  createInterviewRoundSchema,
  updateInterviewRoundSchema,
  stageChangeSchema,
  offerDetailsSchema,
  stageLabels,
  generateRecruiterFollowUpTemplate,
  generateReferralRequestTemplate,
  generateInterviewThankYouTemplate,
  type ApplicationStage,
} from "@/features/applications/schema";

describe("Phase 3 Batch 2 Job Applications - Schema & Domain Tests", () => {
  describe("Application Schema & 11 Stages", () => {
    const allStages: ApplicationStage[] = [
      "interested",
      "applied",
      "referral_requested",
      "screening",
      "technical_round_1",
      "technical_round_2",
      "managerial_round",
      "hr",
      "offer",
      "rejected",
      "on_hold",
    ];

    it("verifies all 11 required pipeline stages have human-readable labels", () => {
      expect(allStages).toHaveLength(11);
      allStages.forEach((stage) => {
        expect(stageLabels[stage]).toBeDefined();
        expect(stageLabels[stage].length).toBeGreaterThan(2);
      });
    });

    it("accepts valid application with default values", () => {
      const input = {
        company: "Google",
        role_title: "Software Engineer III - Backend",
      };

      const parsed = createApplicationSchema.parse(input);
      expect(parsed.company).toBe("Google");
      expect(parsed.role_title).toBe("Software Engineer III - Backend");
      expect(parsed.stage).toBe("interested");
      expect(parsed.work_mode).toBe("hybrid");
      expect(parsed.employment_type).toBe("full_time");
      expect(parsed.referral_status).toBe("not_requested");
    });

    it("accepts application across all 11 stages", () => {
      allStages.forEach((stage) => {
        const parsed = createApplicationSchema.parse({
          company: `Company for ${stage}`,
          role_title: "Backend Engineer",
          stage,
        });
        expect(parsed.stage).toBe(stage);
      });
    });

    it("rejects unknown application stage", () => {
      expect(() => {
        createApplicationSchema.parse({
          company: "Acme",
          role_title: "Developer",
          stage: "interviewing", // invalid; must be specific round or stage
        });
      }).toThrow();
    });

    it("validates work mode options", () => {
      ["remote", "hybrid", "onsite"].forEach((mode) => {
        const parsed = createApplicationSchema.parse({
          company: "Acme",
          role_title: "Developer",
          work_mode: mode as "remote" | "hybrid" | "onsite",
        });
        expect(parsed.work_mode).toBe(mode);
      });

      expect(() => {
        createApplicationSchema.parse({
          company: "Acme",
          role_title: "Developer",
          work_mode: "wfh",
        });
      }).toThrow();
    });

    it("validates updateApplicationSchema partial updates", () => {
      const parsed = updateApplicationSchema.parse({
        stage: "screening",
        next_follow_up_at: "2026-11-20",
      });
      expect(parsed.stage).toBe("screening");
      expect(parsed.next_follow_up_at).toBe("2026-11-20");
      expect(parsed.company).toBeUndefined();
    });
  });

  describe("Stage Transition Schema", () => {
    it("validates stageChangeSchema", () => {
      const parsed = stageChangeSchema.parse({
        new_stage: "technical_round_1",
        notes: "Cleared screening with HR; scheduled 60min DSA interview",
      });
      expect(parsed.new_stage).toBe("technical_round_1");
      expect(parsed.notes).toContain("DSA");
    });
  });

  describe("Interview Rounds Schema", () => {
    it("accepts valid interview round with all result options", () => {
      const results = ["pending", "passed", "failed", "rescheduled", "cancelled"] as const;

      results.forEach((result) => {
        const parsed = createInterviewRoundSchema.parse({
          round_number: 1,
          round_name: "Technical Screening",
          result,
          topics: ["Java", "Multithreading"],
        });
        expect(parsed.result).toBe(result);
        expect(parsed.topics).toContain("Multithreading");
      });
    });

    it("validates updateInterviewRoundSchema partial updates", () => {
      const parsed = updateInterviewRoundSchema.parse({
        result: "passed",
        performance_notes: "Answered LRU cache and concurrency questions with strong trade-offs",
      });
      expect(parsed.result).toBe("passed");
      expect(parsed.performance_notes).toContain("LRU cache");
    });
  });

  describe("Offer Details Schema", () => {
    it("validates complete offer breakdown", () => {
      const offer = {
        base_salary_lpa: 16.5,
        bonus_lpa: 2.0,
        equity_details: "₹6L stock grant over 4 years",
        benefits_summary: "Comprehensive health insurance and annual learning budget",
        offer_deadline: "2026-12-01",
        decision: "pending" as const,
      };

      const parsed = offerDetailsSchema.parse(offer);
      expect(parsed.base_salary_lpa).toBe(16.5);
      expect(parsed.bonus_lpa).toBe(2.0);
      expect(parsed.equity_details).toContain("stock grant");
      expect(parsed.decision).toBe("pending");
    });
  });

  describe("Outreach & Follow-Up Message Templates", () => {
    it("generates recruiter follow-up template with customized placeholders", () => {
      const template = generateRecruiterFollowUpTemplate({
        company: "Stripe",
        role: "Senior Java Engineer",
        applicantName: "Jai",
        appliedDate: "November 10, 2026",
      });

      expect(template).toContain("Stripe");
      expect(template).toContain("Senior Java Engineer");
      expect(template).toContain("November 10, 2026");
      expect(template).toContain("Jai");
      expect(template).toContain("Java, Spring Boot, REST APIs");
    });

    it("generates referral request template with job URL", () => {
      const template = generateReferralRequestTemplate({
        company: "Amazon",
        role: "SDE II",
        applicantName: "Jai",
        connectionName: "Rahul",
        jobUrl: "https://amazon.jobs/12345",
      });

      expect(template).toContain("Hi Rahul");
      expect(template).toContain("Amazon");
      expect(template).toContain("SDE II");
      expect(template).toContain("https://amazon.jobs/12345");
      expect(template).toContain("Jai");
    });

    it("generates post-interview thank you note", () => {
      const template = generateInterviewThankYouTemplate({
        company: "Uber",
        role: "Backend Engineer",
        interviewerName: "Dr. Rao",
        roundName: "System Design Round",
      });

      expect(template).toContain("Hi Dr. Rao");
      expect(template).toContain("Uber");
      expect(template).toContain("Backend Engineer");
      expect(template).toContain("System Design Round");
    });
  });
});
