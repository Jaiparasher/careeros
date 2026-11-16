import { z } from "zod";

export const interviewTypeEnum = z.enum([
  "Technical",
  "DSA",
  "Java Backend",
  "Full Stack",
  "Project-Based",
  "Mixed",
]);

export const interviewDifficultyEnum = z.enum(["easy", "medium", "hard", "mixed"]);

export const createMockInterviewSchema = z.object({
  interviewType: interviewTypeEnum.default("Technical"),
  skills: z.array(z.string().trim()).optional().default([]),
  difficulty: interviewDifficultyEnum.default("medium"),
  questionCount: z.coerce.number().int().min(1).max(15).default(5),
});

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  questionId: z.string().uuid("Invalid question ID"),
  answer: z
    .string()
    .max(5000, "Answer cannot exceed 5,000 characters")
    .optional()
    .default(""),
  skip: z.boolean().optional().default(false),
});

export const retryEvaluationSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  questionId: z.string().uuid("Invalid question ID"),
});

export const finishInterviewSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

export const evaluationFeedbackSchema = z.object({
  score: z.number().min(0).max(10),
  technicalCorrectness: z.number().int().min(1).max(5),
  completeness: z.number().int().min(1).max(5),
  clarity: z.number().int().min(1).max(5),
  practicalDepth: z.number().int().min(1).max(5),
  tradeoffAwareness: z.number().int().min(1).max(5),
  correctConcepts: z.array(z.string()).default([]),
  missingConcepts: z.array(z.string()).default([]),
  incorrectStatements: z.array(z.string()).default([]),
  clarityAssessment: z.string().default(""),
  depthAssessment: z.string().default(""),
  improvementAdvice: z.string().default(""),
  idealAnswer: z.string().default(""),
  followUpQuestions: z.array(z.string()).default([]),
});

export type CreateMockInterviewInput = z.input<typeof createMockInterviewSchema>;
export type SubmitAnswerInput = z.input<typeof submitAnswerSchema>;
export type RetryEvaluationInput = z.input<typeof retryEvaluationSchema>;
export type EvaluationFeedback = z.infer<typeof evaluationFeedbackSchema>;

export interface MockInterviewQuestion {
  id: string;
  user_id: string;
  session_id: string;
  sequence_number: number;
  question_text: string;
  user_answer: string | null;
  technical_correctness: number | null;
  completeness: number | null;
  clarity: number | null;
  practical_depth: number | null;
  tradeoff_awareness: number | null;
  strengths: string | null;
  gaps: string | null;
  improved_answer: string | null;
  follow_up_question: string | null;
  created_at: string;
  // Extended fields
  question_bank_id?: string | null;
  skill_name?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  score?: number | null;
  incorrect_statements?: string | null;
  clarity_assessment?: string | null;
  depth_assessment?: string | null;
  improvement_advice?: string | null;
  follow_up_questions_json?: string[] | null;
  evaluation_status?: "pending" | "evaluating" | "evaluated" | "skipped" | "failed";
  evaluated_at?: string | null;
}

export interface MockInterviewSession {
  id: string;
  user_id: string;
  category: string;
  difficulty: string;
  duration_target_minutes: number | null;
  status: "in_progress" | "completed" | "abandoned";
  provider: string | null;
  model: string | null;
  prompt_version: string | null;
  overall_feedback: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  // Extended fields
  interview_type?: string;
  selected_skills?: string[];
  total_questions?: number;
  overall_score?: number | null;
  summary_json?: {
    overallPercentage: number;
    attemptedCount: number;
    skippedCount: number;
    unansweredCount: number;
    skillBreakdown: {
      skill: string;
      averageScore: number;
      questionCount: number;
    }[];
    strongAreas: string[];
    weakAreas: string[];
    recommendedRevisions: {
      topic: string;
      skill: string;
      reason: string;
    }[];
  } | null;
  questions?: MockInterviewQuestion[];
}
