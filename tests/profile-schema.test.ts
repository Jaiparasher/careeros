import { describe, it, expect } from "vitest";
import { profileFormSchema } from "@/features/profile/schema";

describe("Profile Form Schema (profileFormSchema)", () => {
  it("validates valid profile data from seed default", () => {
    const valid = profileFormSchema.safeParse({
      display_name: "Jai",
      current_employer: "Tata Consultancy Services",
      current_title: "Associate System Engineer",
      target_roles: ["Java Backend Developer", "Full-Stack Developer"],
      target_salary_min_lpa: 10,
      target_salary_max_lpa: 15,
      timezone: "Asia/Kolkata",
      daily_available_minutes: 120,
    });
    expect(valid.success).toBe(true);
  });

  it("requires display_name and timezone", () => {
    const invalid = profileFormSchema.safeParse({
      display_name: "",
      timezone: "",
      target_roles: [],
    });
    expect(invalid.success).toBe(false);
  });

  it("ensures daily_available_minutes is within valid range (1 to 1440)", () => {
    const tooHigh = profileFormSchema.safeParse({
      display_name: "Jai",
      timezone: "Asia/Kolkata",
      target_roles: ["SDE I"],
      daily_available_minutes: 2000,
    });
    expect(tooHigh.success).toBe(false);

    const negative = profileFormSchema.safeParse({
      display_name: "Jai",
      timezone: "Asia/Kolkata",
      target_roles: ["SDE I"],
      daily_available_minutes: -10,
    });
    expect(negative.success).toBe(false);
  });

  it("ensures min salary is not greater than max salary when both are provided", () => {
    const invalidSalaries = profileFormSchema.safeParse({
      display_name: "Jai",
      timezone: "Asia/Kolkata",
      target_roles: ["SDE I"],
      target_salary_min_lpa: 20,
      target_salary_max_lpa: 10,
    });
    expect(invalidSalaries.success).toBe(false);
  });
});
