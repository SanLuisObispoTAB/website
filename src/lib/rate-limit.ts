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
// Since #240 it also guards the board login (failed attempts only) and the two
// Springly form endpoints — the three routes #73 deferred throttling on "until
// there is a shared store". There still isn't one, but a per-instance counter
// closes the single-source case those routes were wide open to, and the call
// signature is the one a KV-backed limiter would want.
//
// The real fix is the shared counter #73 already calls for (Vercel KV or
// Upstash). When that lands, swap the Map for it.

type Window = { count: number; resetAt: number };

const hits = new Map<string, Window>();

/** Bounds the Map so a spray of unique keys can't grow it without limit. */
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the current window resets. Sent as `Retry-After`. */
  retryAfter: number;
};

export type RateLimitOptions = {
  /** Report whether `key` is over the limit WITHOUT counting this call. Lets a
   *  route refuse an already-throttled client up front and then count only the
   *  outcome it actually wants to throttle — the login route counts failures,
   *  not attempts, so a correct password is never refused. */
  peek?: boolean;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  opts: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now();
  const existing = hits.get(key);

  if (!existing || now >= existing.resetAt) {
    if (opts.peek) return { ok: true, retryAfter: 0 };
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

  if (!opts.peek) existing.count += 1;
  const over = opts.peek ? existing.count >= limit : existing.count > limit;
  if (over) {
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
