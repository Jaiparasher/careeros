import { z } from "zod";

export const runAiAnalysisInputSchema = z
  .object({
    resumeId: z.string().uuid("Invalid resume ID"),
    jobDescriptionId: z.string().uuid("Invalid job description ID").optional().nullable(),
    customJdText: z.string().trim().max(20000).optional(),
    customCompany: z.string().trim().max(120).optional(),
    customRoleTitle: z.string().trim().max(120).optional(),
    targetRole: z.string().trim().max(100).optional(),
    applicationId: z.string().uuid("Invalid application ID").optional().nullable(),
  })
  .refine(
    (data) => Boolean(data.jobDescriptionId || (data.customJdText && data.customJdText.length >= 10)),
    {
      message: "Please select an existing job description or enter at least 10 characters of job description text.",
      path: ["customJdText"],
    }
  );

export type RunAiAnalysisInput = z.infer<typeof runAiAnalysisInputSchema>;

export const readinessLevelEnum = z.enum([
  "Strong Match",
  "Moderate Match",
  "Growth Match",
  "Low Match",
]);
export type ReadinessLevel = z.infer<typeof readinessLevelEnum>;

export const matchingSkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  evidenceFromResume: z.string(),
  importanceInJd: z.enum(["critical", "high", "medium"]).default("high"),
});
export type MatchingSkill = z.infer<typeof matchingSkillSchema>;

export const mentionedNotDemonstratedSkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  mentionContext: z.string(),
  missingEvidence: z.string(),
});
export type MentionedNotDemonstratedSkill = z.infer<typeof mentionedNotDemonstratedSkillSchema>;

export const missingSkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  importanceInJd: z.enum(["critical", "high", "medium"]).default("high"),
  suggestedAction: z.string(),
});
export type MissingSkill = z.infer<typeof missingSkillSchema>;

export const partiallyMatchingSkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  relatedExperienceFound: z.string(),
  missingAspects: z.string(),
});
export type PartiallyMatchingSkill = z.infer<typeof partiallyMatchingSkillSchema>;

export const bulletImprovementSchema = z.object({
  originalBullet: z.string(),
  proposedBullet: z.string(),
  whyStronger: z.string(),
  metricsOrDetailsUserMustSupply: z.array(z.string()).default([]),
});
export type BulletImprovement = z.infer<typeof bulletImprovementSchema>;

export const screeningQuestionSchema = z.object({
  question: z.string(),
  rationale: z.string(),
  recommendedTalkingPoints: z.array(z.string()).default([]),
});
export type ScreeningQuestion = z.infer<typeof screeningQuestionSchema>;

export const technicalInterviewTopicSchema = z.object({
  topic: z.string(),
  skill: z.string(),
  importance: z.enum(["high", "medium"]).default("high"),
  focusArea: z.string(),
});
export type TechnicalInterviewTopic = z.infer<typeof technicalInterviewTopicSchema>;

export const targetedInterviewQuestionSchema = z.object({
  id: z.string(),
  skill: z.string(),
  topic: z.string(),
  difficulty: z.enum(["basic", "intermediate", "advanced", "beginner", "easy", "medium", "hard"]).default("intermediate"),
  questionText: z.string(),
  relevanceToJd: z.string(),
  expectedAnswerPoints: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  source: z.enum(["question_bank", "gemini_generated"]).default("question_bank"),
  isSaved: z.boolean().default(true),
});
export type TargetedInterviewQuestion = z.infer<typeof targetedInterviewQuestionSchema>;

export const rawGeminiAnalysisOutputSchema = z.object({
  readinessLevel: readinessLevelEnum.default("Moderate Match"),
  headline: z.string().default("Job Description Alignment Analysis"),
  executiveSummary: z.string().default("Analysis completed."),
  keyStrengthsSummary: z.array(z.string()).default([]),
  criticalGapsSummary: z.array(z.string()).default([]),
  matchingSkills: z.array(matchingSkillSchema).default([]),
  mentionedNotDemonstrated: z.array(mentionedNotDemonstratedSkillSchema).default([]),
  missingSkills: z.array(missingSkillSchema).default([]),
  partiallyMatchingOrRelated: z.array(partiallyMatchingSkillSchema).default([]),
  demonstratedExperience: z.array(
    z.object({
      highlight: z.string(),
      relevanceToJd: z.string(),
      sourceContext: z.string().default(""),
    })
  ).default([]),
  undemonstratedRequirements: z.array(
    z.object({
      requirement: z.string(),
      explanation: z.string(),
      howToAddressInInterview: z.string(),
    })
  ).default([]),
  jdKeywords: z.array(
    z.object({
      keyword: z.string(),
      importance: z.enum(["critical", "high", "medium"]).default("high"),
      foundInResume: z.boolean(),
      context: z.string().default(""),
    })
  ).default([]),
  bulletImprovements: z.array(bulletImprovementSchema).default([]),
  screeningQuestions: z.array(screeningQuestionSchema).default([]),
  technicalInterviewTopics: z.array(technicalInterviewTopicSchema).default([]),
  nicheQuestionsNeeded: z.array(
    z.object({
      skill: z.string(),
      topic: z.string(),
      difficulty: z.enum(["basic", "intermediate", "advanced"]).default("intermediate"),
      questionText: z.string(),
      relevanceToJd: z.string(),
      expectedAnswerPoints: z.array(z.string()).default([]),
      followUpQuestions: z.array(z.string()).default([]),
    })
  ).default([]),
});

export type RawGeminiAnalysisOutput = z.infer<typeof rawGeminiAnalysisOutputSchema>;

export interface AiResumeJdAnalysisReport {
  id?: string;
  resumeId: string;
  jobDescriptionId?: string | null;
  applicationId?: string | null;
  company: string;
  roleTitle: string;
  targetRole?: string | null;
  resumeVersion: string;
  readinessLevel: ReadinessLevel;
  headline: string;
  executiveSummary: string;
  keyStrengthsSummary: string[];
  criticalGapsSummary: string[];
  matchingSkills: MatchingSkill[];
  mentionedNotDemonstrated: MentionedNotDemonstratedSkill[];
  missingSkills: MissingSkill[];
  partiallyMatchingOrRelated: PartiallyMatchingSkill[];
  demonstratedExperience: Array<{ highlight: string; relevanceToJd: string; sourceContext: string }>;
  undemonstratedRequirements: Array<{ requirement: string; explanation: string; howToAddressInInterview: string }>;
  jdKeywords: Array<{ keyword: string; importance: "critical" | "high" | "medium"; foundInResume: boolean; context: string }>;
  bulletImprovements: BulletImprovement[];
  screeningQuestions: ScreeningQuestion[];
  technicalInterviewTopics: TechnicalInterviewTopic[];
  targetedInterviewQuestions: TargetedInterviewQuestion[];
  analyzedAt: string;
}
