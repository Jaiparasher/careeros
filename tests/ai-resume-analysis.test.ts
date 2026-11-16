import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  runAiAnalysisInputSchema,
  rawGeminiAnalysisOutputSchema,
} from "@/features/resumes/ai-analyzer-schema";
import {
  extractJsonFromText,
  generateAiResumeJdAnalysis,
} from "@/features/resumes/ai-analyzer";
import { ResumeJdAnalysisService } from "@/features/resumes/ai-analysis-service";
import { geminiService } from "@/features/ai";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Phase 4 Batch 3 Unit Tests: AI Resume & JD Intelligence", () => {
  describe("1. Schema & Input Validation", () => {
    it("rejects invalid input when both jobDescriptionId and customJdText are missing", () => {
      const result = runAiAnalysisInputSchema.safeParse({
        resumeId: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Please select an existing job description");
      }
    });

    it("rejects customJdText shorter than 10 characters", () => {
      const result = runAiAnalysisInputSchema.safeParse({
        resumeId: "123e4567-e89b-12d3-a456-426614174000",
        customJdText: "Too short",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid input with jobDescriptionId", () => {
      const result = runAiAnalysisInputSchema.safeParse({
        resumeId: "123e4567-e89b-12d3-a456-426614174000",
        jobDescriptionId: "123e4567-e89b-12d3-a456-426614174001",
        targetRole: "Senior Java Backend Engineer",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with customJdText exceeding 10 characters", () => {
      const result = runAiAnalysisInputSchema.safeParse({
        resumeId: "123e4567-e89b-12d3-a456-426614174000",
        customJdText: "We are seeking a senior Java backend engineer with Spring Boot and Kafka experience.",
        customCompany: "Fintech Corp",
        customRoleTitle: "Lead Engineer",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("2. JSON Extraction and Fence Parsing", () => {
    it("extracts pure JSON from raw text without fences", () => {
      const raw = '{"readinessLevel": "Strong Match", "headline": "Test"}';
      expect(extractJsonFromText(raw)).toBe(raw);
    });

    it("extracts JSON enclosed within markdown fences", () => {
      const raw = '```json\n{"readinessLevel": "Strong Match", "headline": "Test"}\n```';
      expect(extractJsonFromText(raw)).toBe('{"readinessLevel": "Strong Match", "headline": "Test"}');
    });

    it("extracts JSON with surrounding conversational commentary", () => {
      const raw = 'Here is the analysis:\n```json\n{"readinessLevel": "Moderate Match"}\n```\nHope this helps!';
      expect(extractJsonFromText(raw)).toBe('{"readinessLevel": "Moderate Match"}');
    });
  });

  describe("3. Structured Output & Three-Tier Skill Classification", () => {
    it("validates compliant raw AI output against schema", () => {
      const sample = {
        readinessLevel: "Moderate Match",
        headline: "Solid Core Java Experience, Microservices Gaps",
        executiveSummary: "Strong hands-on Java and Spring Boot experience.",
        keyStrengthsSummary: ["Java concurrency", "Spring Boot REST"],
        criticalGapsSummary: ["No Kubernetes or Kafka production evidence"],
        matchingSkills: [
          {
            name: "Java",
            category: "Languages",
            evidenceFromResume: "Built high-throughput payment processor",
            importanceInJd: "critical",
          },
        ],
        mentionedNotDemonstrated: [
          {
            name: "Apache Kafka",
            category: "Messaging",
            mentionContext: "Listed in skills section",
            missingEvidence: "No project bullets detailing consumer groups or partition key design",
          },
        ],
        missingSkills: [
          {
            name: "Docker",
            category: "DevOps",
            importanceInJd: "high",
            suggestedAction: "Complete containerization module in Learning Roadmap",
          },
        ],
        partiallyMatchingOrRelated: [
          {
            name: "PostgreSQL",
            category: "Databases",
            relatedExperienceFound: "Extensive MySQL schema design",
            missingAspects: "No specific pgvector or PostgreSQL indexing mentioned",
          },
        ],
        bulletImprovements: [
          {
            originalBullet: "Worked on payment gateway using Spring Boot.",
            proposedBullet: "Architected Spring Boot payment pipeline processing [N transactions/sec], reducing latency by [X%].",
            whyStronger: "Pairs technology with business impact and measurable throughput.",
            metricsOrDetailsUserMustSupply: ["Peak transactions per second", "Latency reduction percentage"],
          },
        ],
        screeningQuestions: [
          {
            question: "Can you describe your experience with high-volume message queues?",
            rationale: "JD heavily emphasizes Kafka but resume only lists it in keywords.",
            recommendedTalkingPoints: ["Consumer offsets", "Partition rebalancing", "Dead-letter queues"],
          },
        ],
        technicalInterviewTopics: [
          {
            topic: "Spring Boot Auto-configuration & Bean Lifecycle",
            skill: "Spring Boot",
            importance: "high",
            focusArea: "DispatcherServlet and conditional annotations",
          },
        ],
        nicheQuestionsNeeded: [
          {
            skill: "Apache Kafka",
            topic: "Consumer Lag and Partitioning",
            difficulty: "intermediate",
            questionText: "How do you detect and resolve consumer lag in high-throughput Kafka clusters?",
            relevanceToJd: "Target JD requires real-time streaming expertise.",
            expectedAnswerPoints: ["Offset monitoring", "Scaling consumer group members"],
            followUpQuestions: ["What happens during partition rebalance?"],
          },
        ],
      };

      const parsed = rawGeminiAnalysisOutputSchema.safeParse(sample);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.readinessLevel).toBe("Moderate Match");
        expect(parsed.data.matchingSkills.length).toBe(1);
        expect(parsed.data.mentionedNotDemonstrated.length).toBe(1);
        expect(parsed.data.missingSkills.length).toBe(1);
        // Verify metric placeholders in bullet improvement
        expect(parsed.data.bulletImprovements[0].proposedBullet).toContain("[N transactions/sec]");
        expect(parsed.data.bulletImprovements[0].metricsOrDetailsUserMustSupply.length).toBe(2);
      }
    });
  });

  describe("4. Duplicate Question Prevention & Bank Integration", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("prioritizes bank questions and prevents duplicate question prompts", async () => {
      const mockGenerateContent = vi.spyOn(geminiService, "generateContent").mockResolvedValueOnce({
        text: JSON.stringify({
          readinessLevel: "Strong Match",
          headline: "Strong Match for Java Role",
          executiveSummary: "Great fit.",
          keyStrengthsSummary: ["Java"],
          criticalGapsSummary: [],
          matchingSkills: [],
          mentionedNotDemonstrated: [],
          missingSkills: [],
          partiallyMatchingOrRelated: [],
          demonstratedExperience: [],
          undemonstratedRequirements: [],
          jdKeywords: [],
          bulletImprovements: [],
          screeningQuestions: [],
          technicalInterviewTopics: [],
          nicheQuestionsNeeded: [
            // Exact duplicate of bank question prompt (case-insensitive)
            {
              skill: "Java",
              topic: "Concurrency",
              difficulty: "intermediate",
              questionText: "How does ConcurrentHashMap achieve high concurrency?",
              relevanceToJd: "Required topic",
              expectedAnswerPoints: ["Lock striping / CAS"],
              followUpQuestions: ["What about volatile reads?"],
            },
            // Unique niche question
            {
              skill: "Microservices",
              topic: "Saga Pattern",
              difficulty: "advanced",
              questionText: "Explain how you implement distributed transactions with the Saga pattern.",
              relevanceToJd: "Required architecture topic",
              expectedAnswerPoints: ["Compensating transactions"],
              followUpQuestions: [],
            },
          ],
        }),
      } as unknown as Awaited<ReturnType<typeof geminiService.generateContent>>);

      const bankQuestions = [
        {
          id: "bank-q1-id",
          skill_name: "Java",
          topic: "Concurrency",
          difficulty: "intermediate",
          question_prompt: "How does ConcurrentHashMap achieve high concurrency?",
          expected_answer_points: ["CAS operations"],
          follow_up_questions: [],
        },
      ];

      const report = await generateAiResumeJdAnalysis({
        resumeText: "Java engineer with 4 years experience.",
        resumeVersion: "v1",
        jdText: "Looking for Java engineer with microservices expertise.",
        company: "Tech Giant",
        roleTitle: "Java Backend Engineer",
        bankQuestions,
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      // The duplicate prompt should have been filtered out!
      expect(report.targetedInterviewQuestions.length).toBe(2);
      // First is bank question
      expect(report.targetedInterviewQuestions[0].source).toBe("question_bank");
      expect(report.targetedInterviewQuestions[0].isSaved).toBe(true);
      // Second is the unique niche question
      expect(report.targetedInterviewQuestions[1].source).toBe("gemini_generated");
      expect(report.targetedInterviewQuestions[1].isSaved).toBe(false);
      expect(report.targetedInterviewQuestions[1].questionText).toContain("Saga pattern");
    });
  });

  describe("5. Service Ownership & Boundary Guards", () => {
    it("throws error when resume does not exist or user lacks access", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      await expect(
        service.runAnalysis("user-1", {
          resumeId: "123e4567-e89b-12d3-a456-426614174000",
          customJdText: "Java Developer wanted with Spring Boot.",
        })
      ).rejects.toThrow("Resume not found or access denied.");
    });

    it("throws error when resume has empty extracted text", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "123e4567-e89b-12d3-a456-426614174000",
                      user_id: "user-1",
                      extracted_text: "   ", // whitespace only
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      await expect(
        service.runAnalysis("user-1", {
          resumeId: "123e4567-e89b-12d3-a456-426614174000",
          customJdText: "Java Developer wanted with Spring Boot.",
        })
      ).rejects.toThrow("The selected resume has no extracted text.");
    });
  });
});
