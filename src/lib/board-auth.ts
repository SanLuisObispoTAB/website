// Board Hub session validation, shared by `src/proxy.ts` and any API route
// that serves board-only data.
//
// WHY THIS IS SHARED RATHER THAN COPIED
// The proxy gates on `pathname.startsWith("/board")`, which means an API route
// at `/api/board/...` is **not** covered by it — the path does not start with
// `/board`. Anything under `/api` that returns board-only data therefore has to
// check the session itself, and a second hand-rolled HMAC check is exactly the
// kind of duplication that drifts until one side is subtly weaker. One
// implementation, imported by both.
//
// The cookie is an HMAC-SHA256 over the expiry timestamp, keyed by
// BOARD_PASSWORD itself — so rotating the password at board handover
// invalidates every existing session for free.

export const BOARD_COOKIE = "slotab_board";

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

export async function hmacSign(secret: string, msg: string): Promise<string> {
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

export async function isBoardCookieValid(
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

/** Fail-closed session check for API routes serving board-only data.
 *  Returns false when BOARD_PASSWORD is unset — an unconfigured gate is a
 *  closed gate, never an open one. */
export async function requestHasBoardSession(req: Request): Promise<boolean> {
  const password = process.env.BOARD_PASSWORD;
  if (!password) return false;
  const cookie = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${BOARD_COOKIE}=`))
    ?.slice(BOARD_COOKIE.length + 1);
  return isBoardCookieValid(cookie, password);
}
