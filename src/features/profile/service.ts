import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type ProfileFormInput } from "./schema";
import { seedCodingShuttleModules, type SeedResult } from "../learning/seed";

export interface ProfileRecord {
  id: string;
  display_name: string;
  current_employer: string | null;
  current_title: string | null;
  employment_start: string | null;
  education: Array<{ degree: string; start_year: number; end_year: number }>;
  target_roles: string[];
  target_company_types: string[];
  target_salary_min_lpa: number | null;
  target_salary_max_lpa: number | null;
  preparation_horizon_months_min: number;
  preparation_horizon_months_max: number;
  timezone: string;
  daily_available_minutes: number;
  profile_context: string | null;
  dsa_playlist_completed: boolean;
  dsa_playlist_url: string | null;
  dsa_aggregate_solved_count: number | null;
  dsa_aggregate_solved_count_is_minimum: boolean;
  theme_preference: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

export function getSeedProfileDefaults(): ProfileFormInput {
  const filePath = path.resolve(process.cwd(), "seed-data/profile.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(rawData);

  return {
    display_name: parsed.display_name || "Jai",
    current_employer: parsed.current_employer || "Tata Consultancy Services",
    current_title: parsed.current_title || "Associate System Engineer",
    target_roles: parsed.target_roles || ["Java Backend Developer", "Full-Stack Developer", "Software Engineer", "SDE I"],
    target_company_types: parsed.target_company_types || ["Product-based companies", "High-growth startups", "Established technology companies"],
    target_salary_min_lpa: parsed.target_compensation_lpa?.min ?? 10,
    target_salary_max_lpa: parsed.target_compensation_lpa?.max ?? 15,
    preparation_horizon_months_min: parsed.preparation_horizon_months?.min ?? 3,
    preparation_horizon_months_max: parsed.preparation_horizon_months?.max ?? 6,
    timezone: parsed.timezone || "Asia/Kolkata",
    daily_available_minutes: parsed.daily_available_minutes ?? 120, // default 2 hours if null in seed
    profile_context: parsed.career_direction || "Software development; Java backend, full-stack, or SDE-I preparation.",
    dsa_playlist_completed: true,
    dsa_playlist_url: "https://www.youtube.com/playlist?list=PLbJhGqY-mq47k_WLUtzVjmarUm1EuXPj2",
    dsa_aggregate_solved_count: 350,
    dsa_aggregate_solved_count_is_minimum: true,
    theme_preference: "system",
  };
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ profile: ProfileRecord | null; error?: string }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Row not found
      return { profile: null };
    }
    return { profile: null, error: error.message };
  }

  return { profile: data as ProfileRecord };
}

export async function saveInitialProfile(
  supabase: SupabaseClient,
  userId: string,
  input: ProfileFormInput
): Promise<{ created: boolean; seedResult?: SeedResult; message?: string; error?: string }> {
  // Check if profile already exists to prevent accidental overwriting
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existing) {
    return {
      created: false,
      message: "Profile already exists. Use Settings to edit your profile.",
    };
  }

  const newProfile = {
    id: userId,
    display_name: input.display_name,
    current_employer: input.current_employer || null,
    current_title: input.current_title || null,
    employment_start: "2025-03-01",
    education: [
      {
        degree: "B.Tech Computer Science",
        start_year: 2020,
        end_year: 2024,
      },
    ],
    target_roles: input.target_roles,
    target_company_types: input.target_company_types || [],
    target_salary_min_lpa: input.target_salary_min_lpa ?? null,
    target_salary_max_lpa: input.target_salary_max_lpa ?? null,
    preparation_horizon_months_min: input.preparation_horizon_months_min,
    preparation_horizon_months_max: input.preparation_horizon_months_max,
    timezone: input.timezone,
    daily_available_minutes: input.daily_available_minutes,
    profile_context: input.profile_context || null,
    dsa_playlist_completed: input.dsa_playlist_completed,
    dsa_playlist_url: input.dsa_playlist_url || null,
    dsa_aggregate_solved_count: input.dsa_aggregate_solved_count,
    dsa_aggregate_solved_count_is_minimum: input.dsa_aggregate_solved_count_is_minimum,
    theme_preference: input.theme_preference,
  };

  const { error: insertError } = await supabase.from("profiles").insert(newProfile);

  if (insertError) {
    return { created: false, error: insertError.message };
  }

  // Idempotently seed Coding Shuttle modules on profile initialization
  const seedResult = await seedCodingShuttleModules(supabase, userId);

  return { created: true, seedResult };
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: Partial<ProfileFormInput>
): Promise<{ success: boolean; error?: string }> {
  const updateData: Record<string, unknown> = {};

  if (input.display_name !== undefined) updateData.display_name = input.display_name;
  if (input.current_employer !== undefined) updateData.current_employer = input.current_employer;
  if (input.current_title !== undefined) updateData.current_title = input.current_title;
  if (input.target_roles !== undefined) updateData.target_roles = input.target_roles;
  if (input.target_company_types !== undefined) updateData.target_company_types = input.target_company_types;
  if (input.target_salary_min_lpa !== undefined) updateData.target_salary_min_lpa = input.target_salary_min_lpa;
  if (input.target_salary_max_lpa !== undefined) updateData.target_salary_max_lpa = input.target_salary_max_lpa;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;
  if (input.daily_available_minutes !== undefined) updateData.daily_available_minutes = input.daily_available_minutes;
  if (input.theme_preference !== undefined) updateData.theme_preference = input.theme_preference;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
