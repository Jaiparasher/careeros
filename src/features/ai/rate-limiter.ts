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
