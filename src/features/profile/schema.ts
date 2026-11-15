import { z } from "zod";

export const profileFormSchema = z
  .object({
    display_name: z.string().min(1, "Display name is required"),
    current_employer: z.string().optional().default(""),
    current_title: z.string().optional().default(""),
    target_roles: z
      .array(z.string())
      .min(1, "Please select or enter at least one target role"),
    target_company_types: z.array(z.string()).optional().default([]),
    target_salary_min_lpa: z.coerce
      .number()
      .min(0, "Minimum salary cannot be negative")
      .optional()
      .nullable(),
    target_salary_max_lpa: z.coerce
      .number()
      .min(0, "Maximum salary cannot be negative")
      .optional()
      .nullable(),
    preparation_horizon_months_min: z.coerce.number().min(1).max(24).default(3),
    preparation_horizon_months_max: z.coerce.number().min(1).max(24).default(6),
    timezone: z.string().min(1, "Timezone is required").default("Asia/Kolkata"),
    daily_available_minutes: z.coerce
      .number()
      .min(1, "Daily study time must be at least 1 minute")
      .max(1440, "Daily study time cannot exceed 1440 minutes")
      .default(120),
    profile_context: z.string().optional().default(""),
    dsa_playlist_completed: z.boolean().default(true),
    dsa_playlist_url: z
      .string()
      .optional()
      .default("https://www.youtube.com/playlist?list=PLbJhGqY-mq47k_WLUtzVjmarUm1EuXPj2"),
    dsa_aggregate_solved_count: z.coerce.number().min(0).default(350),
    dsa_aggregate_solved_count_is_minimum: z.boolean().default(true),
    theme_preference: z.enum(["light", "dark", "system"]).default("system"),
  })
  .refine(
    (data) => {
      if (
        data.target_salary_min_lpa !== null &&
        data.target_salary_min_lpa !== undefined &&
        data.target_salary_max_lpa !== null &&
        data.target_salary_max_lpa !== undefined
      ) {
        return data.target_salary_min_lpa <= data.target_salary_max_lpa;
      }
      return true;
    },
    {
      message: "Minimum salary cannot exceed maximum salary",
      path: ["target_salary_min_lpa"],
    }
  );

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
