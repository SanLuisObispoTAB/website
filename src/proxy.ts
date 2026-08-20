import { NextRequest, NextResponse } from "next/server";
// Session validation lives in lib/ so API routes serving board-only data can
// use the same check — the proxy does not cover /api/board/*.
import { BOARD_COOKIE, isBoardCookieValid } from "./lib/board-auth";

// Three jobs:
//   1. Password-gates the SLOTAB Board Hub at /board/*.
//   2. Marks every non-slotab.org host `noindex` (see INDEXABLE_HOSTS).
//   3. Redirects pre-cutover WordPress URLs, and evicts the stale browser
//      cache they arrive with (see LEGACY_WP_URLS).
//
// Password-gates the SLOTAB Board Hub at /board/*. Set BOARD_PASSWORD as a
// Vercel env var to enable. The login form at /board/login posts to
// /api/board/login, which sets a signed cookie (HMAC-SHA256 over the
// expiry timestamp, keyed by BOARD_PASSWORD itself — rotating the
// password at board handover automatically invalidates old sessions).
//
// Uses the Next.js 16 "proxy" file convention (renamed from middleware).

// Runs on every page request (static assets and anything with a file
// extension are excluded) so the canonical-host check below can tag
// non-slotab.org responses. Board gating still applies only to /board/*.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

// Hosts allowed to be indexed. Everything else — the vercel.app URL, the
// SLOHS-firewall-friendly slotab.ravens-peak-consulting.com alias, Vercel
// preview deployments, localhost — gets `X-Robots-Tag: noindex` so it can
// never compete with slotab.org in search results.
const INDEXABLE_HOSTS = new Set(["slotab.org", "www.slotab.org"]);

/** Adds `X-Robots-Tag: noindex, nofollow` unless this request came in on
 *  the canonical domain. Applied to redirects too, so a gated /board hop
 *  off a preview host stays untagged-for-indexing all the way through. */
function withIndexPolicy(res: NextResponse, req: NextRequest): NextResponse {
  const host = req.headers.get("host")?.split(":")[0].toLowerCase() ?? "";
  if (!INDEXABLE_HOSTS.has(host)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

// ---------------------------------------------------------------------------
// LEGACY WORDPRESS URLS — and the stale caches that come with them
//
// slotab.org ran WordPress until the 2026-08-15 cutover. Two problems came out
// of that switch, and they turned out to be the same problem.
//
// The old host sent `Cache-Control: public, max-age=2678400` — 31 days — on
// its HTML. So a visitor who loaded the old site shortly before the cutover
// still has a *fresh* copy of it on disk, and their browser serves it without
// ever asking the network. Nothing on this server gets consulted, which is why
// there is no way to simply "push" the new site to them.
//
// What we can do is catch them the moment they move. Five of the eight nav
// links on that cached homepage (`/about-2`, `/contact-2`, `/membership-2`,
// `/booster-bash-2`, `/slotab-merch`) pointed at URLs that 404'd here, which
// trapped them on the old site with no way across. Redirecting those links is
// the escape hatch, and it doubles as the fix for search results and
// bookmarks — a real visitor hit `/membership-2` at 19:51 on 2026-08-18.
//
// The `-2` suffixes are WordPress's own collision renaming, from pages that
// were rebuilt over the top of older ones. Every entry is a URL verified to
// have existed, from the Internet Archive's record of the domain.
//
// Paths that still resolve on the new site (`/about`, `/membership`,
// `/booster-bash`, `/season-passes`, `/upcoming`, `/volunteer`) are
// deliberately absent — they already work. The pre-WordPress `.htm` URLs are
// handled in `next.config.ts`; see the note there for why they live apart.
const LEGACY_WP_URLS = new Map<string, string>([
  ["/about-2", "/about"],
  ["/contact-2", "/contact"],
  ["/donate-2", "/donate"],
  ["/membership-2", "/membership"],
  ["/booster-bash-2", "/booster-bash"],
  ["/apparel", "/merch"],
  ["/shop", "/merch"],
  ["/slotab-merch", "/merch"],
  ["/fundraising", "/donate"],
  // No newsletter archive was carried over, so home is the honest landing
  // point rather than a page that promises something we don't have.
  ["/newsletters-2", "/"],
  ["/sports-camp", "/"],
  ["/youth-sports-camp", "/"],
]);

/** Redirects a pre-cutover WordPress URL, or returns null if `pathname`
 *  isn't one.
 *
 *  These redirects live here rather than in `next.config.ts` because config
 *  redirects are matched *before* the proxy runs and are emitted as bare
 *  responses — they carry none of the headers from `headers()`, so there is
 *  no way to attach anything to them. Doing the redirect here is what makes
 *  the `Clear-Site-Data` below possible.
 *
 *  A request for one of these paths is near-proof the visitor is running on
 *  pre-cutover state, so we take the opportunity to drop this origin's cached
 *  responses — including the stale copy of `/` that is the reason they were
 *  seeing the old site at all. Without it the redirect fixes this one click
 *  but leaves the poisoned homepage sitting there until it expires on its own.
 *
 *  `"cache"` only — NOT `"*"`, which would also clear cookies and take out
 *  both the board session and the visitor's cookie-consent choice. Safari
 *  ignores Clear-Site-Data entirely, so those visitors still need one manual
 *  reload; Chrome, Edge, Firefox and Android Chrome are covered.
 *
 *  308 rather than 307 so search engines transfer the old pages' standing to
 *  the new ones instead of treating these as temporary detours. */
function legacyWordPressRedirect(
  pathname: string,
  req: NextRequest,
): NextResponse | null {
  const destination = LEGACY_WP_URLS.get(pathname);
  if (!destination) return null;

  const url = req.nextUrl.clone();
  url.pathname = destination;
  url.search = "";
  const res = NextResponse.redirect(url, 308);
  res.headers.set("Clear-Site-Data", '"cache"');
  return res;
}

const COOKIE_NAME = BOARD_COOKIE;
// Login route is the one /board/* path that must NOT be gated, or the
// user can never authenticate.
const PUBLIC_PATHS = new Set(["/board/login"]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Before anything else: a pre-cutover URL means a pre-cutover visitor.
  const legacy = legacyWordPressRedirect(pathname, req);
  if (legacy) return withIndexPolicy(legacy, req);

  // Everything outside /board/* is public — it only needs the index policy.
  if (!pathname.startsWith("/board")) {
    return withIndexPolicy(NextResponse.next(), req);
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return withIndexPolicy(NextResponse.next(), req);
  }

  const password = process.env.BOARD_PASSWORD;
  if (!password) {
    // Not configured yet — redirect to login, which renders a
    // "not configured" notice. Fail-closed.
    const url = req.nextUrl.clone();
    url.pathname = "/board/login";
    url.searchParams.set("notconfigured", "1");
    return withIndexPolicy(NextResponse.redirect(url), req);
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const ok = await isBoardCookieValid(cookie, password);
  if (ok) return withIndexPolicy(NextResponse.next(), req);

  const url = req.nextUrl.clone();
  url.pathname = "/board/login";
  if (pathname !== "/board") {
    url.searchParams.set("next", pathname);
  }
  return withIndexPolicy(NextResponse.redirect(url), req);
}
