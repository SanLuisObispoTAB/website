# SLOTAB website — security review, 2026-09-30

Written for the board. Decisions #240–#247 in `docs/project-status.md`
record the same work as history; this is the readable version.

## The short version

The site was in good shape. The previous review (#73, May 2026) found the
API surface solid and it still is: no secrets have ever been committed,
sessions are signed cookies the browser cannot read, every gate fails
closed when its configuration is missing, the Square webhook checks its
signature, and the admin loads its one external script with an integrity
hash.

One thing was seriously wrong, and it was not in our code. The web
framework the site runs on (Next.js) was several releases behind, and the
version we were on had a **critical** set of published vulnerabilities —
including one that could bypass the password gate on `/board` and one
that could run code on the server through a crafted image. That is fixed:
the framework is now current and an automated check (Dependabot) will
open a pull request every week from now on when a dependency has a newer
version.

Everything else below is hardening: small things that were fine on their
own and are now harder to get wrong.

## Findings and what was done

Severity is what the finding could have cost, not how hard the fix was.

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | **Critical** | `next` 16.1.6 carried nine published vulnerabilities (1 critical, 6 high): proxy bypass via segment-prefetch routes (GHSA-26hh-7cqf-hhc6), unauthenticated RCE in the image optimiser via AVIF (GHSA-2xp9-vwfh-vxw4), cache poisoning of proxy redirects, request smuggling in rewrites, and others. Nothing in the repo or the deploy surfaces this. | Upgraded `next` and `eslint-config-next` to 16.3.8; `npm audit fix` for two transitive packages. **0 vulnerabilities.** Added `.github/dependabot.yml` (weekly npm, monthly Actions). Decision #240. |
| 2 | **High** | The board login accepted unlimited password attempts. One shared password with no throttle is a dictionary attack waiting for a script. | Ten failed attempts per address per 15 minutes, then `429 Retry-After`. Correct passwords are never throttled. Cross-site `Origin` refused (403). #241. |
| 3 | Medium | The login route had its own copies of the HMAC signer, the constant-time compare and the cookie name, separate from the ones the proxy validates with. Two implementations of one check drift. | One implementation in `src/lib/board-auth.ts`, imported by login, logout and the proxy. #241. |
| 4 | Medium | `/admin-portal` (the future Springly member directory) was public — unlisted, but reachable. Empty today; would hold member emails once Springly is connected. | Behind the board password. #242. |
| 5 | Medium | The proxy's route matcher skipped any path containing a dot, so `/board/anything.dotted` never reached the password check. Harmless today; the exact shape of the framework bypass in finding 1. | Explicit matchers for `/board`, `/board/:path*`, `/admin-portal`, `/admin-portal/:path*`. #242. |
| 6 | Medium | The two Springly form endpoints had no throttle. Once the Springly key is set, each request creates a CRM contact. | Five requests per minute per address. The sponsor endpoint is no longer called by anything and is flagged for deletion if Springly is dropped. #243. |
| 7 | Medium | The Decap admin's OAuth callback page — the one that hands a GitHub access token to the CMS — had no `Cache-Control: no-store`, left its handshake cookies alive for ten minutes, compared the anti-CSRF nonce with a plain `!==`, and inlined values without escaping `</script>`. | All four fixed. Scope reduced from `user` (profile read+write) to `read:user`. Board members will see GitHub's re-authorise prompt once. #244. |
| 8 | Low | The weekly Treasurer cron compared its bearer secret with a plain `!==`. | `timingSafeEqual`. #245. |
| 9 | Low | The CSV report accepted any string for its date range and put it in a response header; CSV cells were not escaped and a value starting with `=` would run as an Excel formula. | Dates must be `YYYY-MM-DD`; every cell RFC-4180 quoted and formula-prefixed. #245. |
| 10 | Low | No `Content-Security-Policy`. A full one was deferred in #73 because it needs every external source enumerated. | Shipped the three directives that cannot break a page: `frame-ancestors 'none'; base-uri 'self'; object-src 'none'`. Full policy still deferred. #246. |
| 11 | Bug | The repo-write helper allowed exactly one file (`donors.json`). Since #212 the Hall of Fame wall lives in `hof-donors.json`, so its Accept button on `/board/donor-wall` has been refused every time with "path not allowed". | Two-file allowlist; everything else still refused. Needs a real Hall of Fame donor to verify end-to-end. #247. |

## What was checked and found clean

- **Secrets.** Full git history (all branches, ~106k lines of diff)
  grepped for Square, GitHub, Resend, AWS and Google token shapes, private
  keys, and literal assignments to every secret-bearing environment
  variable name. Nothing. `.env*` is ignored in both `.gitignore` and
  `.vercelignore`; no `.env` file is tracked.
- **Injection.** No `dangerouslySetInnerHTML`, `innerHTML`, `eval` or
  `new Function` anywhere in `src/`. Scraped event data from the SLOHS
  Google Sheet is rendered as text by React; no links are built from it.
  Query parameters on `/thank-you` are rendered as text.
- **Links.** Every `target="_blank"` carries `rel="noopener"` or
  `rel="noreferrer"`.
- **Square.** The payment-link route never accepts a price from the
  browser for a fixed-price item, bounds donation amounts, validates every
  designation and sport against the team list, refuses sandbox
  credentials on the live site, and rate-limits. The webhook verifies
  Square's HMAC signature with a constant-time compare and refuses to run
  unconfigured.
- **Board session.** HMAC-SHA256 over the expiry, keyed by the password,
  so rotating the password invalidates every session. `httpOnly`,
  `Secure`, `SameSite=Lax`. Unset password means a closed gate. The CSV
  and donor-wall API routes check the session themselves because the
  proxy does not cover `/api`.
- **Decap admin.** Loaded from unpkg at a pinned version with an SRI hash.
  OAuth uses a random nonce in an `httpOnly` cookie and posts the token
  only to an allowlisted parent origin.
- **Headers.** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, HSTS (one year),
  locked `Permissions-Policy`, and now the minimal CSP.
- **Public data.** `board.json` publishes names, roles and only club-owned
  or district email addresses — no personal addresses or phone numbers.
  Rosters are name and grade only, enforced by `npm run team-audit`
  (#235). The Springly directory stub is empty by design.
- **CI.** The events workflow has `contents: write` on the repo only, uses
  pinned major versions of the official checkout and setup-node actions,
  and commits one data file.

## How it was verified

`tsc --noEmit` and `next build` clean after the upgrade. A dev server with
a throwaway `BOARD_PASSWORD` and `CRON_SECRET` was probed with `curl`:

| Probe | Result |
|---|---|
| `GET /` headers | all seven security headers present, CSP included |
| `GET /board`, `GET /admin-portal` | 307 → `/board/login` |
| `GET /board/donor-wall.segments/x.rsc` | 307 → `/board/login` (dotted path now gated) |
| `GET /boardroom` | 404, not gated |
| `POST /api/board/login` with foreign `Origin` | 403 |
| 12 wrong passwords | 10 × 401, then 429 with `Retry-After: 900` |
| correct password, fresh address | 200 + cookie; `/board` and `/admin-portal` then 200 |
| `next=//evil.example`, `next=/donate` | both land on `/board` |
| logout | `/board` redirects again |
| cron: none / wrong / right bearer | 401 / 401 / past auth |
| 6 Springly posts | 5 × 200, then 429; sponsor route shares the bucket |
| Decap callback | `Cache-Control: no-store`, both cookies cleared |
| CSV with malformed date / no session | 400 / 401 |

## Still open

- **Full Content-Security-Policy.** Ship report-only first; needs the
  source list (unpkg, blueframetech, Google Fonts, Vercel analytics, Next
  inline scripts).
- **Shared rate-limit store.** The limiter is per serverless instance. It
  closes the simple case; a strong board password is still the real
  control.
- **Verify #247.** Accept the next Hall of Fame donor on `/board/donor-wall`
  and confirm a commit lands on `hof-donors.json`.
- **Someone owns the Dependabot PRs.** They arrive Mondays. See the
  README for the merge rule.
- **Lint.** The newer `eslint-config-next` enables stricter rules; four
  existing components and the unshipped `docs/design` mockups now report
  errors. None affect the build.

## For board members

Two things you may notice, both expected:

- Next time you sign in to `/admin`, GitHub will ask you to re-authorise
  the SLOTAB Decap CMS app. The permission it asks for is smaller than
  before.
- If you mistype the board password ten times in a row, the login will
  refuse you for fifteen minutes. Typing it correctly is never blocked.
