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
import { geminiService, aiRateLimiter } from "@/features/ai";
import {
  getAiResumeJdAnalysisAction,
  listAiResumeJdAnalysesAction,
  connectAnalysisToApplicationAction,
  saveGeneratedQuestionToBankAction,
  deleteAiAnalysisAction,
} from "@/features/resumes/ai-actions";
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
    beforeEach(() => {
      vi.restoreAllMocks();
      aiRateLimiter.reset();
    });
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

    it("enforces AI rate limits on runAnalysis (M-01)", async () => {
      const rateSpy = vi.spyOn(aiRateLimiter, "check").mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
        retryAfterSeconds: 30,
      });

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
                      extracted_text: "Experienced Java Engineer with Spring Boot and AWS.",
                    },
                    error: null,
                  }),
                }),
              }),
            }),
            in: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      await expect(
        service.runAnalysis("user-1", {
          resumeId: "123e4567-e89b-12d3-a456-426614174000",
          customJdText: "Looking for Java developer with microservices.",
        })
      ).rejects.toThrow("Rate limit exceeded. Please wait 30 seconds before retrying.");

      rateSpy.mockRestore();
    });

    it("first save: creates question in bank and returns new ID (M-06)", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "new-question-uuid" },
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: null, // doesn't exist yet
                error: null,
              }),
              insert: mockInsert,
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      const questionId = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-q-1",
        skill: "Java",
        topic: "Concurrency",
        difficulty: "intermediate",
        questionText: "Explain CAS operations in Java atomic classes.",
        relevanceToJd: "Required topic",
        expectedAnswerPoints: ["Unsafe compareAndSwap"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      expect(questionId).toBe("new-question-uuid");
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    it("repeated save: returns existing question ID without inserting (M-06)", async () => {
      const mockInsert = vi.fn();
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "existing-question-uuid" },
                error: null,
              }),
              insert: mockInsert,
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      const questionId = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-q-1",
        skill: "Java",
        topic: "Concurrency",
        difficulty: "intermediate",
        questionText: "How does ConcurrentHashMap work?",
        relevanceToJd: "Core topic",
        expectedAnswerPoints: ["Lock striping"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      expect(questionId).toBe("existing-question-uuid");
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("two concurrent identical saves: handles race via unique constraint conflict recovery (M-06)", async () => {
      // Simulate race condition:
      // Both requests pass pre-insert check (neither sees row yet).
      // Request 1 inserts successfully.
      // Request 2 gets unique constraint conflict (code 23505) from PostgreSQL.
      // Request 2 recovers by querying existing record and returns Request 1's ID.
      let insertCount = 0;
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockImplementation(async () => {
                // If called after insert conflict, return the newly created row
                if (insertCount >= 1) {
                  return { data: { id: "concurrent-winner-id" }, error: null };
                }
                // Initial pre-check: race condition where neither sees it yet
                return { data: null, error: null };
              }),
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockImplementation(async () => {
                    insertCount++;
                    if (insertCount === 1) {
                      // Request 1 succeeds
                      return { data: { id: "concurrent-winner-id" }, error: null };
                    }
                    // Request 2 conflicts on unique constraint
                    return {
                      data: null,
                      error: {
                        code: "23505",
                        message: 'duplicate key value violates unique constraint "interview_question_bank_external_uidx"',
                      },
                    };
                  }),
                })),
              })),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      const targetQuestion = {
        id: "gen-q-race",
        skill: "Spring Boot",
        topic: "Auto Configuration",
        difficulty: "intermediate" as const,
        questionText: "How does @ConditionalOnMissingBean work in Spring Boot auto-configuration?",
        relevanceToJd: "Framework internals",
        expectedAnswerPoints: ["Bean registration order"],
        followUpQuestions: [],
        source: "gemini_generated" as const,
        isSaved: true,
      };

      const [res1, res2] = await Promise.all([
        service.saveGeneratedQuestionToBank("user-1", targetQuestion),
        service.saveGeneratedQuestionToBank("user-1", targetQuestion),
      ]);

      // Both concurrent requests return the exact same ID!
      expect(res1).toBe("concurrent-winner-id");
      expect(res2).toBe("concurrent-winner-id");
    });

    it("different questions from the same analysis save separate records (M-06)", async () => {
      const storedQuestions = new Map<string, string>();
      let idCounter = 0;

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            let lastPrompt = "";
            const chain = {
              select: vi.fn(),
              eq: vi.fn(),
              maybeSingle: vi.fn().mockImplementation(async () => {
                if (lastPrompt && storedQuestions.has(lastPrompt)) {
                  return { data: { id: storedQuestions.get(lastPrompt) }, error: null };
                }
                return { data: null, error: null };
              }),
              insert: vi.fn((payload: { question_prompt: string }) => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockImplementation(async () => {
                    idCounter++;
                    const newId = `unique-id-${idCounter}`;
                    storedQuestions.set(payload.question_prompt, newId);
                    return { data: { id: newId }, error: null };
                  }),
                })),
              })),
            };
            chain.select.mockReturnValue(chain);
            chain.eq.mockImplementation((field: string, val: string) => {
              if (field === "question_prompt") lastPrompt = val;
              return chain;
            });
            return chain;
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);

      const q1Id = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-q-kafka",
        skill: "Apache Kafka",
        topic: "Partitioning",
        difficulty: "advanced",
        questionText: "How does Kafka handle consumer partition rebalancing without latency spikes?",
        relevanceToJd: "Streaming",
        expectedAnswerPoints: ["CooperativeStickyAssignor"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      const q2Id = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-q-spring",
        skill: "Spring Boot",
        topic: "Actuator",
        difficulty: "intermediate",
        questionText: "Explain how Spring Boot Actuator exposes health check endpoints safely.",
        relevanceToJd: "Production monitoring",
        expectedAnswerPoints: ["Management port separation"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      expect(q1Id).toBe("unique-id-1");
      expect(q2Id).toBe("unique-id-2");
      expect(q1Id).not.toBe(q2Id);
    });

    it("similar but genuinely different questions save separate records (M-06)", async () => {
      const stored = new Map<string, string>();
      let count = 0;

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            let lastPrompt = "";
            const chain = {
              select: vi.fn(),
              eq: vi.fn(),
              maybeSingle: vi.fn().mockImplementation(async () => {
                if (lastPrompt && stored.has(lastPrompt)) return { data: { id: stored.get(lastPrompt) }, error: null };
                return { data: null, error: null };
              }),
              insert: vi.fn((payload: { question_prompt: string }) => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockImplementation(async () => {
                    count++;
                    const id = `diff-id-${count}`;
                    stored.set(payload.question_prompt, id);
                    return { data: { id }, error: null };
                  }),
                })),
              })),
            };
            chain.select.mockReturnValue(chain);
            chain.eq.mockImplementation((field: string, val: string) => {
              if (field === "question_prompt") lastPrompt = val;
              return chain;
            });
            return chain;
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);

      const id1 = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-1",
        skill: "Java",
        topic: "Memory",
        difficulty: "intermediate",
        questionText: "Explain Java memory model: heap vs stack memory allocation.",
        relevanceToJd: "Basics",
        expectedAnswerPoints: ["Stack frames"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      const id2 = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-2",
        skill: "Java",
        topic: "Memory",
        difficulty: "intermediate",
        questionText: "Explain Java memory model: Metaspace vs Permanent Generation.",
        relevanceToJd: "Basics",
        expectedAnswerPoints: ["Off-heap metadata"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      expect(id1).not.toBe(id2);
      expect(id1).toBe("diff-id-1");
      expect(id2).toBe("diff-id-2");
    });

    it("enforces cross-user isolation: User B saving same question prompt creates independent record (M-06)", async () => {
      const userQuestions = new Map<string, Map<string, string>>();

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            let filterUser = "";
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn((field: string, val: string) => {
                if (field === "user_id") filterUser = val;
                return {
                  eq: vi.fn((f2: string, v2: string) => ({
                    maybeSingle: vi.fn().mockImplementation(async () => {
                      const userMap = userQuestions.get(filterUser);
                      if (userMap?.has(v2)) {
                        return { data: { id: userMap.get(v2) }, error: null };
                      }
                      return { data: null, error: null };
                    }),
                  })),
                };
              }),
              insert: vi.fn((payload: { user_id: string; question_prompt: string }) => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockImplementation(async () => {
                    const id = `q-${payload.user_id}`;
                    if (!userQuestions.has(payload.user_id)) {
                      userQuestions.set(payload.user_id, new Map());
                    }
                    userQuestions.get(payload.user_id)!.set(payload.question_prompt, id);
                    return { data: { id }, error: null };
                  }),
                })),
              })),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      const sharedPrompt = {
        id: "gen-shared",
        skill: "SQL",
        topic: "Indexes",
        difficulty: "intermediate" as const,
        questionText: "What is the difference between clustered and non-clustered indexes?",
        relevanceToJd: "DB Design",
        expectedAnswerPoints: ["Physical order vs pointer"],
        followUpQuestions: [],
        source: "gemini_generated" as const,
        isSaved: true,
      };

      const userAId = await service.saveGeneratedQuestionToBank("user-alice", sharedPrompt);
      const userBId = await service.saveGeneratedQuestionToBank("user-bob", sharedPrompt);

      expect(userAId).toBe("q-user-alice");
      expect(userBId).toBe("q-user-bob");
      expect(userAId).not.toBe(userBId);
    });

    it("handles database uniqueness conflict error cleanly by returning existing ID (M-06)", async () => {
      let callNum = 0;
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockImplementation(async () => {
                callNum++;
                if (callNum === 1) return { data: null, error: null }; // initial check: not found
                return { data: { id: "recovered-existing-id" }, error: null }; // recovery query: found
              }),
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: {
                      code: "23505",
                      message: 'duplicate key value violates unique constraint "interview_question_bank_ai_prompt_uidx"',
                    },
                  }),
                })),
              })),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      const resultId = await service.saveGeneratedQuestionToBank("user-1", {
        id: "gen-conflict-test",
        skill: "Java",
        topic: "Generics",
        difficulty: "intermediate",
        questionText: "What is type erasure in Java Generics?",
        relevanceToJd: "Type safety",
        expectedAnswerPoints: ["Bridge methods"],
        followUpQuestions: [],
        source: "gemini_generated",
        isSaved: true,
      });

      expect(resultId).toBe("recovered-existing-id");
    });

    it("throws explicit database error when report persistence fails (M-07)", async () => {
      const mockGenerate = vi.spyOn(geminiService, "generateContent").mockResolvedValue({
        text: JSON.stringify({
          readinessLevel: "Strong Match",
          headline: "Match",
          executiveSummary: "Good fit",
          keyStrengthsSummary: [],
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
          nicheQuestionsNeeded: [],
        }),
        model: "gemini-3.5-flash",
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "resumes") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    is: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: "123e4567-e89b-12d3-a456-426614174000",
                          user_id: "user-1",
                          extracted_text: "Experienced Java Engineer.",
                        },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "interview_question_bank") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          if (table === "resume_jd_analyses") {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: "database disk full" },
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const service = new ResumeJdAnalysisService(mockSupabase);
      await expect(
        service.runAnalysis("user-1", {
          resumeId: "123e4567-e89b-12d3-a456-426614174000",
          customJdText: "Java engineer needed with Spring Boot.",
        })
      ).rejects.toThrow("Failed to persist resume analysis report: database disk full");

      mockGenerate.mockRestore();
    });
  });

  describe("6. Resume Analysis Server Action Zod Validation (M-05)", () => {
    it("getAiResumeJdAnalysisAction rejects invalid non-uuid analysisId", async () => {
      const result = await getAiResumeJdAnalysisAction("not-a-uuid");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid analysis ID");
    });

    it("listAiResumeJdAnalysesAction rejects invalid filter uuids", async () => {
      const result = await listAiResumeJdAnalysesAction({
        resumeId: "invalid-resume-uuid",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid resume ID");
    });

    it("connectAnalysisToApplicationAction rejects invalid analysisId or applicationId", async () => {
      const result = await connectAnalysisToApplicationAction("invalid-analysis", "not-a-uuid");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid analysis ID");

      const result2 = await connectAnalysisToApplicationAction(
        "123e4567-e89b-12d3-a456-426614174000",
        "invalid-app-uuid"
      );
      expect(result2.success).toBe(false);
      expect(result2.error).toContain("Invalid application ID");
    });

    it("saveGeneratedQuestionToBankAction rejects invalid question payload", async () => {
      const result = await saveGeneratedQuestionToBankAction({} as unknown as import("@/features/resumes/ai-analyzer-schema").TargetedInterviewQuestion);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("deleteAiAnalysisAction rejects invalid non-uuid analysisId", async () => {
      const result = await deleteAiAnalysisAction("not-a-uuid");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid analysis ID");
    });
  });
});
