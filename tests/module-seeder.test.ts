import { describe, it, expect, vi } from "vitest";
import { seedCodingShuttleModules } from "@/features/learning/seed";

describe("Coding Shuttle Module Seeder (seedCodingShuttleModules)", () => {
  it("inserts all 20 modules when user has no existing records", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "learning_modules") {
          return {
            select: mockSelect,
            insert: mockInsert,
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    // @ts-expect-error test mock supabase client
    const result = await seedCodingShuttleModules(mockSupabase, "test-user-id");

    expect(result.total).toBe(20);
    expect(result.insertedCount).toBe(20);
    expect(result.existingCount).toBe(0);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const insertedRows = mockInsert.mock.calls[0][0];
    expect(insertedRows).toHaveLength(20);
    expect(insertedRows[0].user_id).toBe("test-user-id");
    expect(insertedRows[0].course_key).toBe("coding-shuttle-cohort-4");
  });

  it("is idempotent and skips already existing modules without overwriting", async () => {
    // Simulate user already having 5 modules seeded
    const existing = [
      { module_key: "coding-shuttle-cohort-4-module-01" },
      { module_key: "coding-shuttle-cohort-4-module-02" },
      { module_key: "coding-shuttle-cohort-4-module-03" },
      { module_key: "coding-shuttle-cohort-4-module-04" },
      { module_key: "coding-shuttle-cohort-4-module-05" },
    ];

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: existing, error: null }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "learning_modules") {
          return {
            select: mockSelect,
            insert: mockInsert,
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    // @ts-expect-error test mock supabase client
    const result = await seedCodingShuttleModules(mockSupabase, "test-user-id");

    expect(result.total).toBe(20);
    expect(result.existingCount).toBe(5);
    expect(result.insertedCount).toBe(15);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const insertedRows = mockInsert.mock.calls[0][0];
    expect(insertedRows).toHaveLength(15);
  });

  it("does not call insert if all 20 modules already exist", async () => {
    const allExisting = Array.from({ length: 20 }, (_, i) => ({
      module_key: `coding-shuttle-cohort-4-module-${String(i + 1).padStart(2, "0")}`,
    }));

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: allExisting, error: null }),
    });

    const mockSupabase = {
      from: vi.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
      })),
    };

    // @ts-expect-error test mock supabase client
    const result = await seedCodingShuttleModules(mockSupabase, "test-user-id");

    expect(result.insertedCount).toBe(0);
    expect(result.existingCount).toBe(20);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
