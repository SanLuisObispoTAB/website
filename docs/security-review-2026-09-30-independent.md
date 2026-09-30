# SLOTAB security review — September 30, 2026

**Review only. No application changes, dependency updates, credential changes, commits, pushes, or deployments were made by this review.** Recommendations below are proposed follow-up work, not completed remediation.

## Result and scope

This review identified **six remaining security findings: five Medium and one Low**, plus a separate notification-delivery reliability issue. The most immediate dependency concern is the **Decap CMS 3.3.3 script still served by the live admin page**, which is covered by a published stored-XSS advisory but is absent from the npm lockfile audit. Other findings concern session revocation, rate limiting, donor-wall request validation, OAuth permissions, and webhook replay.

No Critical or High exploit was confirmed against the current live deployment. This is a bounded source review with targeted checks, not a claim that the system is free of other vulnerabilities.

### Two source versions were encountered

The local checkout is behind the public repository. Treating them as one version would incorrectly report several already-addressed issues as current:

| Reviewed surface | Version / observation |
| --- | --- |
| Original local checkout | `5b3e4f4d7e4dc58b7e08db8a7dc92dee4d3ab352`; Next.js 16.1.6 |
| Newer public `main` | `c5f385731f1ca232571d192169ec7f560badc383`; includes security changes in `d65bf170de0b6ea63b98dfd496c50dbb99848785`; Next.js 16.3.8 |
| Upstream security commits | Both report a committer timestamp of September 30, 2026, 17:12:36 UTC; already present when inspected |
| Live site | Small unauthenticated HEAD/GET checks on September 30; headers and route gating consistent with the newer source |

The newer source was downloaded into a temporary review directory; the working checkout was not pulled, reset, or updated. Findings below refer to **the newer public commit** unless explicitly marked otherwise. Code links are pinned to that commit so line numbers remain meaningful. The live Vercel deployment SHA, environment settings, and account-level controls were not inspected; matching responses do not independently prove the complete deployed source version.

Reviewed areas: all application API routes, Board Hub authentication and data access, Decap OAuth and admin configuration, Square checkout/reporting/webhooks, donor-wall writes, email handling, headers, CI configuration, and locked dependencies. Targeted tests used synthetic credentials and mocked Square, GitHub, and Resend responses. Production checks did not attempt passwords, create payments or contacts, send mail, publish content, or run denial-of-service/RCE payloads.

## Findings remaining in current source

| ID | Severity | Finding | Evidence / qualification |
| --- | --- | --- | --- |
| SEC-01 | Medium | Live Decap version is covered by a stored-XSS advisory and sits outside npm audit coverage | Version confirmed live; advisory-based exposure, exploit not reproduced in SLOTAB's preview widgets |
| SEC-02 | Medium | Board login and public API limits lose state across instances and when the counter map fills | Confirmed with isolated copies of the actual limiter; production traffic distribution not stress-tested |
| SEC-03 | Medium | Donor-wall writes lack origin/CSRF validation | Confirmed handler accepts a foreign-origin form with a valid cookie; browser exploitation requires same-site attacker content |
| SEC-04 | Medium | Logout cannot revoke a copied Board Hub session | Confirmed locally; requires prior possession of a valid cookie |
| SEC-05 | Medium | CMS OAuth token permissions extend beyond the SLOTAB repository | Confirmed requested scope; exploitation requires token compromise or malicious use |
| SEC-06 | Low | Valid Square webhooks can be replayed to resend notifications | Confirmed with two identical signed synthetic deliveries; no payment or refund is executed |

### SEC-01 — Decap CMS version with a published preview-pane XSS advisory

**Evidence.** [public/admin.html, line 30](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/public/admin.html#L30) loads `https://unpkg.com/decap-cms@3.3.3/dist/decap-cms.js`. A GET of the live `/admin` page returned that exact script URL and its SRI hash. The [CMS configuration, line 44](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/public/admin/config.yml#L44) enables editorial workflow; no explicit global preview disablement was found.

[CVE-2025-57520 / GHSA-xp8g-32qh-mv28](https://github.com/advisories/GHSA-xp8g-32qh-mv28) lists Decap versions through 3.8.3 as affected by stored XSS in the admin preview, with no patched version listed in the advisory at review time. The reported prerequisite is an author/contributor able to introduce malicious content that an editor previews. The installed version falls within that range. This review did **not** inject malicious content or demonstrate execution in SLOTAB's particular JSON-based collections; deployment-specific exploitability remains to be validated in isolation.

**Impact.** If the reported preview behavior is reachable, code could execute in the CMS admin origin and use or expose its browser-held GitHub credentials. SEC-05 increases the potential scope. The SRI hash protects against an unexpectedly modified CDN file; it does not remove vulnerabilities in the pinned file. The observed CSP has `frame-ancestors`, `base-uri`, and `object-src`, but no `script-src`/`default-src` restriction to contain script execution.

**Suggested follow-up.** Validate the affected preview behavior with synthetic content in an isolated CMS instance; establish whether a reviewed fix exists or restrict/disable unsafe preview rendering. Track CDN-loaded dependencies alongside lockfile dependencies. Do not assume upgrading to an arbitrary later Decap release resolves the advisory.

### SEC-02 — Per-instance throttling is not a reliable authentication boundary

**Evidence.** [src/lib/rate-limit.ts, lines 27–73](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/lib/rate-limit.ts#L27) keeps counters in a module-local `Map`. At 10,000 unexpired keys, it calls `hits.clear()`. [The login route](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/board/login/route.ts#L84), checkout, and both Springly routes rely on this limiter.

**Validation.** Ten incorrect synthetic login attempts returned 401 and the eleventh returned 429, confirming the new single-instance control works. Independently loading the same limiter allowed the already-blocked key immediately. Filling the first instance with synthetic distinct keys also cleared its existing block. No traffic flood or IP-header spoofing was attempted against Vercel.

**Impact and prerequisites.** A password-guessing or order/contact-spam campaign distributed across serverless instances, cold starts, or many real client addresses receives more attempts than the apparent limit. The capacity-clear path can additionally forget blocked clients. It does not automatically grant access, and its practical impact depends on password strength, platform protections, and traffic routing. Springly record pollution requires that integration to be configured. The source already acknowledges the limitation; adding login protection makes its security significance greater than a nuisance-only checkout control.

**Suggested follow-up.** Use shared, atomic rate-limit state with bounded eviction that preserves active blocks. Design authentication abuse controls separately from public form throttling, including monitoring and an account-wide backoff strategy that does not create an easy global lockout.

### SEC-03 — Donor-wall mutation trusts the cookie without validating request origin

**Evidence.** [src/app/api/board/donor-wall/route.ts, lines 62–78](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/board/donor-wall/route.ts#L62) authenticates the cookie, then processes ordinary form data. It has no CSRF token or Origin/Fetch-Metadata check. Unlike the login route, it does not call `isSameOriginRequest`. The session cookie is `SameSite=Lax`.

**Validation.** A local call with a synthetic valid board cookie, `Origin: https://untrusted.ravens-peak-consulting.com`, and destination `https://slotab.ravens-peak-consulting.com/api/board/donor-wall` accepted a `carryover-accept` form, returned 303, and invoked the mocked GitHub write once. The fixture name was verified against a mocked existing `unverified` entry; arbitrary names remain rejected by the application checks. No real donor or repository was changed.

**Impact and prerequisites.** A logged-in board member visiting attacker-controlled content on another HTTPS origin within the same registrable domain could be induced to accept or dismiss a known candidate. The carryover names are available in the public repository, so candidate-name checks alone are insufficient against forged actions. Exploitation also requires configured repository-write credentials. `SameSite=Lax` prevents the usual unrelated-site POST scenario, but it does not block same-site sibling-origin requests. See [MDN's explanation of this distinction](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF).

The review found **no evidence of an attacker-controlled sibling or a subdomain takeover**. This is a conditional CSRF exposure, not a demonstrated production compromise. The local test proves handler behavior; it is not a browser-level exploit demonstration.

**Suggested follow-up.** Require an exact trusted origin and/or a session-bound CSRF token on donor-wall mutations. Apply the rule consistently to authenticated state-changing endpoints, while preserving the intended aliases. Scheme as well as host should be part of an origin comparison.

### SEC-04 — Board sessions remain valid after logout

**Evidence.** [src/lib/board-auth.ts, line 26](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/lib/board-auth.ts#L26) sets a 30-day lifetime. [Validation, lines 102–129](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/lib/board-auth.ts#L102) checks only the signed expiry. [Logout, lines 11–14](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/board/logout/route.ts#L11) expires the browser cookie without revoking the server's acceptance of its value.

**Validation.** Minted a session with a synthetic password, called the actual logout handler, and passed the original cookie to `requestHasBoardSession`. Logout correctly returned a clearing cookie; the copied original was still accepted.

**Impact and prerequisites.** Someone who obtained a session before logout can continue accessing donor/report pages and authorized donor-wall actions until expiry or a password rotation. Logout on the legitimate browser does not terminate the copied session. A former board member who still knows the shared password can also log in again until it is rotated. This review did not recover a production cookie or assess the actual password strength. HttpOnly, Secure in production, and signed expiry are positive controls; this is a revocation limitation rather than a signature forgery.

**Suggested follow-up.** Use individually revocable sessions and identifiable board accounts, or introduce server-side session IDs/revocation state. Define offboarding and incident-revocation procedures. A shared-password rotation currently invalidates all sessions, but cannot selectively remove one device or user.

### SEC-05 — Browser-held CMS OAuth credentials are not repository-scoped

**Evidence.** [src/app/api/decap/auth/route.ts, line 72](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/decap/auth/route.ts#L72) requests `public_repo,read:user`. [The callback, lines 165–167](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/decap/callback/route.ts#L165) returns the access token to browser-side Decap. `repo: SanLuisObispoTAB/website` in the CMS configuration chooses a repository; it does not constrain the token's GitHub authority.

GitHub documents [`public_repo`](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps) as granting read/write capabilities over public repositories within the user's existing permissions, rather than one selected repository. Organization policy may further restrict access. The newer change from `user` to `read:user` removes unnecessary profile-write scope but leaves this repository-scope issue.

**Impact and prerequisites.** Compromise of an editor's browser-held token could affect other public repositories accessible to that user and permitted to the OAuth app. Even within SLOTAB, repository write authority is broader than editing the content files presented by the CMS. The exposed token's actual grants and organization restrictions were not inspected. This is a least-privilege design finding, not evidence that tokens have leaked.

**Suggested follow-up.** Evaluate a CMS authentication/backend arrangement using repository-limited GitHub App permissions. Until that is practical, assess editor-account permissions and organization restrictions, and document the residual scope accurately. This OAuth token is distinct from the server-side `GITHUB_TOKEN` used for donor-wall commits.

### SEC-06 — Signed webhook replay produces duplicate emails

**Evidence.** [src/app/api/square/webhook/route.ts, lines 156–180](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/square/webhook/route.ts#L156) checks event type and completed-payment status, then sends notifications. It neither records `event_id` nor remembers payment IDs already notified. [The mailer](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/lib/email.ts#L78) does not provide an idempotency key to its provider.

**Validation.** An invalid signature returned 401 without sending mail. Two identical, correctly signed synthetic notifications returned 200 and produced two mocked email sends. Thus signature authenticity works, while duplicate-delivery handling is absent.

**Impact and prerequisites.** Normal Square retries can duplicate fulfilment instructions. An attacker who already possesses a complete valid signed delivery could replay it to flood the configured inbox or repeat work orders without learning the signing secret. There is no evidence such a delivery has leaked. No payment, refund, or automatic perk fulfilment occurs in this handler, so this finding is rated Low. [Square explicitly documents duplicate deliveries and retries](https://developer.squareup.com/docs/webhooks/overview).

**Suggested follow-up.** Persist event/payment processing state, atomically deduplicate deliveries, and use provider idempotency where available. Preserve legitimate delayed retries; a simplistic short timestamp cutoff is not an adequate replacement for deduplication.

## Separate reliability issue

**REL-01 — Downstream failures are acknowledged as successfully received without durable recovery.** In [the webhook](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/square/webhook/route.ts#L292), an email failure still returns HTTP 200 with `{ok:true,email:"failed"}`. [An order-fetch failure](https://github.com/SanLuisObispoTAB/website/blob/c5f385731f1ca232571d192169ec7f560badc383/src/app/api/square/webhook/route.ts#L298) becomes empty metadata, then HTTP 200 with `ignored: "not from the website"`. Both were reproduced with mocked 503 responses. There is no durable retry queue in the reviewed code.

Consequently, transient provider failures can lose a donation or sponsorship handoff even though the payment remains correctly recorded in Square. This is operational reliability rather than a demonstrated attacker exploit. Logs and the live donor queue provide some recovery evidence, but do not automatically resend every failed notification. Future work should durably capture delivery/processing state before acknowledgement and retry downstream failures together with SEC-06's deduplication control.

## Original-checkout issues already addressed upstream

These are relevant to anyone building from the unchanged local checkout, but are **not counted as remaining findings above**:

| Original local issue | Verification of newer source |
| --- | --- |
| Next.js 16.1.6 and vulnerable transitive dependencies | Original lockfile: 9 npm package findings (1 Critical, 6 High, 1 Moderate, 1 Low). Current public lockfile: **0 reported**. Current Next.js is 16.3.8 and Sharp is 0.35.5. Counts are package findings, not nine proven remotely exploitable bugs. |
| Proxy-only Board Hub gate combined with dotted-path exclusion and an affected Next.js version | Original version falls within [GHSA-267c-6grr-h53f](https://github.com/vercel/next.js/security/advisories/GHSA-267c-6grr-h53f). Current source upgrades Next.js and explicitly matches board paths. Live `/board/cms-access.rsc` redirected to login. No original-version production exploit was attempted. |
| Login and Springly routes lacked application-level throttling | Current routes use the limiter; local login test confirms 429 after ten failures in one instance. SEC-02 documents the remaining limitation. |
| Public `/admin-portal` | Now explicitly gated; live HEAD returned 307 to board login. The original directory data was empty, so no current member-directory leak was demonstrated. |
| OAuth callback lacked explicit no-store and nonce-cookie cleanup; requested profile-write scope | Current callback adds no-store, cookie cleanup, and script-safe JSON; auth requests `read:user`. SEC-05 addresses the separate repository-scope issue. |
| No CSP in application configuration | Current source and live responses include `frame-ancestors 'none'; base-uri 'self'; object-src 'none'`. This still does not restrict script sources. |

The original npm Critical label includes conditional framework advisories. In particular, Windows-specific RCE was not applicable to the stated Vercel deployment, and AVIF/image-optimizer exploit prerequisites were not demonstrated. The report does not equate a version-range match with successful code execution. [Next.js's September release](https://nextjs.org/blog/september-2026-security-release) identifies 16.3.8 as a security update; its presence in public main was verified directly.

## Controls observed working and review limits

- Live unauthenticated `/board`, `/board/cms-access`, `/board/cms-access.rsc`, and `/admin-portal` returned 307 to login. The board report API and weekly report cron returned 401 without credentials. HEAD checks do not establish the security of every path variant.
- Board data APIs validate sessions themselves. Missing board/cron secrets fail closed. CMS OAuth uses a random state nonce and targeted, allowlisted postMessage origins. Square signatures cover the configured URL and raw request body and use a timing-safe comparison.
- Checkout derives sponsorship tier constraints server-side and bounds donation amounts/designations. Payment-card entry is delegated to Square. No real checkout, payment, refund, contact creation, or email was made for this review.
- Live headers include HSTS, `nosniff`, frame denial, referrer policy, and the limited CSP. The Decap CDN script has version pinning and SRI.
- A targeted secret-pattern scan of 216 tracked text files in the original checkout found no matches for the credential patterns checked. This was not a full-history or binary-document secret scan, and does not prove absence of secrets.
- Board handoff notes and donor-wall source data live in a public repository. The reviewed handoff is a sample template; 37 carried-over donor entries remain in the `unverified` array. Removing data from a rendered page does not make its Git history private. The repository already warns editors about this; no new secret disclosure is asserted here.
- Shared passwords, production token scopes/expiry, MFA, GitHub branch protection, Vercel access/WAF rules, preview-environment isolation, logs, Square/Resend account settings, DNS ownership, and historical incidents were not verified through account dashboards. No authenticated CMS preview exploit was attempted.
- npm audit covers the lockfile only. It does not cover the CDN Decap bundle, hosted checkout, Hudl embed, or every service dependency. Zero advisories in the current lockfile is not a clean bill of health for the complete website.

## Evidence and reproduction

The accompanying `security-review-2026-09-30-evidence` directory contains:

- `npm-audit-original.json` and `npm-audit-current.json`: raw advisory results for the two lockfiles, queried September 30.
- `live-headers.json` and `live-admin.json`: selected public response headers and the CMS script/version observation; no authenticated responses or cookies.
- `local-check-results.json`: six isolated check results covering five failing security/reliability behaviors and one positive login-throttle control.
- `isolated-checks.cjs`: the reproduction harness. It runs source modules with synthetic credentials, overrides every fetch with local stubs, and never calls an external service. The 10,000-key capacity test is an in-memory loop, not an HTTP load test.
- `manifest.json`: source SHAs and hashes of the reviewed current files.

To reproduce the local checks, prepare an isolated checkout at `c5f385731f1ca232571d192169ec7f560badc383`, install its locked dependencies with `npm ci --ignore-scripts --no-audit --no-fund`, and run the supplied harness with that checkout's absolute path as its argument. It writes only its JSON results to `/tmp/slotab-security-local-check-results.json`. A passing harness means the documented behaviors were reproduced; it does not mean the vulnerabilities are fixed. The tests exercise handlers directly, not a complete browser/Vercel deployment.

**Disposition:** Findings documented for review. Remediation is intentionally deferred at the user's request.
