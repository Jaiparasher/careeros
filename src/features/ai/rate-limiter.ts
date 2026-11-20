/**
 * CareerOS AI Rate Limiter
 *
 * Implements a sliding-window in-memory rate limiter for user-triggered AI actions
 * (Resume JD intelligence, Adaptive Study Advisor, Mock Interview evaluation/retry).
 *
 * ARCHITECTURAL DESIGN & CONSTRAINTS:
 * 1. Monolithic / Zero-Dependency:
 *    Adheres to CareerOS non-negotiable constraint #3 (no external Redis, Kafka,
 *    microservices or auxiliary infrastructure). Uses local process memory (`Map`).
 *
 * 2. Serverless / Multi-Instance Limitation (Finding L-09):
 *    - In multi-instance serverless deployments (such as Vercel Edge / Lambda with horizontal autoscaling),
 *      each runtime instance or cold-start worker maintains its own isolated memory state.
 *    - Sliding-window quotas are therefore enforced per-instance lifecycle rather than globally
 *      across multiple concurrent container replicas.
 *    - For single-instance, local development, and individual user sessions, this provides
 *      lightweight, sub-millisecond rate protection without operational overhead or external costs.
 *
 * 3. Distributed Production Evolution Path:
 *    - If horizontally scaled multi-region production with strict shared quotas is needed,
 *      this exact contract (`check(identifier, limit, windowMs)`, `RateLimitResult`) can be backed
 *      by Upstash Redis or a Postgres atomic token-bucket RPC table without modifying calling code.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export class InMemoryRateLimiter {
  private records = new Map<string, { count: number; resetAt: number }>();
  private readonly defaultLimit: number;
  private readonly defaultWindowMs: number;

  constructor(options?: { defaultLimit?: number; defaultWindowMs?: number }) {
    this.defaultLimit = options?.defaultLimit ?? 10;
    this.defaultWindowMs = options?.defaultWindowMs ?? 60_000;
  }

  check(identifier: string, limit?: number, windowMs?: number): RateLimitResult {
    const now = Date.now();
    const effectiveLimit = limit ?? this.defaultLimit;
    const effectiveWindow = windowMs ?? this.defaultWindowMs;

    this.prune(now);

    const record = this.records.get(identifier);

    if (!record || now >= record.resetAt) {
      const resetAt = now + effectiveWindow;
      this.records.set(identifier, {
        count: 1,
        resetAt,
      });
      return {
        allowed: true,
        remaining: Math.max(0, effectiveLimit - 1),
        resetAt,
        retryAfterSeconds: 0,
      };
    }

    if (record.count >= effectiveLimit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
        retryAfterSeconds,
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, effectiveLimit - record.count),
      resetAt: record.resetAt,
      retryAfterSeconds: 0,
    };
  }

  prune(now: number = Date.now()): void {
    for (const [key, record] of this.records.entries()) {
      if (now >= record.resetAt) {
        this.records.delete(key);
      }
    }
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.records.delete(identifier);
    } else {
      this.records.clear();
    }
  }

  getRecordCount(): number {
    return this.records.size;
  }
}

export const aiRateLimiter = new InMemoryRateLimiter({
  defaultLimit: 10,
  defaultWindowMs: 60_000,
});
