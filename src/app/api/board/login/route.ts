import { NextRequest, NextResponse } from "next/server";
import {
  BOARD_COOKIE_TTL_MS,
  boardCookieOptions,
  constantTimeEqual,
  isGatedPath,
  isSameOriginRequest,
  makeBoardCookieValue,
} from "../../../../lib/board-auth";
import { rateLimit, clientKey } from "../../../../lib/rate-limit";

// POST handler for the Board Hub login form. Validates the submitted
// password against the BOARD_PASSWORD env var and sets a signed cookie if
// it matches. Signing, comparison and the cookie shape all come from
// lib/board-auth.ts — the same code the proxy validates with — so the two
// sides cannot drift (#240).

// BRUTE-FORCE THROTTLE (#240)
// One shared password with no attempt limit is an offline-dictionary problem
// made online: nothing stopped a script from trying a few hundred thousand
// guesses an hour. Ten failures per address per fifteen minutes turns that
// into forty an hour, which is no longer an attack, only a nuisance.
//
// Only FAILED attempts count. A board member who types the password
// correctly the first time is never throttled, and one who fumbles it nine
// times is still let in on the tenth if it is right — the counter is checked
// before the compare and only incremented on a miss.
//
// Same limiter as the payment-link route, with the same honest caveat in
// lib/rate-limit.ts: it is per-instance, so a distributed sprayer gets more
// than ten. The real fix is a shared store; this closes the trivial case,
// which was wide open.
const FAILED_ATTEMPTS = 10;
const FAILED_WINDOW_MS = 15 * 60_000;

type LoginPayload = { password?: unknown; next?: unknown };

function sanitizeNext(raw: unknown): string {
  if (typeof raw !== "string") return "/board";
  // Only a relative path inside the gated area — never an absolute URL, never
  // a protocol-relative `//host`, never a header-splitting newline. Anything
  // else lands on the hub's front page.
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/board";
  if (/[\r\n]/.test(raw)) return "/board";
  const pathOnly = raw.split(/[?#]/)[0];
  if (!isGatedPath(pathOnly)) return "/board";
  return raw;
}

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  let body: LoginPayload;
  try {
    body = (await req.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const submitted = typeof body.password === "string" ? body.password : "";
  const next = sanitizeNext(body.next);

  const expected = process.env.BOARD_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Board Hub isn't configured yet — BOARD_PASSWORD env var not set on Vercel.",
      },
      { status: 503 },
    );
  }

  // Peek at the counter without spending an attempt: a client already over
  // the limit is refused before the password is even looked at.
  // Own namespace (#248): the public-form limiters share a Map that a flood
  // can fill; this one holds blocked password-guessers and must not be
  // evictable by traffic on any other route.
  const key = clientKey(req);
  const LIMITER = { namespace: "board-login" } as const;
  const peek = rateLimit(key, FAILED_ATTEMPTS, FAILED_WINDOW_MS, { ...LIMITER, peek: true });
  if (!peek.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many incorrect attempts — please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(peek.retryAfter) } },
    );
  }

  if (!submitted || !constantTimeEqual(submitted, expected)) {
    rateLimit(key, FAILED_ATTEMPTS, FAILED_WINDOW_MS, LIMITER);
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true, next });
  res.cookies.set({
    ...boardCookieOptions(),
    value: await makeBoardCookieValue(expected),
    maxAge: Math.floor(BOARD_COOKIE_TTL_MS / 1000),
  });
  return res;
}
