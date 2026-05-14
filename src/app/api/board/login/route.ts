import { NextRequest, NextResponse } from "next/server";

// POST handler for the Board Hub login form. Validates the submitted
// password against BOARD_PASSWORD env var and sets a signed cookie if
// it matches. Cookie signing is shared with src/proxy.ts: HMAC-SHA256
// over the expiry timestamp, keyed by BOARD_PASSWORD itself.

const COOKIE_NAME = "slotab_board";
const COOKIE_TTL_MS = 60 * 60 * 24 * 30 * 1000; // 30 days

function base64urlEncode(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSign(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(msg),
  );
  return base64urlEncode(sig);
}

type LoginPayload = { password?: unknown; next?: unknown };

function sanitizeNext(raw: unknown): string {
  if (typeof raw !== "string") return "/board";
  // Allow only relative redirects under /board to prevent open-redirect.
  if (!raw.startsWith("/board")) return "/board";
  if (raw.includes("\n") || raw.includes("\r")) return "/board";
  return raw;
}

export async function POST(req: NextRequest) {
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
  if (!submitted || !constantTimeEqual(submitted, expected)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 },
    );
  }

  const expiry = Date.now() + COOKIE_TTL_MS;
  const sig = await hmacSign(expected, String(expiry));
  const cookieValue = `${expiry}.${sig}`;

  const res = NextResponse.json({ ok: true, next });
  res.cookies.set({
    name: COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(COOKIE_TTL_MS / 1000),
  });
  return res;
}
