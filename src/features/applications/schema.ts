import { z } from "zod";

export const applicationStageEnum = z.enum([
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
]);

export type ApplicationStage = z.infer<typeof applicationStageEnum>;

export const stageLabels: Record<ApplicationStage, string> = {
  interested: "Interested",
  applied: "Applied",
  referral_requested: "Referral Requested",
  screening: "Recruiter Screen",
  technical_round_1: "Technical Round 1",
  technical_round_2: "Technical Round 2",
  managerial_round: "Managerial Round",
  hr: "HR Round",
  offer: "Offer",
  rejected: "Rejected",
  on_hold: "On Hold",
};

export const workModeEnum = z.enum(["remote", "hybrid", "onsite"]);
export type WorkMode = z.infer<typeof workModeEnum>;

export const employmentTypeEnum = z.enum([
  "full_time",
  "contract",
  "internship",
  "part_time",
]);
export type EmploymentType = z.infer<typeof employmentTypeEnum>;

export const referralStatusEnum = z.enum([
  "not_requested",
  "requested",
  "referred",
  "declined",
]);
export type ReferralStatus = z.infer<typeof referralStatusEnum>;

export const interviewResultEnum = z.enum([
  "pending",
  "passed",
  "failed",
  "rescheduled",
  "cancelled",
]);
export type InterviewResult = z.infer<typeof interviewResultEnum>;

export const activityTypeEnum = z.enum([
  "stage_change",
  "created",
  "interview_scheduled",
  "interview_completed",
  "note_added",
  "followup_updated",
  "offer_updated",
  "archived",
]);
export type ActivityType = z.infer<typeof activityTypeEnum>;

export const offerDetailsSchema = z.object({
  base_salary_lpa: z.number().nonnegative().optional().nullable(),
  bonus_lpa: z.number().nonnegative().optional().nullable(),
  equity_details: z.string().optional().default(""),
  benefits_summary: z.string().optional().default(""),
  offer_deadline: z.string().optional().nullable(),
  decision: z.enum(["pending", "accepted", "declined"]).default("pending"),
});
export type OfferDetails = z.infer<typeof offerDetailsSchema>;

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required").max(120),
  role_title: z.string().min(1, "Role title is required").max(120),
  job_url: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  careers_url: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  job_description: z.string().max(10000).optional().default(""),
  location: z.string().max(120).optional().default(""),
  work_mode: workModeEnum.default("hybrid"),
  employment_type: employmentTypeEnum.default("full_time"),
  stage: applicationStageEnum.default("interested"),
  salary_min_lpa: z.number().nonnegative().optional().nullable(),
  salary_max_lpa: z.number().nonnegative().optional().nullable(),
  expected_ctc_lpa: z.number().nonnegative().optional().nullable(),
  applied_salary_lpa: z.number().nonnegative().optional().nullable(),
  recruiter_name: z.string().max(100).optional().default(""),
  recruiter_contact: z.string().max(150).optional().default(""),
  referral_name: z.string().max(100).optional().default(""),
  referral_contact: z.string().max(150).optional().default(""),
  referral_status: referralStatusEnum.default("not_requested"),
  discovered_on: z.string().optional().nullable(),
  application_date: z.string().optional().nullable(),
  next_follow_up_at: z.string().optional().nullable(),
  interview_date: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().default(""),
  rejection_reason: z.string().max(500).optional().default(""),
  offer_details: offerDetailsSchema.optional().default({}),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const stageChangeSchema = z.object({
  new_stage: applicationStageEnum,
  notes: z.string().optional().default(""),
});

export const createInterviewRoundSchema = z.object({
  round_number: z.number().int().positive().default(1),
  round_name: z.string().min(1, "Round name is required").max(100),
  interview_at: z.string().optional().nullable(),
  interviewer_name: z.string().max(100).optional().default(""),
  interviewer_title: z.string().max(100).optional().default(""),
  topics: z.array(z.string()).default([]),
  questions_asked: z.array(z.string()).default([]),
  performance_notes: z.string().max(5000).optional().default(""),
  result: interviewResultEnum.default("pending"),
  follow_up_notes: z.string().max(2000).optional().default(""),
});

export const updateInterviewRoundSchema = createInterviewRoundSchema.partial();

export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.input<typeof updateApplicationSchema>;
export type StageChangeInput = z.input<typeof stageChangeSchema>;
export type CreateInterviewRoundInput = z.input<typeof createInterviewRoundSchema>;
export type UpdateInterviewRoundInput = z.input<typeof updateInterviewRoundSchema>;

// ─── FOLLOW-UP & REFERRAL MESSAGE TEMPLATES ───────────────────────────────────

export function generateRecruiterFollowUpTemplate({
  company,
  role,
  applicantName,
  appliedDate,
}: {
  company: string;
  role: string;
  applicantName: string;
  appliedDate?: string;
}) {
  const dateMention = appliedDate ? ` on ${appliedDate}` : "";
  return `Hi [Recruiter Name],

I hope you're having a productive week.

I recently submitted my application${dateMention} for the ${role} position at ${company}. With my background in Java, Spring Boot, REST APIs, and microservices engineering, I am very excited about ${company}'s mission and technical challenges.

I wanted to politely follow up to check if there are any updates regarding the review process or if I can provide any additional information to assist with your evaluation.

Thank you very much for your time and consideration.

Best regards,
${applicantName}
LinkedIn / Portfolio`;
}

export function generateReferralRequestTemplate({
  company,
  role,
  applicantName,
  connectionName,
  jobUrl,
}: {
  company: string;
  role: string;
  applicantName: string;
  connectionName?: string;
  jobUrl?: string;
}) {
  const greeting = connectionName ? `Hi ${connectionName}` : "Hi";
  const linkText = jobUrl ? ` (${jobUrl})` : "";
  return `${greeting},

I hope you are doing well!

I noticed an exciting opening for a ${role} at ${company}${linkText}. Given my experience with backend development in Java, Spring Boot, PostgreSQL, and scalable systems, I believe my skillset is a great match for what the team is looking for.

Would you be open to submitting an internal referral on my behalf? I have my resume ready to share along with a short summary of how my experience aligns with the role requirements.

I completely understand if you're unable to at this time. Thank you so much for your support!

Warm regards,
${applicantName}`;
}

export function generateInterviewThankYouTemplate({
  company,
  role,
  interviewerName,
  roundName,
}: {
  company: string;
  role: string;
  interviewerName?: string;
  roundName?: string;
}) {
  const name = interviewerName || "[Interviewer Name]";
  const round = roundName ? ` during our ${roundName}` : "";
  return `Hi ${name},

Thank you very much for taking the time to speak with me today${round} regarding the ${role} role at ${company}.

I really enjoyed our discussion about the engineering challenges your team is solving and learning more about how ${company} approaches scale and resilience. Our conversation reinforced my enthusiasm for the opportunity to contribute with my background in Java and backend architecture.

Please feel free to reach out if you need any additional details from my end. I look forward to the next steps in the process!

Best regards,
[Your Name]`;
}
