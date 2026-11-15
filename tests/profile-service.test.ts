import { describe, it, expect, vi } from "vitest";
import { getSeedProfileDefaults, saveInitialProfile } from "@/features/profile/service";

describe("Profile Service (profile.service)", () => {
  it("loads profile defaults from seed-data/profile.json correctly", () => {
    const defaults = getSeedProfileDefaults();

    expect(defaults.display_name).toBe("Jai");
    expect(defaults.current_employer).toBe("Tata Consultancy Services");
    expect(defaults.current_title).toBe("Associate System Engineer");
    expect(defaults.target_roles).toContain("Java Backend Developer");
    expect(defaults.target_salary_min_lpa).toBe(10);
    expect(defaults.target_salary_max_lpa).toBe(15);
    expect(defaults.timezone).toBe("Asia/Kolkata");
    // When seed has null, defaults provide a recommended 120 minutes (2 hrs)
    expect(defaults.daily_available_minutes).toBe(120);
    expect(defaults.dsa_playlist_completed).toBe(true);
    expect(defaults.dsa_aggregate_solved_count).toBe(350);
  });

  it("does not overwrite an existing profile", async () => {
    const existingProfile = { id: "user-123", display_name: "Custom Name" };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: existingProfile, error: null }),
      }),
    });
    const mockInsert = vi.fn();

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: mockSelect,
            insert: mockInsert,
          };
        }
        if (table === "learning_modules") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const input = getSeedProfileDefaults();
    // @ts-expect-error test mock client
    const result = await saveInitialProfile(mockSupabase, "user-123", input);

    expect(result.created).toBe(false);
    expect(result.message).toContain("already exists");
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
