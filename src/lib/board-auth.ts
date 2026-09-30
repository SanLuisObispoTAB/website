// Board Hub session validation, shared by `src/proxy.ts` and any API route
// that serves board-only data.
//
// WHY THIS IS SHARED RATHER THAN COPIED
// The proxy gates on the path prefix, which means an API route at
// `/api/board/...` is **not** covered by it — the path does not start with
// `/board`. Anything under `/api` that returns board-only data therefore has to
// check the session itself, and a second hand-rolled HMAC check is exactly the
// kind of duplication that drifts until one side is subtly weaker. One
// implementation, imported by both.
//
// The cookie is an HMAC-SHA256 over the expiry timestamp, keyed by
// BOARD_PASSWORD itself — so rotating the password at board handover
// invalidates every existing session for free.
//
// 2026-09-30 security review (#240): the login route used to carry its own
// copy of `hmacSign` / `constantTimeEqual` / the cookie name — the exact drift
// this header warns about. Everything the login and logout routes need now
// lives here, so there is one signer, one comparer, one cookie shape.

export const BOARD_COOKIE = "slotab_board";

/** How long a board session lasts. Thirty days: the board meets monthly and a
 *  re-prompt more often than that is friction on a volunteer, less often than
 *  that is a stale device holding the hub open. */
export const BOARD_COOKIE_TTL_MS = 60 * 60 * 24 * 30 * 1000;

/** Every path the board password protects. The proxy gates these; the login
 *  route only ever redirects back into one of them (open-redirect guard).
 *
 *  `/admin-portal` joined the list in #240. It had been unlisted-but-public
 *  since it was built as a Springly stub, with a note on the page itself
 *  saying it needed to move behind the login "before it holds real member
 *  data". Gating it now costs nothing while it is empty and means the day the
 *  Springly key lands, member emails are not one URL guess away. */
export const GATED_PREFIXES = ["/board", "/admin-portal"] as const;

/** True for `/board`, `/board/anything`, `/admin-portal`, … — and, on purpose,
 *  false for `/boardroom`: a bare `startsWith` would gate any future public
 *  page that happened to share the prefix. */
export function isGatedPath(pathname: string): boolean {
  return GATED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function base64urlEncode(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Length-then-XOR comparison, so a wrong guess costs the same time whether
 *  it is wrong in the first character or the last. Web-Crypto-only on purpose:
 *  this file runs in the proxy (Edge runtime), where `node:crypto` is absent. */
export function constantTimeEqual(a: string, b: string): boolean {
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

/** Mints a fresh session cookie value: `<expiry ms>.<hmac(expiry)>`. */
export async function makeBoardCookieValue(secret: string): Promise<string> {
  const expiry = Date.now() + BOARD_COOKIE_TTL_MS;
  const sig = await hmacSign(secret, String(expiry));
  return `${expiry}.${sig}`;
}

/** The cookie attributes both the login and logout routes must agree on — a
 *  logout that clears a cookie with a different `path` clears nothing. */
export function boardCookieOptions() {
  return {
    name: BOARD_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
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

/** Defence in depth against cross-site request forgery on the board's
 *  state-changing routes.
 *
 *  The session cookie is `SameSite=Lax`, which already keeps it off a
 *  cross-site POST — that is the primary control. This is the second one: a
 *  browser sends `Origin` on every POST, so a request whose `Origin` names a
 *  different host than the one it arrived at was not made by our own page.
 *
 *  A request with NO `Origin` header is allowed through. That is not a gap:
 *  the routes this guards also require the session cookie, and a cross-site
 *  browser POST always carries `Origin`. Requiring it would only break a
 *  future curl-based board tool for no gain.
 *
 *  Compared by host rather than by a fixed origin list, because the hub is
 *  reachable on the canonical domain AND the SLOHS-firewall alias, and a
 *  board member on the alias posts from the alias. */
export function isSameOriginRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host")?.toLowerCase();
  if (!host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}
