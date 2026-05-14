import { NextRequest, NextResponse } from "next/server";

// Password-gates the SLOTAB Board Hub at /board/*. Set BOARD_PASSWORD as a
// Vercel env var to enable. The login form at /board/login posts to
// /api/board/login, which sets a signed cookie (HMAC-SHA256 over the
// expiry timestamp, keyed by BOARD_PASSWORD itself — rotating the
// password at board handover automatically invalidates old sessions).
//
// Uses the Next.js 16 "proxy" file convention (renamed from middleware).

export const config = {
  matcher: ["/board/:path*"],
};

const COOKIE_NAME = "slotab_board";
// Login route is the one /board/* path that must NOT be gated, or the
// user can never authenticate.
const PUBLIC_PATHS = new Set(["/board/login"]);

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

async function isCookieValid(
  cookieValue: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!cookieValue) return false;
  const dot = cookieValue.indexOf(".");
  if (dot <= 0 || dot === cookieValue.length - 1) return false;
  const expiryStr = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expectedSig = await hmacSign(secret, expiryStr);
  return constantTimeEqual(sig, expectedSig);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const password = process.env.BOARD_PASSWORD;
  if (!password) {
    // Not configured yet — redirect to login, which renders a
    // "not configured" notice. Fail-closed.
    const url = req.nextUrl.clone();
    url.pathname = "/board/login";
    url.searchParams.set("notconfigured", "1");
    return NextResponse.redirect(url);
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const ok = await isCookieValid(cookie, password);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/board/login";
  if (pathname !== "/board") {
    url.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(url);
}
