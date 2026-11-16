import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ApplicationStage,
  type CreateApplicationInput,
  type UpdateApplicationInput,
  type CreateInterviewRoundInput,
  type UpdateInterviewRoundInput,
  type OfferDetails,
  stageLabels,
} from "./schema";

export interface JobApplicationRecord {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  job_url: string | null;
  careers_url: string | null;
  job_description: string | null;
  location: string | null;
  work_mode: "remote" | "hybrid" | "onsite";
  employment_type: "full_time" | "contract" | "internship" | "part_time";
  stage: ApplicationStage;
  salary_min_lpa: number | null;
  salary_max_lpa: number | null;
  expected_ctc_lpa: number | null;
  applied_salary_lpa: number | null;
  recruiter_name: string | null;
  recruiter_contact: string | null;
  referral_name: string | null;
  referral_contact: string | null;
  referral_status: "not_requested" | "requested" | "referred" | "declined";
  discovered_on: string | null;
  application_date: string | null;
  next_follow_up_at: string | null;
  interview_date: string | null;
  rejection_reason: string | null;
  notes: string | null;
  offer_details: OfferDetails | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationActivityRecord {
  id: string;
  user_id: string;
  application_id: string;
  from_stage: string | null;
  to_stage: string | null;
  activity_type:
    | "stage_change"
    | "created"
    | "interview_scheduled"
    | "interview_completed"
    | "note_added"
    | "followup_updated"
    | "offer_updated"
    | "archived";
  title: string;
  description: string | null;
  created_at: string;
}

export interface InterviewRoundRecord {
  id: string;
  user_id: string;
  application_id: string;
  round_number: number;
  round_name: string;
  interview_at: string | null;
  interviewer_name: string | null;
  interviewer_title: string | null;
  topics: string[];
  questions_asked: string[];
  performance_notes: string | null;
  result: "pending" | "passed" | "failed" | "rescheduled" | "cancelled";
  follow_up_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationsSummaryStats {
  total: number;
  active: number;
  interviewing: number;
  offers: number;
  rejected: number;
  dueTodayCount: number;
  overdueCount: number;
  upcomingInterviewsCount: number;
  awaitingResponseCount: number;
}

// ─── QUERY APPLICATIONS ───────────────────────────────────────────────────────

export async function getApplications(
  supabase: SupabaseClient,
  userId: string,
  filter?: {
    stage?: string;
    work_mode?: string;
    search?: string;
  }
): Promise<JobApplicationRecord[]> {
  let query = supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (filter?.stage && filter.stage !== "all") {
    query = query.eq("stage", filter.stage);
  }
  if (filter?.work_mode && filter.work_mode !== "all") {
    query = query.eq("work_mode", filter.work_mode);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch job applications: ${error.message}`);
  }

  let list = (data || []) as JobApplicationRecord[];

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (app) =>
        app.company.toLowerCase().includes(q) ||
        app.role_title.toLowerCase().includes(q) ||
        (app.location && app.location.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getApplicationById(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string
): Promise<JobApplicationRecord | null> {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch application ${applicationId}: ${error.message}`);
  }

  return (data as JobApplicationRecord) ?? null;
}

// ─── DUPLICATE APPLICATION DETECTION ─────────────────────────────────────────

export async function checkDuplicateApplication(
  supabase: SupabaseClient,
  userId: string,
  company: string,
  roleTitle: string,
  jobUrl?: string | null,
  excludeId?: string
): Promise<{
  hasDuplicate: boolean;
  duplicateApp?: JobApplicationRecord;
  reason?: string;
}> {
  const cleanCompany = company.trim().toLowerCase();
  const cleanRole = roleTitle.trim().toLowerCase();
  const cleanUrl = jobUrl ? jobUrl.trim().toLowerCase() : null;

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return { hasDuplicate: false };
  }

  const existingApps = (data as JobApplicationRecord[]).filter(
    (app) => !excludeId || app.id !== excludeId
  );

  // 1. Exact job URL match
  if (cleanUrl) {
    const urlMatch = existingApps.find(
      (app) => app.job_url && app.job_url.trim().toLowerCase() === cleanUrl
    );
    if (urlMatch) {
      return {
        hasDuplicate: true,
        duplicateApp: urlMatch,
        reason: `An application with the same Job URL already exists (${urlMatch.company} - ${urlMatch.role_title}, Stage: ${stageLabels[urlMatch.stage] || urlMatch.stage}).`,
      };
    }
  }

  // 2. Company & Role Match
  const companyRoleMatch = existingApps.find(
    (app) =>
      app.company.trim().toLowerCase() === cleanCompany &&
      app.role_title.trim().toLowerCase() === cleanRole
  );

  if (companyRoleMatch) {
    return {
      hasDuplicate: true,
      duplicateApp: companyRoleMatch,
      reason: `You already have an application for "${companyRoleMatch.role_title}" at "${companyRoleMatch.company}" (Current Stage: ${stageLabels[companyRoleMatch.stage] || companyRoleMatch.stage}).`,
    };
  }

  return { hasDuplicate: false };
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export async function createApplication(
  supabase: SupabaseClient,
  userId: string,
  input: CreateApplicationInput
): Promise<JobApplicationRecord> {
  const payload = {
    user_id: userId,
    company: input.company.trim(),
    role_title: input.role_title.trim(),
    job_url: input.job_url || null,
    careers_url: input.careers_url || null,
    job_description: input.job_description || null,
    location: input.location || null,
    work_mode: input.work_mode || "hybrid",
    employment_type: input.employment_type || "full_time",
    stage: input.stage || "interested",
    salary_min_lpa: input.salary_min_lpa ?? null,
    salary_max_lpa: input.salary_max_lpa ?? null,
    expected_ctc_lpa: input.expected_ctc_lpa ?? null,
    applied_salary_lpa: input.applied_salary_lpa ?? null,
    recruiter_name: input.recruiter_name || null,
    recruiter_contact: input.recruiter_contact || null,
    referral_name: input.referral_name || null,
    referral_contact: input.referral_contact || null,
    referral_status: input.referral_status || "not_requested",
    discovered_on: input.discovered_on || new Date().toISOString().slice(0, 10),
    application_date: input.application_date || null,
    next_follow_up_at: input.next_follow_up_at || null,
    interview_date: input.interview_date || null,
    notes: input.notes || null,
    rejection_reason: input.rejection_reason || null,
    offer_details: input.offer_details || {},
  };

  let { data, error } = await supabase
    .from("job_applications")
    .insert(payload)
    .select()
    .single();

  // If new columns from migration 0008 are pending in live Supabase, fallback to 0003 baseline
  if (error && error.message.includes("Could not find the")) {
    const baselinePayload = {
      user_id: userId,
      company: input.company.trim(),
      role_title: input.role_title.trim(),
      job_url: input.job_url || null,
      job_description: input.job_description || null,
      location: input.location || null,
      work_mode: input.work_mode || "hybrid",
      stage: input.stage || "interested",
      salary_min_lpa: input.salary_min_lpa ?? null,
      salary_max_lpa: input.salary_max_lpa ?? null,
      recruiter_name: input.recruiter_name || null,
      recruiter_contact: input.recruiter_contact || null,
      referral_name: input.referral_name || null,
      discovered_on: input.discovered_on || new Date().toISOString().slice(0, 10),
      application_date: input.application_date || null,
      next_follow_up_at: input.next_follow_up_at || null,
      interview_date: input.interview_date || null,
      notes: input.notes || null,
      rejection_reason: input.rejection_reason || null,
    };
    const retry = await supabase
      .from("job_applications")
      .insert(baselinePayload)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(`Failed to create application: ${error.message}`);
  }

  const app = data as JobApplicationRecord;

  // Log creation activity
  try {
    await supabase.from("application_activity").insert({
      user_id: userId,
      application_id: app.id,
      from_stage: null,
      to_stage: app.stage,
      activity_type: "created",
      title: `Application created in "${stageLabels[app.stage]}" stage`,
      description: `Targeting ${app.role_title} at ${app.company}.`,
    });
  } catch {
    // Activity table may be pending migration
  }

  return app;
}

export async function updateApplication(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
  input: UpdateApplicationInput
): Promise<JobApplicationRecord> {
  const existing = await getApplicationById(supabase, userId, applicationId);
  if (!existing) {
    throw new Error(`Application ${applicationId} not found`);
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.company !== undefined) payload.company = input.company.trim();
  if (input.role_title !== undefined) payload.role_title = input.role_title.trim();
  if (input.job_url !== undefined) payload.job_url = input.job_url || null;
  if (input.careers_url !== undefined) payload.careers_url = input.careers_url || null;
  if (input.job_description !== undefined) payload.job_description = input.job_description;
  if (input.location !== undefined) payload.location = input.location;
  if (input.work_mode !== undefined) payload.work_mode = input.work_mode;
  if (input.employment_type !== undefined) payload.employment_type = input.employment_type;
  if (input.salary_min_lpa !== undefined) payload.salary_min_lpa = input.salary_min_lpa;
  if (input.salary_max_lpa !== undefined) payload.salary_max_lpa = input.salary_max_lpa;
  if (input.expected_ctc_lpa !== undefined) payload.expected_ctc_lpa = input.expected_ctc_lpa;
  if (input.applied_salary_lpa !== undefined) payload.applied_salary_lpa = input.applied_salary_lpa;
  if (input.recruiter_name !== undefined) payload.recruiter_name = input.recruiter_name;
  if (input.recruiter_contact !== undefined) payload.recruiter_contact = input.recruiter_contact;
  if (input.referral_name !== undefined) payload.referral_name = input.referral_name;
  if (input.referral_contact !== undefined) payload.referral_contact = input.referral_contact;
  if (input.referral_status !== undefined) payload.referral_status = input.referral_status;
  if (input.discovered_on !== undefined) payload.discovered_on = input.discovered_on;
  if (input.application_date !== undefined) payload.application_date = input.application_date;
  if (input.next_follow_up_at !== undefined) payload.next_follow_up_at = input.next_follow_up_at;
  if (input.interview_date !== undefined) payload.interview_date = input.interview_date;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.rejection_reason !== undefined) payload.rejection_reason = input.rejection_reason;
  if (input.offer_details !== undefined) payload.offer_details = input.offer_details;

  // Handle stage change through update
  const stageChanged = input.stage && input.stage !== existing.stage;
  if (stageChanged && input.stage) {
    payload.stage = input.stage;
  }

  let { data, error } = await supabase
    .from("job_applications")
    .update(payload)
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error && error.message.includes("Could not find the")) {
    const extKeys = [
      "careers_url",
      "employment_type",
      "expected_ctc_lpa",
      "applied_salary_lpa",
      "referral_status",
      "referral_contact",
      "offer_details",
    ];
    const strippedPayload = { ...payload };
    extKeys.forEach((k) => delete strippedPayload[k]);

    const retry = await supabase
      .from("job_applications")
      .update(strippedPayload)
      .eq("id", applicationId)
      .eq("user_id", userId)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(`Failed to update application: ${error.message}`);
  }

  const updated = data as JobApplicationRecord;

  // If stage changed, log activity
  if (stageChanged && input.stage) {
    try {
      await supabase.from("application_activity").insert({
        user_id: userId,
        application_id: applicationId,
        from_stage: existing.stage,
        to_stage: input.stage,
        activity_type: "stage_change",
        title: `Stage updated: ${stageLabels[existing.stage]} → ${stageLabels[input.stage]}`,
        description: `Stage updated to ${stageLabels[input.stage]}.`,
      });
    } catch {
      // Activity table may be pending migration
    }
  }

  return updated;
}

export async function changeApplicationStage(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
  newStage: ApplicationStage,
  notes?: string
): Promise<JobApplicationRecord> {
  const existing = await getApplicationById(supabase, userId, applicationId);
  if (!existing) {
    throw new Error(`Application ${applicationId} not found`);
  }

  const fromStage = existing.stage;

  const { data, error } = await supabase
    .from("job_applications")
    .update({
      stage: newStage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update stage: ${error.message}`);
  }

  // Record transition in activity log
  try {
    await supabase.from("application_activity").insert({
      user_id: userId,
      application_id: applicationId,
      from_stage: fromStage,
      to_stage: newStage,
      activity_type: "stage_change",
      title: `Moved from ${stageLabels[fromStage]} to ${stageLabels[newStage]}`,
      description: notes || `Application transitioned to ${stageLabels[newStage]}.`,
    });
  } catch {
    // Activity table may be pending migration
  }

  return data as JobApplicationRecord;
}

export async function deleteApplication(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string
): Promise<void> {
  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete application: ${error.message}`);
  }
}

// ─── ACTIVITY HISTORY ─────────────────────────────────────────────────────────

export async function getApplicationActivity(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string
): Promise<ApplicationActivityRecord[]> {
  try {
    const { data, error } = await supabase
      .from("application_activity")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data || []) as ApplicationActivityRecord[];
  } catch {
    return [];
  }
}

// ─── INTERVIEW ROUNDS ─────────────────────────────────────────────────────────

export async function getInterviewRounds(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string
): Promise<InterviewRoundRecord[]> {
  try {
    const { data, error } = await supabase
      .from("application_interview_rounds")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", userId)
      .order("round_number", { ascending: true });

    if (error) {
      return [];
    }

    return (data || []) as InterviewRoundRecord[];
  } catch {
    return [];
  }
}

export async function createInterviewRound(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
  input: CreateInterviewRoundInput
): Promise<InterviewRoundRecord> {
  const payload = {
    user_id: userId,
    application_id: applicationId,
    round_number: input.round_number || 1,
    round_name: input.round_name.trim(),
    interview_at: input.interview_at || null,
    interviewer_name: input.interviewer_name || null,
    interviewer_title: input.interviewer_title || null,
    topics: input.topics || [],
    questions_asked: input.questions_asked || [],
    performance_notes: input.performance_notes || null,
    result: input.result || "pending",
    follow_up_notes: input.follow_up_notes || null,
  };

  const { data, error } = await supabase
    .from("application_interview_rounds")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create interview round: ${error.message}`);
  }

  const round = data as InterviewRoundRecord;

  // Log activity
  try {
    await supabase.from("application_activity").insert({
      user_id: userId,
      application_id: applicationId,
      from_stage: null,
      to_stage: null,
      activity_type: "interview_scheduled",
      title: `Scheduled Round ${round.round_number}: ${round.round_name}`,
      description: round.interview_at
        ? `Interview scheduled for ${new Date(round.interview_at).toLocaleString()}`
        : `Round ${round.round_number} added.`,
    });
  } catch {
    // Activity table may be pending migration
  }

  return round;
}

export async function updateInterviewRound(
  supabase: SupabaseClient,
  userId: string,
  roundId: string,
  input: UpdateInterviewRoundInput
): Promise<InterviewRoundRecord> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.round_number !== undefined) payload.round_number = input.round_number;
  if (input.round_name !== undefined) payload.round_name = input.round_name.trim();
  if (input.interview_at !== undefined) payload.interview_at = input.interview_at;
  if (input.interviewer_name !== undefined) payload.interviewer_name = input.interviewer_name;
  if (input.interviewer_title !== undefined) payload.interviewer_title = input.interviewer_title;
  if (input.topics !== undefined) payload.topics = input.topics;
  if (input.questions_asked !== undefined) payload.questions_asked = input.questions_asked;
  if (input.performance_notes !== undefined) payload.performance_notes = input.performance_notes;
  if (input.result !== undefined) payload.result = input.result;
  if (input.follow_up_notes !== undefined) payload.follow_up_notes = input.follow_up_notes;

  const { data, error } = await supabase
    .from("application_interview_rounds")
    .update(payload)
    .eq("id", roundId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update interview round: ${error.message}`);
  }

  const updated = data as InterviewRoundRecord;

  // Log activity if result completed
  if (input.result && input.result !== "pending") {
    try {
      await supabase.from("application_activity").insert({
        user_id: userId,
        application_id: updated.application_id,
        from_stage: null,
        to_stage: null,
        activity_type: "interview_completed",
        title: `Round ${updated.round_number} (${updated.round_name}) marked as "${updated.result}"`,
        description: updated.performance_notes || `Interview round result logged as ${updated.result}.`,
      });
    } catch {
      // Activity table may be pending migration
    }
  }

  return updated;
}

export async function deleteInterviewRound(
  supabase: SupabaseClient,
  userId: string,
  roundId: string
): Promise<void> {
  const { error } = await supabase
    .from("application_interview_rounds")
    .delete()
    .eq("id", roundId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete interview round: ${error.message}`);
  }
}

// ─── PIPELINE & FOLLOW-UP STATS ───────────────────────────────────────────────

export async function getApplicationsSummaryStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ApplicationsSummaryStats> {
  const { data } = await supabase
    .from("job_applications")
    .select("stage, next_follow_up_at, interview_date, application_date")
    .eq("user_id", userId);

  const apps = data || [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const interviewStages: ApplicationStage[] = [
    "screening",
    "technical_round_1",
    "technical_round_2",
    "managerial_round",
    "hr",
  ];

  let dueTodayCount = 0;
  let overdueCount = 0;
  let upcomingInterviewsCount = 0;
  let awaitingResponseCount = 0;

  apps.forEach((app) => {
    // Next follow-up checks
    if (app.next_follow_up_at && app.stage !== "offer" && app.stage !== "rejected") {
      if (app.next_follow_up_at === todayStr) {
        dueTodayCount++;
      } else if (app.next_follow_up_at < todayStr) {
        overdueCount++;
      }
    }

    // Upcoming interviews
    if (app.interview_date && new Date(app.interview_date) >= new Date()) {
      upcomingInterviewsCount++;
    }

    // Awaiting response (> 7 days since application_date without advancement)
    if (
      app.stage === "applied" &&
      app.application_date &&
      app.application_date <= sevenDaysAgo
    ) {
      awaitingResponseCount++;
    }
  });

  return {
    total: apps.length,
    active: apps.filter((a) => a.stage !== "rejected" && a.stage !== "offer").length,
    interviewing: apps.filter((a) => interviewStages.includes(a.stage)).length,
    offers: apps.filter((a) => a.stage === "offer").length,
    rejected: apps.filter((a) => a.stage === "rejected").length,
    dueTodayCount,
    overdueCount,
    upcomingInterviewsCount,
    awaitingResponseCount,
  };
}
