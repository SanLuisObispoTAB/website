// Fixed-window rate limiter, in memory.
//
// HONEST LIMITATIONS — read before relying on this.
// Vercel runs each serverless instance with its own memory, so this counter is
// per-instance and resets on cold start. A determined attacker spraying across
// instances gets more than `limit` requests through. It is a speed bump, not a
// gate.
//
// It is here because `/api/square/payment-link` mints real Square orders, and
// the deferred hardening item in #73 correctly names exactly this shape of
// endpoint. The realistic threat is nuisance rather than theft — no money moves
// without a card, so abuse means junk DRAFT orders polluting the Treasurer's
// Square reporting, not a loss. A speed bump is proportionate to that, and
// shipping the endpoint with nothing at all was not.
//
// The real fix is the shared counter #73 already calls for (Vercel KV or
// Upstash). When that lands, swap the Map for it — the call signature here is
// deliberately the same shape you would want from a KV-backed limiter.

type Window = { count: number; resetAt: number };

const hits = new Map<string, Window>();

/** Bounds the Map so a spray of unique keys can't grow it without limit. */
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the current window resets. Sent as `Retry-After`. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = hits.get(key);

  if (!existing || now >= existing.resetAt) {
    if (hits.size >= MAX_TRACKED_KEYS) {
      // Cheapest correct thing: drop expired entries, and if that frees
      // nothing, clear outright. Losing counters fails open, which is the
      // right direction for a nuisance-tier limiter guarding a donation form.
      for (const [k, w] of hits) if (now >= w.resetAt) hits.delete(k);
      if (hits.size >= MAX_TRACKED_KEYS) hits.clear();
    }
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client identity. `x-forwarded-for` is set by Vercel's proxy and
 *  is trustworthy there; the first entry is the real client. Falls back to a
 *  shared bucket, which throttles harder rather than failing open. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
