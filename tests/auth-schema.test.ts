import { describe, it, expect } from "vitest";
import { loginSchema } from "@/features/auth/schema";

describe("Auth Schema (loginSchema)", () => {
  it("validates correct email and password", () => {
    const valid = loginSchema.safeParse({
      email: "engineer@careeros.dev",
      password: "strongpassword123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid email formats", () => {
    const invalid = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const invalid = loginSchema.safeParse({
      email: "test@careeros.dev",
      password: "123",
    });
    expect(invalid.success).toBe(false);
  });
});
