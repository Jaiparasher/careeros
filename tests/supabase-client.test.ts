import { describe, it, expect } from "vitest";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

describe("Supabase Client Factory", () => {
  it("initializes browser client with valid URL and key without throwing", () => {
    const client = createBrowserClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});
