# SLOTAB Website — Project Status & Backlog

A living document the board updates between sessions to keep
decisions, pending work, and external inputs in one place.

> **Last updated:** 2026-05-28 *(13 more 2025-26 photos staged + beach-VB carousel slot upgraded — #70; `/teams` index now blooms a photo strip on each card as you scroll between seasons — #71)*
>
> Update this doc after each board meeting or working session.

---

## How to use this doc

- **Decisions Log** — append new rows; never edit prior entries.
- **Current Build State** — flip the status box when work lands.
- **Active Backlog** — work in priority order. Move done items to "Built" below.
- **Open Questions** — anything we're explicitly waiting to decide.
- **External Inputs Pending** — assets/credentials we're waiting on.

Status legend: ✅ done · 🟡 in progress · 🔴 blocked · ⏳ deferred · ❌ removed

---

## Decisions Log

| Date | # | Decision | Owner |
|---|---|---|---|
| 2026-04-07 | — | Build a refactor preview at `ravens-peak-consulting.com/slotab-preview` using Next.js + Vercel. Black/gold visual identity preserved from current WordPress site. | Erik |
| 2026-04-23 | 1 | **Approve migration** from GoDaddy WordPress to Vercel | Board ✅ |
| 2026-04-23 | 2 | **Designate 2–3 board editors** for Decap CMS access | Board ✅ |
| 2026-04-23 | 3 | **GitHub repo owner**: org-like (TBD org name) | Board (org name pending) |
| 2026-04-23 | 4 | **Real Impact ledger data** | Board — in discussion |
| 2026-04-23 | 5 | **HOF info available** — committee + ceremony URLs | Board — to deliver |
| 2026-04-23 | 6 | **NFHS Network**: not included | Board ❌ |
| 2026-04-23 | 7 | **Hudl integration**: awaiting API key | Board 🔴 (see #48) |
| 2026-04-23 | 8 | **Springly integration**: awaiting API key | Board 🔴 (see #48) |
| 2026-04-23 | 9 | **Team page scheduling**: removed for now (lives only on `/upcoming`) | Board ❌ |
| 2026-04-23 | 10 | **Standard Comms Kit**: evolve to not include scheduling info; kit links to central schedule | Board — pending |
| 2026-04-23 | 11 | **Liaisons sourced from the kit** but **shown on the public team page** | Board ✅ |
| 2026-04-23 | 12 | **Photos**: forthcoming | Board — to deliver |
| 2026-04-23 | 13 | **Standard Kit defaults**: pending #10 | Board — pending |
| 2026-04-23 | 14 | **Drop `noindex`** at slotab.org cutover | Board ✅ |
| 2026-04-23 | 15 | **Membership tier model**: considering "donation amount → tier" auto-assignment | Board — in discussion |
| 2026-04-23 | 16 | **No comms on SLOTAB website**: Standard Kit is internal-only | Board ✅ |
| 2026-04-23 | 17 | **Tiger News Network (TNN)**: removed from website; Hudl is sole video source | Board ❌ |
| 2026-04-23 | 18 | **Home page**: Donate-first prominent CTA + smaller Volunteer/Sponsor row | Board ✅ |
| 2026-04-23 | 19 | **Recurring donations**: monthly only | Board ✅ |
| 2026-04-23 | 20 | **75/25 split** (team/general): show only at point of donation | Board ✅ |
| 2026-04-23 | 21 | **Goal model**: per-team goals + per-trimester campaign goal (overall) | Board ✅ |
| 2026-04-23 | 22 | **ParentSquare URL**: `https://www.parentsquare.com/schools/1903/` | Board ✅ |
| 2026-04-23 | 23 | **GitHub repo**: <https://github.com/eramberg/slo-tab-website> (personal account; can transfer to org later) | Erik ✅ |
| 2026-04-23 | 24 | **Vercel project** created and connected to the new repo. Stable URL: <https://slo-tab-website.vercel.app> | Erik ✅ |
| 2026-04-23 | 25 | **GitHub OAuth App + Decap CMS** wired up; admin at /admin works end-to-end | Erik ✅ |
| 2026-05-06 | 26 | **Watch tab**: add "Sponsored by SLOTAB" label on Huddle embeds | Board ✅ |
| 2026-05-06 | 27 | **Homepage CTAs**: Donate is primary; Member + Volunteer collapse into a single secondary button. Top-right nav "Join" pill swaps to "Donate" | Board ✅ |
| 2026-05-06 | 28 | **Donate CTA on team pages**: each team page surfaces both general SLOTAB and sport-specific donate options | Board ✅ |
| 2026-05-06 | 29 | **Donation ladder**: one-time floor **$25** · ladder $25 / $50 / $100 / $200 / $500 / $1000 / $5000 · "Other" custom amount, no cap | Board ✅ |
| 2026-05-06 | 30 | **Recurring donations**: monthly checkbox alongside one-time. **Recurring floor lowered to $10** (one-time stays $25) — recurring at low monthly amounts compounds to meaningful annual value. Backend re-emits each recurring as a fresh monthly one-time entry so Trina's QB workflow doesn't change | Board ✅ |
| 2026-05-06 | 31 | **Square transaction-ID strategy**: each transaction carries a code that encodes sport/team designation, so QB reconciliation report shows customer name/email · sport · amount | Board ✅ (Erik to research mechanics) |
| 2026-05-06 | 32 | **Impact page — simplified first cut**: ONE general SLOTAB thermometer (anchor example: ~$75K for Huddle + T-shirts + senior banners). Per-team thermometers come later once transaction codes land. Optional drill by fundraising drive (fall/winter/spring) | Board ✅ |
| 2026-05-06 | 33 | **Impact updates monthly**, posted before each SLOTAB meeting. Disclaimer: 75% of designated donations go to team (matches what coaches see in their accounts) | Board ✅ |
| 2026-05-06 | 34 | **Sponsor wall layout**: "Become a Sponsor" is a compact expandable ABOVE the wall — collapsed by default so logos stay above the fold; expands to show levels + brochure link | Board ✅ |
| 2026-05-06 | 35 | **Sponsor logos clickable** through to each sponsor's URL | Board ✅ |
| 2026-05-06 | 36 | **Platinum sponsor carousel** on homepage — auto-rotate, click-through; tier-based, zero manual work | Board ✅ |
| 2026-05-06 | 37 | **Membership ↔ sponsorship merge** (philosophy): any donation = membership. Naming TBD ("Supporter / Fan / Booster" floated). 4-year auto-renew option floated. Final levels gated on Deneen + Ann wine meeting | Board — pending wine meeting |
| 2026-05-06 | 38 | **Booster Bash ticket sales** go live 2026-07-01 (kept inside next fiscal year) | Board ✅ |
| 2026-05-06 | 39 | **Events workflow**: shared Google Sheet (board + Adam + Phil + liaisons) auto-syncs to site daily. Add a 2026-2027 page; include SLOTAB events (physicals night, fall/spring parent meetings) | Board ✅ |
| 2026-05-06 | 40 | **Team pages are NOT a game-communication channel** — Home Campus is the source of truth for schedules/changes next year. Practice schedules excluded (too volatile). Rosters + wishlists + liaisons + coach contacts are kept | Board ✅ |
| 2026-05-06 | 41 | **Design direction**: Option #1 *classic collegiate* approved (Stanford/Menlo style); keep the SLO\|TAB masthead. Option #2 *magazine* repurposes as the newsletter template. Option #3 *Huddle-forward* dropped | Board ✅ |
| 2026-05-06 | 42 | **Go-live target 2026-08-01** — just before the new school year. Preview at the next casual board cocktail at the Hub | Board ✅ |
| 2026-05-06 | 43 | **The 25% is the SLOTAB general fund, not "overhead"** — funds shared-benefit items (Huddle, senior banners, T-shirts, etc.) that all teams use. About-page + Impact-page copy must reflect this, since coaches who say "we get nothing from SLOTAB" are overlooking what the general fund pays for on their behalf | Erik ✅ |
| 2026-05-06 | 44 | **Coach onboarding 1-pager** — written deliverable explaining where SLOTAB dollars come from, how the 75/25 split works, what the general fund covers, and how to read team-page totals | Erik to draft ✅ |
| 2026-05-06 | 45 | **Year-over-year totals visible on Impact + team pages** — "FY26 raised $X, FY25 raised $Y" so the page is useful even mid-year | Erik ✅ |
| 2026-05-06 | 46 | **Trina-facing operations doc** for the Square→QB workflow — covers data flow, tag schema, refund/correction path, what to do if the sidetool breaks | Erik to draft ✅ |
| 2026-05-06 | 47 | **Open considerations from Phase 0 plan** — sponsorship-bundle splits (e1), in-kind donations (e2), restricted-vs-unrestricted gifts (e4) — Erik to surface at next board meeting before they get coded | Board — pending discussion |
| 2026-05-06 | 48 | **Springly + Hudl integrations TABLED** until access is sorted. **Springly** (Serenity tier): no Integrations tab visible at admin level — Owner role almost certainly required, OR API access may be a paid add-on Serenity doesn't include; pending support reply. **Hudl** (Pro tier): no self-service developer portal — `developer.hudl.com` routes back to the regular admin console. API access is gated through Hudl's Partner Program (broadcast/stat partners), not exposed to individual schools. Erik to email Hudl support 2026-05-07 asking whether Pro includes any API or if a Partner agreement is required for a single-org public-data integration. Plan B options (Zapier for Springly; manual `data/hudl.json` updates via Decap) remain in place. | Erik 🟡 (Hudl portion unblocked 2026-05-13 via BlueFrame embed — see #59; Springly portion still 🔴) |
| 2026-05-06 | 49 | **Membership Join form folded into the Donate flow** (philosophy from #37 made concrete). The standalone `/membership` "Join Online" form is gone; `/donate` now captures donor identity (Name, Email, Phone, Display-on-Wall checkbox). Submit alert shows membership tier enrollment alongside the donation. Once Springly creds land, one combined POST creates the contact record + donation in a single round-trip. | Erik ✅ |
| 2026-05-06 | 50 | **Nav top-right CTA: Donate → Join** (links to `/membership`). Reverses an earlier swap (#27) — having two Donate CTAs in the same fold (nav + hero) was redundant. Hero keeps the primary "Donate Now" button | Erik ✅ |
| 2026-05-07 | 51 | **Custom domain `slotab.ravens-peak-consulting.com`** added (CNAME → Vercel) so the SLOHS district firewall (which blocks `*.vercel.app`) can reach the preview. Aliased to the `slo-tab-website` Vercel project's production deployment, no code changes needed. Domain pulls Let's Encrypt cert automatically. The old `ravens-peak-consulting.com/slotab-preview` mirror path is now obsolete — this aliases the live build instead of mirroring it into the Raven's Peak repo | Erik ✅ |
| 2026-05-07 | 52 | **Mobile responsive pass**. The 2026-05-06 rebuild was tuned for desktop and read poorly on phones. Added two breakpoint tiers (480px phone + 720px tablet) covering masthead wordmark, hero (edge-to-edge photo, drop the desktop side mask), stats grid (stays 2×2), sponsor wall (force 2-up across all tiers), watch feature (smaller, stronger blackout, title text-shadow), and impact card (full-width, shorter photo). Required re-asserting `.tiger-scope` (0,2,0) overrides for headlines and watch-feature title to beat unscoped late rules in tiger.css | Erik ✅ |
| 2026-05-07 | 53 | **Team photo overhaul** — Erik provided sport-specific photos for nearly every team and adopted a new filename convention: first letter `b`/`g`/`c` (boys/girls/co-ed), then a short sport name (`fball`, `bball`, `vball`, `bvball`, `sball`, `golf`, `soccer`, `wrestling`, `XC`, `track`, `cheering`, `stunt`, `swim`, `lacrosse`, `fieldhockey`). `bball` = basketball, so `bbaseball` is the boys-baseball prefix to avoid collision. PHOTO_BY_SLUG in TeamsCarousel + the four active team-page heroPhotos (football, girls-volleyball, baseball, track-field) + ClassicHero + HeroCarousel + hudl.json + impact.json all migrated to convention names | Erik ✅ |
| 2026-05-07 | 54 | **Originals subdirectory** — `public/photos/originals/` now holds 25 old non-conformant files (date-coded `081xxx`, generic `tennis.jpg`/`volleyball.jpg`/`water-polo-*.jpg`, etc.). Convention-named copies live alongside the new photos in `/photos/`. All in-code references migrated to the new names; the originals are kept for archival/fallback only | Erik ✅ |
| 2026-05-07 | 55 | **`ctrack-2.jpg` (track runner #14 leading) added as a 6th slide on the homepage hero carousel** alongside football×2, water polo, student section, and basketball — gives spring-season balance | Erik ✅ |
| 2026-05-13 | 56 | **Sports list aligned with the official SLOHS athletics site.** Boys Lacrosse + Field Hockey removed (club sports, not on `slohs.slcusd.org/athletics`). Girls Water Polo moved Winter → Fall (Central Section runs both in fall). Girls Wrestling added (Winter); slug `wrestling` renamed to `boys-wrestling` for parity. Cheer split into Fall sideline `cheer` and Winter `competitive-cheer`. Stat-bar count 27 → 26 → 27 (Cheer split offsets removals + Girls Wrestling). Two orphan stock-photo placeholders (`blacrosse-…`, `gfieldhockey-…`) purged. | Erik ✅ |
| 2026-05-13 | 57 | **Shop promoted to top-level nav** between Watch and Hall of Fame (was buried in the Get Involved dropdown). **Top-right Join CTA pill retired** — Donate/Sponsor/Volunteer hero + Get Involved dropdown cover that intent without crowding the nav (reverses #50). **"Wear Your Stripes" featured-gear strip** added to the home page between Teams carousel and Calendar+Watch — 3 spring shirts on cream cards w/ hover lift and "Shop all designs →" linkout. Best-practice rationale: top-nav item for discoverability + home strip for browse-bait; no second pill that would dilute Donate. | Erik ✅ |
| 2026-05-13 | 58 | **Photo audit + 2025-26 team-photo refresh.** Cross-referenced all team slugs vs. the new official zip. Carousel slots updated with 2025-26 SLOHS portraits where the old photo was wrong/shared/placeholder: boys-tennis (CIF 2026 D2 Champions, replaces student-section placeholder), girls-tennis (replaces shot w/ Clovis player in frame), boys + girls cross-country (replaces shared co-ed group shot), boys + girls wrestling (replaces shared dark dramatic shot), competitive-cheer (own portrait, no longer shares fall cheer). Three orphans purged: `cXC-image-1200x900`, `bwrestling-checukk`, `gtennis.jpg`. **Action shots stay on the home carousel; formal team portraits live on individual team pages** via a new "Meet the Team" section. 13 additional 2025-26 team portraits staged in `public/photos/` for the 23 team pages not yet built — just set `"teamPhoto"` in the team JSON to light up. Decap `teamPhoto` field added. | Erik ✅ |
| 2026-05-13 | 59 | **Hudl integration partially unblocks #48 via Hudl Support-built BlueFrame web-component embed.** Path narrative: probed `fan.hudl.com` (no iframe — X-Frame-Options SAMEORIGIN) → confirmed vCloud per-broadcast iframes (`vcloud.hudl.com/broadcast/embed/<id>`) work and are CSP-clean → built a custom catalog + Decap form + per-game pages around real SLOHS broadcast 4031110 (boys volleyball, archived) → Hudl Support then handed us an official `<blueframe-app>` web-component pre-configured to vCloud site 6609 with theme colors already in SLOTAB gold. The portal auto-renders live + upcoming + archived rows with search and section filters. Custom catalog (broadcasts.json, BroadcastGrid/Card/Embed, `/watch/[broadcastId]` per-game pages, Decap "Watch — Broadcast Catalog" collection) decommissioned. `/watch` is now just an intro strip + the BlueFrame embed wrapped in a dark "broadcast surface" section. Editor workflow per game: zero on the SLOTAB side. **Open**: portal currently shows 4 archived broadcasts in an error state (Hudl Support working it) + omits recent broadcasts that are "Available" but not yet "Archived" status — pending the publish-to-viewer workflow answer from support. | Erik ✅ |
| 2026-05-13 | 60 | **Public vs No-Scout default policy for SLOHS broadcasts** drafted. **Public by default (12 teams)** — boys/girls cross country, boys/girls swim & dive, boys/girls golf, boys/girls tennis, track-field, sideline cheer, competitive cheer, stunt: outcomes don't change based on opponent video study (measurable individual performance or judged routines). **No-Scout by default (13 teams)** — football, boys/girls/beach volleyball, boys/girls basketball, boys/girls soccer, boys/girls water polo, baseball, softball, flag football: set plays + tendencies are legit scout targets. **Borderline (2 teams)** — boys/girls wrestling default private but easy to flip per match. Per-broadcast override always available; playoffs may lock normally-public sports; Title IX symmetry preserved. Awaiting AD/coach validation. | Erik (drafted) · Adam/Phil to confirm |
| 2026-05-13 | 61 | **Footer ligature fix.** Manrope ships typographic substitutions `(c) → ©`, `(r) → ®`, `(tm) → ™` in its `liga` (standard ligatures) feature — unusual placement, but verified by diff-test (only `liga 0` stops it; calt/clig/dlig alone don't). Six places on the site were rendering "501(c)(3)" as "501©(3)" (footer, stats bar, donate form, about page, DonateForm disclaimer, tiger-footer). Fixed at `.tiger-scope` body level via `font-feature-settings: "liga" 0, "clig" 0, "calt" 0, "dlig" 0`. Negligible visual cost on Manrope's subtle letter ligatures; IRS designation rendering correctly is non-negotiable. | Erik ✅ |
| 2026-05-14 | 62 | **Doc maintenance handoff.** Claude (the agent doing the implementation work) is now responsible for keeping `docs/project-status.md` current — append a decisions-log row after each shipped chunk, move active-backlog items to Built, refresh External Inputs Pending, then commit alongside the work. Anchored in a new `CLAUDE.md` at repo root so future Claude sessions inherit the instruction. | Erik ✅ |
| 2026-05-14 | 63 | **Springly import research + canonical CSV shape.** Public-marketing-side investigation done — Springly's Serenity tier supports Excel/spreadsheet import with field auto-detection, but the actual import wizard fields are admin-only and require Owner access (still gated by #48). New `docs/springly-import.md` captures what's known, a canonical 2-CSV column shape (`members`, `sponsors`) that maps cleanly to Springly's contacts model AND to the existing `/api/springly/*` route stubs AND to a fallback Zapier path. Two sample CSVs at `docs/springly/test-members.csv` (12 fake households/individuals across all 5 tiers + Coach + lapsed) and `docs/springly/test-sponsors.csv` (8 fake businesses across all 4 sponsor tiers + in-kind + lapsed) — dry-run targets once Owner access lands. Real source spreadsheets from Trina + sponsorship lead still pending. | Erik (research) ✅ |
| 2026-05-14 | 64 | **Board Hub at `/board`** — password-gated organizational-memory section for handoff between board generations. Architecture: Next.js Edge middleware (`src/middleware.ts`, since renamed to `src/proxy.ts` per Next.js 16 — see #65) gates `/board/*` against a `BOARD_PASSWORD` env var, sets a signed cookie (HMAC-SHA256 over expiry, keyed by the password itself — so rotating the password at annual handover automatically kills old sessions). Content lives in `src/app/data/board-handoff.json` as structured per-role exit notes; outgoing officers fill 9 prompts (what worked / what broke / who to call / vendor relationships / where logins LIVE / calendar landmarks / open TODOs / anything else) via a new "Board Handoff Notes" Decap collection. Hub at `/board` lists the 13 roles from the current roster; per-role page at `/board/[role]` shows all years of notes for that role, newest first. Login at `/board/login`; sign-out via `/api/board/logout`. **Hard rule baked into the Decap form hints + the hub banner: never paste passwords or secrets into these fields — the repo is public, only the rendered page is gated. Describe where secrets live (vault pointers) instead.** v1 keeps scope lean on exit-notes only; "key contacts" + "annual calendar" + "process recipes" sections were explicitly deferred. | Erik ✅ |
| 2026-05-14 | 65 | **Decap OAuth host-aware postMessage** (debugging chain for the Board Hub rollout). First Vercel build of #64 failed two ways: (a) `useSearchParams()` in `/board/login` needed a `<Suspense>` boundary even with `dynamic="force-dynamic"` and (b) Next.js 16 deprecated the `middleware.ts` file convention in favor of `proxy.ts` (renamed file + renamed exported function `middleware` → `proxy`; `config.matcher` unchanged). Build then passed but board members hit a second bug: clicking "Login with GitHub" in /admin hung forever. Initial diagnosis (hash deep-link `/admin/#/collections/.../entries/...` racing with Decap's OAuth init) was wrong — the real root cause was that `config.yml` hardcodes `base_url: https://slo-tab-website.vercel.app`, so the Decap OAuth callback always tries to postMessage the token back to the parent admin window using vercel.app as `targetOrigin`. But board members hit `/admin` via the SLOHS-firewall-friendly CNAME alias `slotab.ravens-peak-consulting.com` (#51), so the browser silently drops the postMessage and login hangs. Fix: `/api/decap/auth` now reads the parent origin from the Referer header at the start of the OAuth flow, validates it against a server-side allowlist in `src/app/api/decap/origin-allowlist.ts` (vercel.app, ravens-peak alias, slotab.org future, localhost), persists it through the GitHub round-trip via an httpOnly cookie, and `/api/decap/callback` uses it as the postMessage `targetOrigin`. GitHub OAuth App registration (single redirect_uri at vercel.app) is unchanged — only the in-callback postMessage is host-aware now. Already includes `slotab.org` so it'll keep working through the domain cutover. Also kept the new-tab CTA UX from the misdiagnosis (preserves /board reading context while writing a handoff). | Erik ✅ |
| 2026-05-25 | 66 | **Photo library — 24 additional curated game photos** layered on top of the existing convention-renamed library (#53/#58). Filtered from a 180-photo raw dump that arrived as two folders (`SLOHS Sports Photographs-part-{1,2}/`, 1.7 GB combined). Originals moved into `public/photos/originals/SLOHS Sports Photographs-part-*/` to match the originals-dir pattern from #54, then those specific subdirs were added to `.gitignore` so the 1.7 GB doesn't track or deploy (the existing 25 archival files in `originals/` stay committed). Curation prioritized photographer-flagged variants (`copy`/`5x7`/`8x10`/letter suffixes are print versions the photographer prepared, so reliable favorites). Rejected several with baked-in text overlays ("How About Them Tigers?", "Not in Our House", "Tiger Nation"). Sport breakdown: boys basketball ×6, football ×5 (incl. `tigers-mascot.jpg` studio portrait), boys volleyball ×2, tennis ×3 (b+g), girls soccer ×3, boys soccer ×3, plus `ccheer-team.jpg` and `gwpolo-coach-huddle.jpg` (kept distinct from origin's already-shipped `gwpolo-huddle.jpg`). Carousel (`ClassicHero`) gains slides 7 + 8 — boys basketball (`bbball-shot-394.jpg`) and girls soccer (`gsoccer-huddle.jpg`); both sports were previously absent from the hero rotation despite the broader photo refresh. Also added optional `heroPhotoPosition` to the Team type so per-team hero crops can anchor at "center top" when the source photo's faces sit above its natural center; applied to `girls-volleyball` and `baseball` where the default center crop was chopping faces and landing on chests. | Erik ✅ |
| 2026-05-26 | 67 | **GitHub repo renamed; Vercel deploy in limbo pending pricing question.** GitHub repo transferred from `eramberg/slo-tab-website` (Erik's personal account) to `SanLuisObispoTAB/website` (the SLOTAB org account). Old URL still works via GitHub redirect — `git push` to `eramberg/slo-tab-website.git` returns a `This repository moved` notice and accepts the push, so commits made today (`63a4a77`, `9bac97a`, `f74d101`, `d6a75c6`) landed cleanly on `SanLuisObispoTAB/website`. Updated Decap config `repo:` to the new path explicitly. **The blocker is on Vercel**: a new Vercel project under the SLOTAB org account was created in parallel, but Vercel flagged it for the team/business pricing tier rather than honoring non-profit eligibility, and their sales team hasn't followed up. Until that's resolved, the working deploy target is a new Vercel project under the **Raven's Peak Vercel team** (which Erik already pays for and trusts) connected to `SanLuisObispoTAB/website`. The `slotab.ravens-peak-consulting.com` subdomain (set up in #51 as a CNAME alias to the personal `slo-tab-website` Vercel project) moves to the new Raven's Peak-team project. Note this means a temporary architectural inversion from #51's "production-track Vercel + CNAME for firewall" framing — Raven's Peak-team Vercel is now the primary deploy target, not an alias. **Vercel-side checklist for Erik**: (1) create new project under Raven's Peak team, connect to `SanLuisObispoTAB/website` repo, branch `main`; (2) copy env vars from old project (`BOARD_PASSWORD`, `DECAP_GITHUB_CLIENT_ID`, `DECAP_GITHUB_CLIENT_SECRET`, plus any `SPRINGLY_*` if set); (3) move the `slotab.ravens-peak-consulting.com` custom domain to the new project; (4) update GitHub OAuth App callback URL to the new `*.vercel.app` URL (and `slotab.ravens-peak-consulting.com` already in the postMessage allowlist per #65 keeps working); (5) tell Claude the new `*.vercel.app` URL so `src/app/api/decap/origin-allowlist.ts` + `public/admin/config.yml` `base_url` can be updated; (6) keep chasing Vercel sales — eventual SLOTAB-org project is still the right end state. **What's still hardcoded that we know about**: `slo-tab-website.vercel.app` appears in `src/app/api/decap/origin-allowlist.ts`, `public/admin/config.yml` (`base_url`), and a handful of `docs/*.md` files; do a coordinated find-and-replace once the new URL exists. The Decap auth/callback routes themselves read URLs from the request, not from hardcoded strings, so they need no code changes. | Erik 🟡 (Vercel sales follow-up pending; see also #68 for the practical unblock) |
| 2026-05-26 | 68 | **GitHub repo flipped to public** (`SanLuisObispoTAB/website`). Trying to wire the renamed repo to a fresh Vercel project hit a second wall after the SLOTAB-org pricing question from #67 — Vercel Hobby tier refuses to deploy private GitHub *organization* repos at all (forces Pro: $20/seat/month). But the existing security model already assumes the repo is public — decision #64 explicitly: "the repo is public, only the rendered page is gated; describe where secrets live, not the secrets themselves." So the working assumption was already there; flipping visibility just made it real. Sanity-checked before flipping: `.env*` properly gitignored, no `.env` tracked, no token/secret/password literals in tracked code, git history scan since 2026-03 found no past leaks, board-handoff.json is template content only. Coach/board emails in `data/teams/*.json` and `data/board.json` are already on the public site, so no net new exposure. Net effect: unlocks free Vercel hosting on any account (no Pro needed, no sales follow-up needed), aligns the implementation with the documented assumption from #64, and lets the deploy proceed under the Raven's Peak Vercel team without billing changes. SLOTAB-org Vercel account remains the eventual end state — flipping back to a private repo there if/when the non-profit pricing question resolves is a trivial Vercel-side change with no code impact. | Erik ✅ |
| 2026-05-26 | 69 | **Vercel git-link rescue.** Even after #68 made the repo public, pushes to `SanLuisObispoTAB/website` still weren't triggering auto-deploys. Diagnosed via `vercel git disconnect`: the `slo-tab-website` Vercel project was linked to `eramberg/ravens-peak-consulting` (literally the wrong GitHub repo — likely a misclick during an earlier "reconnect in UI" attempt). Pushes to slo-tab-website's actual code were therefore being ignored by Vercel forever; pushes to `ravens-peak-consulting` would have triggered slo-tab-website rebuilds. Fixed via `vercel git connect https://github.com/SanLuisObispoTAB/website`. While diagnosing, found that `vercel --prod` from the repo root uploaded 3.5 GB and hit Vercel's 100 MB per-file limit because no `.vercelignore` existed — Vercel CLI doesn't fully honor nested `.gitignore` patterns. Added `.vercelignore` (defensive overlap with `.gitignore` plus root-level exclusions for `Team Photos/`, the `public/photos/originals/SLOHS Sports Photographs-part-*` raw dumps, and `.claude/`). Used `vercel --prod --yes` as a one-shot to get the photo + crop work live while the git-link was being unwound; that worked but is not the steady-state path — auto-deploy on push is now restored. | Erik ✅ |
| 2026-05-28 | 70 | **Photo library — 13 additional 2025-26 photos staged + beach-VB carousel upgrade.** Erik delivered a new drop covering sports the existing library was thin on. Convention-renamed and resized via the standard `magick … -resize 1200x\> -quality 82 -strip …` pass: action shots `bbball-amaya.jpg` (boys basketball portrait + teammates), `gfball-cushing.jpg` (B&W flag-football sideline), `gsball-london.jpg` (softball pitcher mid-windup), `gtennis-killenberger.jpg` (tennis racket huddle), `gswim-stroke.jpg` (lap-pool stroke), `gbvball-serve-swanson.jpg` (sunset serve at Cal Poly's Swanson Beach Volleyball Complex — dramatic and on-location), `bwrestling-action.jpg` (ride/control position), `ccheering-sideline-2025.jpg` (Tigers sideline-cheer lineup against dusk sky, Sept 2025 football game); team portraits `ccompcheer-buchanan-2025.jpg` (4th-place team photo from the 12-7 Buchanan tournament, fall colors backdrop), `cstunt-team-2026.jpg` (formal Feb 2026 Stunt team-portrait day); volleyball staging trio `gvball-frosh-team-2025.jpg` (labeled) + `gvball-frosh-team-2025-unlabeled.jpg` (clean for hero crops) + `gvball-jv-team-2025-unlabeled.jpg` (clean version of the existing labeled JV — JV stays the JV-not-Varsity per the `_teamPhoto_note` on `girls-volleyball.json`; we still don't have a Varsity portrait). Two exact dupes dropped at the door: a higher-res copy of `bXC-team-2025.jpg` (identical pixels, just unscaled), and `SLOHS 2025 VARSITY VOLLEY TEAM.jpg` (filename misleads — overlay label and pixel content match the existing JV photo). **One carousel swap shipped**: `beach-volleyball` slot in `TeamsCarousel.tsx` (and the home-page "Live & on-demand" Watch feature card in `page.tsx`) moved from `gbvball-ruby-1200x675.png` to the new Swanson serve photo. The old PNG was a 300×168 placeholder thumbnail (not 1200px wide), so the swap was a clear upgrade rather than a curation re-judgement of #58/#66. **Carousel left otherwise untouched** — the other staged photos sit in `public/photos/` for future team pages (the #58 pattern: just set `teamPhoto` in the team JSON to light them up). The orphaned `gbvball-ruby-1200x675.png` was left in `public/photos/` (kept around per the #54 originals-not-deleted norm; can be moved to `public/photos/originals/` in a future cleanup pass). Verified live via `npm run dev` — both carousel and Watch feature render the new image correctly. | Claude ✅ |
| 2026-05-28 | 71 | **`/teams` index — photo-bloom on season focus.** The full sport-index page at `/teams` used to render text-only cards (sport name + gender + CTA) under per-season section headers. Reworked it so each card now has a photo strip that's collapsed to height: 0 by default and expands to 170px when its season section becomes the most-visible one in the viewport (IntersectionObserver-driven `.is-focused` class, with a 0.15 visibility floor so a sliver of the next section doesn't yank focus prematurely). The bloom staggers across the row (30ms per card via `--card-index` custom property) so it feels like a wave of photos rolling in. Per-card hover/focus also expands a single card's photo, so the page is still exploreable without scrolling. `prefers-reduced-motion` gets a static 120px photo with no transition. "Coming soon" cards get a grayscale+darken filter on their photo so live programs (the ones with team pages) read first. Architecture: split the formerly server-only `src/app/teams/page.tsx` into a thin server shell that keeps `export const metadata` + a new client component `src/app/components/TeamsIndexList.tsx` that owns the observer + the focused-season state. The slug→photo map (formerly inline in `TeamsCarousel.tsx`) moved to `src/app/data/team-photos.ts` so both the home carousel and the new index pull from the same source. Reuses the existing curated action-shot library (#53/#58/#66/#70) — no new photo curation, just a new surface. | Claude ✅ |

---

## Current Build State

### Live preview URLs

- **Primary URL (in transition)**: <https://slotab.ravens-peak-consulting.com> — see #67. The CNAME currently points at the old personal `slo-tab-website` Vercel project; that project's GitHub webhook may have severed when the repo was renamed to `SanLuisObispoTAB/website` (the symptom: recent commits push successfully via the GitHub redirect, but don't appear live). Migration to a new Vercel project under the **Raven's Peak Vercel team** is in flight per #67. End state once the SLOTAB-org Vercel pricing question (Vercel sales pending) resolves: a project under the SLOTAB-org Vercel account.
- ⚠ **`slo-tab-website.vercel.app`** — the personal-account Vercel project from #24/#51. Likely no longer auto-deploying after the GitHub repo rename. Don't rely on it; #67 is the migration.
- ❌ **`ravens-peak-consulting.com/slotab-preview`** — abandoned 2026-05-07 (#51). The mirror in the Raven's Peak repo is months out of date. We considered restoring it as a fallback during #67 but rejected — the app now has real API routes (`/api/decap/*`, `/api/board/*`) and proxy middleware that don't work as a pure static export, so a subpath mirror would silently break Decap CMS login and the Board Hub. Subdomain via Raven's Peak Vercel team is the right path.

### Pages

| Page | URL (preview) | Status |
|---|---|---|
| Home | `/slotab-preview/` | ✅ — Donate-first hero, Impact strip, Spring Social, events, Hudl teaser, About strip |
| About | `/about` | ✅ — mission, governance, Title IX, fund flow |
| Impact | `/impact` | ✅ structurally; 🔴 placeholder data with DRAFT watermark + red ribbon — board to compile real ledger |
| Sponsors / Membership | `/membership` | ✅ — sponsor wall (50 logos), Become-a-Sponsor expandable, Print sheet button, member tiers, Join form (stub) |
| Season Passes | `/season-passes` | ✅ — $250 all-sport / $125 single |
| Merch | `/merch` | ✅ — 9 sport-specific shirt designs |
| Hall of Fame | `/hall-of-fame` | ✅ structurally; 🔴 ceremony date + ticket/donate URLs + committee names pending board |
| Watch | `/watch` | ✅ structurally; 🔴 6 placeholder Hudl cards — pending real Hudl API key |
| Spring Social | `/spring-social` | ✅ — flyer + venue + RSVP CTA |
| Volunteer | `/volunteer` | ✅ — meeting schedule + opportunities + team liaisons |
| Upcoming | `/upcoming` | ✅ — 45 events from weekly sheet + SLOTAB events; filterable |
| Teams index | `/teams` | ✅ — all 27 programs, 4 with active pages |
| Football | `/teams/football` | ✅ structurally; 🔴 roster/photos/wishlist placeholder |
| Girls Volleyball | `/teams/girls-volleyball` | ✅ structurally; 🔴 same |
| Baseball | `/teams/baseball` | ✅ structurally; 🔴 same |
| Track & Field | `/teams/track-field` | ✅ — full coaching staff from team site, real upcoming meets |
| Contact | `/contact` | ✅ — board roster |
| Decap admin | `/admin` | ✅ — 10 editable collections; 🔴 GitHub OAuth env vars pending |
| Springly admin | `/admin-portal` | ✅ — stub; 🔴 awaiting Springly API key |

### Infrastructure

| Item | Status |
|---|---|
| Standalone repo at `~/slotab-website/` | ✅ initial commit; not pushed to GitHub yet |
| `ravens-peak-consulting` mirror at `/slotab-preview` | ✅ kept in sync until cutover |
| Weekly events scraper (Sun/Mon/Wed cron) | ✅ — pulls SLOHS athletic dept Google Sheet |
| Decap CMS shell at `/admin` | ✅ — pinned 3.3.3 + SRI |
| GitHub Actions cron commits as Erik | ✅ — Vercel accepts |
| Security headers in `next.config.ts` | ✅ — X-Frame-Options DENY, nosniff, strict referrer, locked Permissions-Policy |
| `robots: noindex` | ✅ — on until slotab.org cutover |

---

## Active Backlog

In rough priority order. Move done items to **Built** below.

### Donate flow (highest priority)

- [ ] **Research Square transaction-ID tagging** (#31) — confirm Square supports per-transaction custom metadata that survives into QB reports; share findings with Trina
- [ ] **Decide Square API vs hosted site (Q1)** — informed by transaction-ID research
- [ ] Multi-sport selection (currently one-at-a-time on `slotab-3.square.site/#YtTGmq`)
- [x] **Tier buttons** (#29): $25 / $50 / $100 / $200 / $500 / $1000 / $5000 + "Other" custom field, no cap; **one-time floor $25** ✅ UI prototype shipped 2026-05-06
- [x] **Monthly recurring** (#30) — toggle alongside one-time; **recurring floor $10** ✅ UI prototype shipped 2026-05-06 (Square backend wiring pending Q1)
- [ ] Transaction-ID per donation encodes sport/team designation; QB report shows customer name/email · sport · amount
- [x] **Show 75% team allocation + 25% general-fund destination** at point of donation (#20, #43) — live preview shows split + general-fund framing as shared programs (not overhead) ✅ shipped 2026-05-06
- [x] **Surface Donate CTA on team pages** (#28) — general SLOTAB + sport-specific buttons; deep-links to `/donate?team=<slug>` ✅ shipped 2026-05-06

### Square → QB sidetool (Phase 0 of Impact rollout)

- [ ] **Build the sidetool** — pulls Square transactions, applies the per-donation tag, exports a QB-ready CSV monthly with: customer name/email · intent (general / sport / big-ticket / sponsorship-bundle) · 75/25 split · sport designation
- [ ] **Transaction-ID schema** — short hash that encodes intent (e.g. `B-FB-S25` for Big-ticket-Football-Spring25); decoded in the sidetool
- [ ] **Donation intent taxonomy**: `general` · `sport=<slug>` · `big-ticket=<line-item>` · `sponsorship-bundle=<id>`
- [ ] **Refund / correction workflow** — sidetool flags mismatches; Trina has a "correct this" path that re-tags + re-emits
- [ ] **Recurring-donation intent persistence** — a monthly donor's designation rolls forward unless explicitly changed
- [ ] **Trina-facing operations doc** (#46) — `docs/treasurer-square-qb.md` covering data flow, tag schema, refund path, failure mode runbook

### Sponsors

- [x] Sponsor logos clickable when `website` field is set ✅
- [x] "Become a Sponsor" expandable above the wall ✅
- [x] Print sponsor sheet button ✅
- [x] **Confirm "Become a Sponsor" expandable is collapsed by default** ✅ verified 2026-05-06 — `BecomeASponsor.tsx` initializes `useState(false)`
- [x] **Platinum sponsor home-page carousel** (#36) — auto-rotate every 4.5s, pause-on-hover, click-through, dot navigation ✅ shipped 2026-05-06
- [ ] Populate real `website` URLs for each sponsor (~50 sponsors) (#35)
- [ ] Wire brochure PDF link inside the expandable

### Impact page

- [ ] **Phase 1 — one general SLOTAB thermometer** (#32) — anchor copy: "$75K covers Huddle + T-shirts + senior banners"; goal source = treasurer's planned-budget figure
- [ ] Optional break-down by drive (fall / winter / spring) on the same page (#32)
- [ ] **Monthly update workflow** (#33) — Trina sends report ahead of monthly SLOTAB meeting; "updated monthly" disclaimer
- [ ] Disclaimer: "75% of designated donations go to that team" (#33)
- [ ] **Year-over-year totals** (#45) — show prior-FY raised next to current-FY raised so the page is useful mid-year
- [ ] **General-fund explainer** (#43) — short About-page-or-Impact-page block: what the 25% covers (Huddle, senior banners, T-shirts, sectional fees, support for under-fundraising teams). Not "overhead"
- [ ] Replace the 24 placeholder line items with real ledger data (board emailing — see Pending Inputs)
- [ ] Filter to **large purchases only**; broad-impact framing for shared items (e.g. scoreboard helps N teams)
- [ ] Remove the DRAFT watermark + red ribbon when real data lands
- [ ] **Phase 2 (later)** — per-team transparency (totals raised + 75% allocated, no goals yet)
- [ ] **Phase 3 (later still)** — per-team thermometers with goals, big-ticket sub-goals, stretch states

### Coach onboarding 1-pager (#44)

- [ ] Draft `docs/coach-onboarding-slotab-funds.md` — explains where dollars come from, the 75/25 split, what the general fund covers, how to read a team page's totals, how to flag corrections
- [ ] Distribute via Phil + Adam at AD handoff
- [ ] Reference from team-page sidebar so coaches can self-serve

### Membership

- [x] **5-tier ladder prototype** (Supporter / Fan / Booster / Champion / Patron) on `/membership` ✅ shipped 2026-05-06 as draft for board review at 5-11. Sourced from `docs/membership-tiers-research.md`
- [x] **One-time vs monthly toggle** on tier cards showing both qualification paths ✅ shipped 2026-05-06
- [x] **4-year auto-renew option** in donate form (#37) ✅ UI prototype shipped 2026-05-06 (only visible when monthly is selected)
- [ ] **Membership ↔ sponsorship merge** final naming + level decision (#37) — pending Deneen + Ann wine meeting (Q7)
- [ ] Real "Join Online" form (live Springly when API key arrives)

### Teams

- [ ] Real rosters from each coach/liaison (currently 12-player placeholder per team)
- [ ] Real wishlist line items per team (currently plausible placeholders) — **wishlists confirmed valuable** (#40)
- [x] **Sport-specific photos for every CIF team** ✅ shipped 2026-05-07 (#53). Every slug in PHOTO_BY_SLUG now points at a real sport photo; T&F hero swapped from the stray tennis placeholder to `ctrack-1200x800.jpg`. 🟡 *Remaining:* `boys-lacrosse` and `field-hockey` are using stock/other-school photos (Los Gatos, Wilton) until SLO Tiger versions arrive
- [ ] Replace the two stock-photo placeholders (lacrosse + field-hockey) with actual SLO Tiger team photos
- [ ] Per-team action shots (rosters / coach portraits / game-day moments) for the 27 individual team pages once each coach contributes
- [ ] Real liaisons per team (currently "Liaison TBD")
- [ ] Coach bios (school site has name + email only)
- [ ] Build out the other 23 team pages once they have content
- [ ] **Adam Basch (outgoing AD, abasch@slcusd.org) to shepherd team-page template + outreach to coaches** during the AD handoff overlap with Phil (incoming AD)
- [ ] **Do NOT add game-communication tooling** (#40) — Home Campus is SoT for schedules/changes next year; practice schedules excluded (too volatile)
- [ ] Update the Standard Comms Kit doc with the link-to-schedule pattern instead of in-kit duplication

### Home page

- [ ] **Combine Member + Volunteer into a single secondary CTA** (#27); Donate stays primary
- [ ] **Swap top-right nav "Join" pill → "Donate"** (#27)
- [ ] Apply Design Option #1 (*classic collegiate*) — keep the SLO|TAB masthead (#41)
- [ ] Platinum sponsor carousel slot (links from Sponsors backlog #36)

### Hall of Fame

- [ ] Real induction ceremony date + venue
- [ ] **Booster Bash ticket sales go live 2026-07-01** (#38) — fiscal-year reasons
- [ ] Real **Booster Bash Tickets** + **HOF Fund Donate** URLs (currently `#`) — Eric to email intern re: ticketing setup
- [ ] Real committee roster
- [ ] Alumni Membership tier — pricing + benefits + join URL (rolls into wine-meeting outcome, Q7)

### Watch (Hudl)

**🔴 BLOCKED 2026-05-06** — All Hudl auto-population work tabled (#48) until Erik secures Owner-level access to the SLOHS Hudl Pro account. The Pro tier exposes the API via `developer.hudl.com` OAuth, but app registration requires Owner credentials.

- [ ] 🔴 Real Hudl game data (auto-scrape via API once Owner-level OAuth credentials arrive)
- [ ] 🔴 Per-game iframe embeds (replace link-out cards on paid Hudl)
- [ ] 🔴 Live-badge pipeline that flips when a stream is live
- [x] **"Sponsored by SLOTAB" label on each Huddle embed** (#26) ✅ shipped 2026-05-06; Watch page intro also updated to credit SLOTAB and tie to donations

**Plan B if super-admin path stays blocked**: keep the current link-out model. Coaches/liaisons paste embed URLs into `data/hudl.json` via Decap CMS as games happen. The "Sponsored by SLOTAB" labels (#26) already deliver the donation-glue value the transcript prioritized.

**What's needed when unblocked**: Hudl Client ID · Client Secret · API base URL · org ID 5267 · scopes (`video:read`, `team:read`, `organization:read`, ideally `live:read`) — set as Vercel env vars `HUDL_CLIENT_ID`, `HUDL_CLIENT_SECRET`, `HUDL_API_BASE`, `HUDL_ORG_ID`.

### Springly

**🔴 BLOCKED 2026-05-06** — Tabled (#48) until Erik secures Owner-level credentials. Confirmed plan tier is **Serenity**; admin login received 2026-05-06 had no Integrations tab visible — Owner role almost certainly required to access API settings (or to confirm whether Serenity includes API access at all).

- [ ] 🔴 Confirm Serenity tier includes API access (or identify the add-on / upgrade path)
- [ ] 🔴 Generate API key from Springly Owner admin and capture endpoint base URL
- [ ] 🔴 Add `SPRINGLY_API_BASE` + `SPRINGLY_API_KEY` env vars on Vercel
- [ ] 🔴 Confirm the Springly REST endpoint path (currently guessed `/contacts` in `src/app/api/springly/*/route.ts`)
- [ ] 🔴 Swap admin-portal page from static JSON to live fetch
- [x] **Import research + canonical CSV shape** drafted in `docs/springly-import.md` (#63) ✅ 2026-05-14 — covers what's known/unknown about the import wizard, the canonical 2-CSV shape (members/sponsors), 8 gotchas to audit before importing real data, and ordered next-steps
- [x] **Sample test CSVs** at `docs/springly/test-members.csv` + `test-sponsors.csv` ✅ 2026-05-14 — fake-data dry-run targets ready for the moment Owner access lands
- [ ] 🟡 **Capture Springly import-wizard screens** to `docs/springly/import-wizard-screens/` once Owner access is sorted (blocks the precise column mapping for the real import)
- [ ] 🟡 **Receive real source spreadsheets** — Trina (members/donor ledger), sponsorship lead (sponsor list)
- [ ] 🟡 **Normalize source → canonical CSVs** via a one-shot `scripts/normalize-springly-import.ts`
- [ ] 🔴 Bulk-import existing membership data into Springly (final step after the above)

**Plan B if super-admin path stays blocked**: route the Join form through a Zapier webhook that creates the Springly contact (~30 min code change, ~$20/mo Zapier cost). Embedded Springly form widget is also possible if Serenity exposes one.

**Support email already drafted** in our 2026-05-06 conversation — Erik will send it once he's the Owner or has confirmation that Serenity includes API access.

### Events workflow (#39)

- [ ] Set up shared Google Sheet (board + Adam + Phil + liaisons) as the source of truth
- [ ] Daily auto-sync from sheet → site (extends existing Sun/Mon/Wed cron)
- [ ] Add 2026-2027 tab to the sheet
- [ ] Include SLOTAB events on the sheet: physicals night, fall parent meeting, spring parent meeting, board meetings, drives

### Deploy / GitHub

- [x] Push `slotab-website` to a new GitHub repo ✅ — <https://github.com/eramberg/slo-tab-website>
- [x] Connect to Vercel as its own project ✅
- [x] Update Decap config `repo` field to the new repo path ✅
- [x] Update GitHub OAuth App callback URL to the new deploy URL ✅
- [x] Add `DECAP_GITHUB_CLIENT_ID` + `DECAP_GITHUB_CLIENT_SECRET` env vars ✅
- [ ] Designate the 2–3 board editors and grant Write access on the new repo
- [ ] **Preview the site at the next casual board cocktail at the Hub** (#42)
- [ ] **Go-live target: 2026-08-01** (#42) — DNS cutover + drop `noindex` + cancel GoDaddy 48h after

---

## Pending Snapshot — 2026-05-06

Cross-cut of everything still pending, grouped by blocker. Detailed
versions of each row appear in *Active Backlog*, *Open Questions*,
and *External Inputs Pending* below — this section is the at-a-glance
view to skim before each session.

### Resolved by the 2026-05-06 transcript

All six items previously in *Pending the transcript* now have direction. Q1 (Square API vs. hosted) is the one architectural decision still outstanding.

| # | Item | Outcome |
|---|---|---|
| ~~T1~~ | Donate page details | ✅ Resolved — see #29 (ladder), #30 (recurring), #31 (transaction-ID for QB) |
| T2 | Square API vs. hosted-site | 🟡 Erik researching mechanics (see #31); shared with Trina before commit |
| ~~T3~~ | Impact page rebuild | ✅ Simplified — see #32, #33. One general thermometer first; per-team later |
| ~~T4~~ | Membership tier auto-assignment | ✅ Direction set — *any donation = membership*. Final levels + naming pending Deneen + Ann wine meeting (#37) |
| ~~T5~~ | Platinum sponsor home rotator | ✅ Approved — auto-rotate, click-through (#36) |
| ~~T6~~ | Open-ended | ✅ See "New from 2026-05-06" below |

### New from 2026-05-06 (not previously in the doc)

| # | Item |
|---|---|
| N1 | "Sponsored by SLOTAB" label on Huddle embeds (#26) |
| N2 | Combine Member+Volunteer into one CTA; swap top-right "Join" → "Donate" (#27) |
| N3 | Donate CTA surfaced on team pages (general + sport-specific) (#28) |
| N4 | "Become a Sponsor" expandable ABOVE wall (collapsed default) (#34) |
| N5 | Booster Bash sales launch 2026-07-01 (#38) |
| N6 | Shared Events Google Sheet (Phil + liaisons + board) → daily auto-sync (#39) |
| N7 | Team pages are NOT for game communication — Home Campus is SoT (#40) |
| N8 | Design Option #1 *classic collegiate* selected; keep SLO\|TAB masthead (#41) |
| N9 | Go-live target 2026-08-01; preview at the Hub cocktail meeting (#42) |

### Pending board decisions (4)

| # | Decision needed | Unblocks |
|---|---|---|
| Q1 | **Square API vs. hosted Square site** | Donate rebuild architecture; Erik researching tag-with-transaction-ID approach (#31), will share findings with Trina |
| ~~Q2~~ | ~~GitHub org name~~ ✅ — repo at `eramberg/slo-tab-website` | — |
| ~~Q3~~ | ~~Donation-to-tier mapping~~ → superseded: any donation = membership (#37); naming + 4-year auto-renew pending Deneen + Ann wine meeting | — |
| ~~Q4~~ | ~~Per-team goal source~~ → deferred until after first general-thermometer cut lands (#32) | — |
| ~~Q5~~ | ~~Per-trimester goal~~ → reframed as the general SLOTAB thermometer (#32) with optional drive breakdown | — |
| Q6 | **Standard Comms Kit defaults** post-#10 evolution | Internal kit playbook update |
| Q7 | **Wine meeting outcome** (Deneen + Ann) — final membership/sponsorship levels, naming ("Supporter / Fan / Booster"?), 4-year auto-renew structure | #37, Membership backlog, Sponsor sheet copy |

### Pending external inputs (15)

| # | Input | Source | Unblocks |
|---|---|---|---|
| E1 | Hudl API key | Hudl admin / paid plan dashboard | Auto-population of `data/hudl.json`, real Watch tab |
| E2 | Sample Hudl per-game embed URL | Hudl admin | Confirms iframe format for inline embeds |
| E3 | Springly API base URL + key | Springly admin | Live Join form + admin portal |
| E4 | HOF ceremony date + venue | HOF Committee | Removes "TBD" from HOF page |
| E5 | Booster Bash Tickets URL | Board | Replaces `#` on HOF page |
| E6 | HOF Fund Donate URL | Board | Replaces `#` on HOF page |
| E7 | HOF Committee roster | HOF Committee | Replaces placeholder list |
| E8 | Alumni Membership pricing + benefits + join URL | Board | Removes placeholder copy |
| E9 | Real per-team rosters | Each coach/liaison | Replaces 12-player placeholder per team |
| E10 | Real per-team wishlist line items | Each coach/liaison | Replaces fake $ amounts |
| E11 | Real liaison names + emails per team | Board (sourced from comms kit) | Replaces "Liaison TBD" |
| E12 | Coach bios | Each coach | School site has only name + email |
| ~~E13~~ | ~~Sport / game photos~~ | ~~Board / parents~~ | ✅ Resolved 2026-05-07 (#53) — every slug has a sport-specific photo. Open: replace stock-photo placeholders for `boys-lacrosse` (Los Gatos) and `field-hockey` (Wilton) with SLO Tiger versions |
| E14 | Sponsor websites | Sponsorship Development | Logos become clickable (~50 sponsors) |
| E15 | 2–3 board editor GitHub usernames | Board | Decap CMS write access on the new repo |

### Pending the GitHub org move (7)

G1 + G2 done ✅. Remaining items below.

| # | Item | Notes |
|---|---|---|
| ~~G1~~ | ~~Push to new GitHub repo~~ | ✅ <https://github.com/eramberg/slo-tab-website> |
| ~~G2~~ | ~~Update `public/admin/config.yml` `backend.repo`~~ | ✅ `eramberg/slo-tab-website` |
| ~~G3~~ | ~~Connect Vercel project to the new repo~~ | ✅ |
| ~~G4~~ | ~~GitHub OAuth App + env vars~~ | ✅ Decap CMS at /admin verified end-to-end |
| G5 | DNS cutover — `slotab.org` → new Vercel project | After G3 live |
| G6 | Drop `robots: noindex` from `src/app/layout.tsx` | At cutover |
| G7 | Cancel GoDaddy Managed WordPress | 48 hours after G5 |

### Highest-leverage unblockers

Transcript ✅ resolved most architectural questions. Remaining big levers:
- **Square API vs. hosted (Q1)** + transaction-ID research → unblocks Donate page rebuild (#29, #30, #31)
- **Wine meeting (Q7)** → unblocks final Membership levels + naming
- **🔴 Owner-level Hudl Pro credentials** (#48) → real Watch tab. *Tabled 2026-05-06.*
- **🔴 Owner-level Springly Serenity credentials** (#48) → live Join form + admin portal. *Tabled 2026-05-06.*
- **Real Impact ledger data (E_impact)** → drops the DRAFT watermark; powers the general thermometer

**Total open**: 2 board-blocked · 14 external-blocked (2 of those tabled #48) · 3 deploy-blocked

---

## Open Questions (waiting on a decision)

| # | Question | Notes |
|---|---|---|
| Q1 | Square API vs hosted Square site? | Erik researching transaction-ID-with-team-tag mechanics (#31); decision after he shares findings with Trina. |
| ~~Q2~~ | ~~New GitHub org name?~~ ✅ Resolved 2026-04-23 — `eramberg/slo-tab-website` | — |
| ~~Q3~~ | ~~Donation → tier mapping~~ ✅ Superseded 2026-05-06 — any donation = membership (#37); levels TBD via wine meeting | — |
| ~~Q4~~ | ~~Per-team fundraising goals~~ ✅ Deferred 2026-05-06 — start with one general SLOTAB thermometer (#32); per-team comes later | — |
| ~~Q5~~ | ~~Per-trimester campaign goal source~~ ✅ Reframed 2026-05-06 — general SLOTAB thermometer with optional drive breakdown (#32) | — |
| Q6 | Standard Comms Kit defaults post-#10 | Internal playbook evolution; kit links to central schedule. |
| Q7 | Wine meeting (Deneen + Ann) outcome | Final membership/sponsorship merge: naming ("Supporter / Fan / Booster"?), 4-year auto-renew, the level → benefits table. |

---

## External Inputs Pending

| Item | Owner | Notes |
|---|---|---|
| ~~GitHub org name~~ | ~~Board~~ | ✅ Resolved — repo at `eramberg/slo-tab-website` |
| **2–3 board editor GitHub usernames** | Board | Get Write access on the new repo for Decap CMS commits |
| **Real Impact ledger data** | Treasurer (Trina) | Promised on 2026-05-06 — dollars funded + items purchased + teams/programs. Fill `data/impact.json`; remove draft watermark |
| **General SLOTAB thermometer goal $** | Board / Treasurer | Anchor the new Phase-1 thermometer (#32). Reference: ~$75K (Huddle + T-shirts + senior banners) |
| **Monthly team-totals report** | Treasurer (Trina) | Drop ahead of each monthly SLOTAB meeting; powers Impact updates (#33) |
| **Wine meeting outcome** | Deneen + Ann | Final membership/sponsorship merge: levels, naming ("Supporter / Fan / Booster"?), 4-year auto-renew structure (#37, Q7) |
| **Sponsor brochure PDF** | Sponsorship Development | Link inside the "Become a Sponsor" expandable (#34) |
| **Platinum-tier sponsor list** | Sponsorship Development | Drives the homepage carousel (#36) |
| **HOF ceremony date + venue** | HOF Committee | Update `data/hof.json` |
| **HOF Booster Bash Tickets URL** | Board | Replace `#` in `data/hof.json`. Sales go live 2026-07-01 (#38) |
| **HOF Fund Donate URL** | Board | Replace `#` in `data/hof.json` |
| **HOF Committee roster** | HOF Committee | Replace placeholder in `data/hof.json` |
| **Alumni Membership pricing + join URL** | Board | Update `data/hof.json.alumniMembership` (rolls into wine-meeting outcome) |
| **Real per-team rosters** | Team coaches/liaisons | Adam Basch (outgoing AD) to drive outreach during handoff to Phil. Replace placeholder in `data/teams/<slug>.json` |
| **Real per-team wishlists** | Team coaches/liaisons | Same files. Confirmed valuable (#40) |
| **Real liaison names + emails per team** | Board | Sourced from comms kit; surfaced on team pages |
| ~~**SLO Tiger lacrosse + field-hockey photos**~~ | ~~Board / parents~~ | ✅ Resolved 2026-05-13 — both sports removed (club, not on official SLOHS list — #56); placeholder photos purged |
| ~~🔴 **Owner-level Hudl Pro credentials**~~ | ~~Erik (#48)~~ | ✅ Resolved 2026-05-13 via Hudl Support-built BlueFrame embed (#59). vCloud admin access secured; per-broadcast `<blueframe-app>` widget covers live + upcoming + archive |
| ~~🔴 **Sample Hudl per-game embed URL**~~ | ~~Erik (#48)~~ | ✅ Resolved 2026-05-13 — confirmed `vcloud.hudl.com/broadcast/embed/<id>` iframe format with SLOHS broadcast 4031110 |
| **Hudl Archive / Publish-to-Viewer workflow** | Erik (open Hudl support thread) | Each new broadcast must be moved into "Archived" viewer status to appear in the BlueFrame portal — the per-broadcast "Available" toggle alone embeds-by-ID but doesn't list. Need the UI control + ideally a per-account default-on (#59). |
| **SLOHS coach decision on per-sport public-vs-No-Scout defaults** | Adam Basch + Phil Angel + sport coaches | Drafted policy in #60 — public for 12 individual/judged sports, No-Scout for 13 team-strategic sports, wrestling borderline. Coaches confirm or override per sport |
| **2025-26 Spring team portraits** | Board / parents | Fall + Winter portraits delivered 2026-05-13; Spring (track-field, softball, beach volleyball, boys-volleyball, boys-swim-dive, boys-tennis, etc.) still pending the next batch |
| 🔴 **Owner-level Springly Serenity credentials** | Erik (#48) | Serenity tier confirmed; admin login lacks Integrations tab → Owner role needed. *Tabled 2026-05-06* until secured |
| 🔴 **Existing Springly membership data** | Board | Currently in Google Docs; bulk-import after creds arrive (depends on #48) |
| **Sponsor websites** | Sponsorship Development | Add `website` field for each sponsor in `data/sponsors.json` to make logos clickable (#35) |
| **Shared Events Google Sheet** | Board + Adam + Phil + liaisons | Single source of truth for all events; daily auto-sync to site (#39) |

---

## 2026-05-06 evening session — what shipped

Long working session running through the Claude Design handoff and
~15 rounds of design fidelity. Site at `slo-tab-website.vercel.app`
is now ready for the 2026-05-11 cocktail board demo at the Hub.

### Tiger design system (new)
- Source Serif 4 (variable font, `opsz` axis enabled) + Manrope +
  JetBrains Mono via `next/font`. Headlines weight 650 with
  `font-optical-sizing: auto` for the lighter editorial display cut.
- Token system: gold `#f5b800` · black `#0a0a0a` · cream `#fbf7ec` ·
  paper `#f3ecda` · bone `#e9e0c8` · graphite `#454340`. Square
  everywhere, hairline borders, no shadows except dropdown menu.
- Full design system in `src/app/tiger.css` (~2200 lines).

### New chrome on every page (replaces legacy Header / Footer)
- `SiteBanner` — black bar with serif "SLO | TAB" wordmark + cream
  tagline, gold border-bottom.
- `TopBar` — score-ticker marquee (5 hardcoded items for now;
  CMS-driven post-demo).
- `TigerNav` — sticky glassy nav with hover dropdowns, JS-managed
  open/close so dropdowns close on link click. Top-right pill is
  "Join" (links to `/membership`).
- `TigerFooter` — dark four-column footer.

### Classic homepage (full rebuild)
- Hero photo carousel, 5 slides, 9.5s rotation, per-slide
  object-position anchors, mask-gradient sidebars fading into the
  dark hero bg. Slides constrained to nav inner width
  (logo's left edge → Join button's right edge).
- Stats bar (27 teams · 600+ athletes · $1.4M raised since 2012).
- Three-ways cards.
- Impact split with $116,800 callout.
- **Platinum sponsor carousel** between Impact and Teams.
- **Seasonal Teams carousel** — auto-detects current trimester
  (Spring at the demo date), shows all 12 in-season teams in a
  scroll-snap carousel with prev/next arrows, drag-scroll on touch.
- Calendar + Watch split — calendar is now **live data** from
  `slotab-events.json` + scraped `weekly-events.json` (filtered to
  ≥ today, sorted ascending, top 5).
- Sponsor wall (dark section) with **alpha-channel logos** —
  pre-processed every existing logo via ImageMagick into
  `public/sponsors/alpha/`. Tiles white, hairline border, hover
  lift to gold.
- Hall of Fame strip (6 inductees previewed, links to full hall).
- Closing gold CTA — "One school. One pride."

### `/donate` and `/membership` updates
- `/donate` now captures donor identity (Name + Email required,
  Phone optional, Donor Wall opt-out checkbox). Every donation
  enrolls as membership at the matching tier (#37 + #49). Submit
  is stubbed for the Square integration which is gated on Q1.
- `/membership` "Proposed Tiers" prototype (5-tier draft from
  `docs/membership-tiers-research.md`) + sponsor wall + sponsor
  expandable. Old "Join Online" form removed (#49) — now links
  to `/donate`.

### Inner-page typography pass
- Updated `.slotab-scope h1/h2/h3/h4` to render in Tiger Source Serif
  (mixed case, weight 650). Auto-underline on every `<a>` removed —
  only `.slotab-prose` paragraphs keep underlined links. Net effect:
  `/about`, `/teams`, `/watch`, `/hall-of-fame`, `/impact`, `/contact`,
  `/spring-social`, `/upcoming`, `/season-passes`, `/merch`,
  `/volunteer` all visually align with the new design without a
  per-page reskin.

### Operations
- Weekly events scrape workflow fixed (was failing every cron run on
  a stale `tnn-videos.json` reference). Manual trigger 2026-05-06
  evening confirmed the scraper itself works; cron will now actually
  commit refreshes Sun/Mon/Wed.
- ImageMagick installed locally; `public/sponsors/alpha/` populated
  for all 4 tiers (~50 logos).

### Known follow-ups
- More real data (sponsor URLs in progress via Decap, real Impact
  ledger numbers pending Trina, real team rosters pending Adam).
- Square/QB sidetool architecture (Q1) still gating live donate.
- Springly + Hudl integrations 🔴 blocked on access (#48).
- Editorial design + mode-switch infrastructure deferred to
  post-demo.

---

## 2026-05-07 session — what shipped

Short follow-on after the 2026-05-06 rebuild, prompted by the
SLOHS network blocking `*.vercel.app` and the user previewing
on a phone.

### Custom domain via Raven's Peak (#51)
- Added `slotab.ravens-peak-consulting.com` as a custom domain on
  the `slo-tab-website` Vercel project (Settings → Domains).
- Cloudflare CNAME `slotab` → `cname.vercel-dns.com`, proxy off
  (gray cloud) so Vercel terminates SSL.
- Vercel auto-issued a Let's Encrypt R13 cert. Domain attached as
  the production alias of the latest deployment so it inherits the
  same auth posture as `slo-tab-website.vercel.app` (no SSO wall).
- No code changes — the canonical Vercel URL still works
  identically; this just adds an alternate hostname.

### Mobile responsive pass (#52)
Single-file CSS update to `src/app/tiger.css`. The desktop design
rendered with several issues on a 375-400px viewport:
- SiteBanner ate ~145px of vertical space before any content.
- Hero photo got sandwiched between dark side bands + a mask
  gradient that ate the photo's edges, leaving a narrow visible
  strip in the center.
- Stats grid collapsed to a 4-tall single column at <480px.
- Sponsor wall rendered as 1-up giant tiles for ~50 sponsors.
- Watch feature title vanished against busy game photos.

Fixes (commit `d8f2f82`):
- **480px tier**: SLO|TAB wordmark 40→28px, drop the dot separator
  in the tagline so it sits on one line, scale hero / closing-CTA /
  page-header headlines down. Stats grid stays 2×2.
- **720px tier**: hero slide + overlays use `left: 0; right: 0`
  (drop the desktop-only side bands) and disable the side mask
  gradient on the photo. Strengthen the bottom darkness gradient
  for legibility on the narrower crop. Sponsor grid forces 2-up
  for every tier with shorter tiles. Impact card stretches full
  viewport width with photo height 560→360. Watch feature shrinks
  to 280px with stronger blackout + text-shadow on the title.
- The (0,2,0) `.tiger-scope` overrides at the end of `tiger.css`
  outranked unscoped media-query rules for hero/CTA/page-header
  headlines + watch-feature title — re-asserted them inside the
  mobile blocks at matching specificity.

### Known follow-ups
- Real Hudl thumbnails on the watch feature will improve title
  contrast further once they land.
- A few tall sponsor logos may want tier-specific tile aspect
  ratios eventually (Crew Wealth, Adventist Health, etc. sit fine
  at 2-up but their proportions vary).
- iOS Safari sometimes hangs onto cached CSS — long-press refresh
  or Private Tab if a test viewer reports the old layout.

### Photo overhaul (#53–#55)

Same 2026-05-07 working session, after the mobile pass. Erik dropped
two batches of sport-specific photos into `public/photos/` along with
a filename convention to keep the directory navigable as it grows.

**Convention.** First letter `b`/`g`/`c` (boys/girls/co-ed), then a
short sport name. `bbaseball-` is the boys-baseball prefix because
`bball` was already needed for basketball.

| Token | Sport |
|---|---|
| `bball` | basketball |
| `bbaseball` | baseball |
| `fball` | football (boys); `gfball` is girls flag football |
| `vball` / `bvball` | volleyball / beach volleyball |
| `sball` | softball |
| `wpolo` | water polo |
| `swim` | swim & dive |
| `XC` | cross country |
| `track` | track & field |
| `cheering` | cheer / fan section |
| `stunt` | stunt |
| `golf` · `soccer` · `wrestling` · `tennis` · `lacrosse` · `fieldhockey` · `dance` | as-is |

**Coverage.** Every CIF varsity sport on `data/teams.json` now has
a sport-specific photo on the homepage seasonal-teams carousel and
(for the four pages with `hasPage: true`) the team-page hero.

Two slugs are using **other-school stock photos** as placeholders:

| Slug | Photo | Issue |
|---|---|---|
| `boys-lacrosse` | `blacrosse-20250501-025-9463.jpeg` | Jerseys say **LOS GATOS** |
| `field-hockey` | `gfieldhockey-JRW_FH_100923_206.jpg` | Jersey says **WILTON** |

Replace these when SLO-specific photos are available; both have
inline `// Note:` flags in `PHOTO_BY_SLUG`.

**Mid-flight corrections** (Erik review):

- `bbball-riley-…jpg` was actually a *girls* basketball photo —
  renamed to `gbball-riley.jpg` and dropped from the boys-basketball
  slot. (boys-basketball later filled by `bbball-e1765386832968.jpg`,
  the team celebrating with the student section.)
- `ccheering.jpg` was actually a body-paint *student section* photo,
  not the Cheer team — renamed to `cstudent-section.jpg`. The actual
  Cheer team photo (originally `gdance-taryn-…`) became
  `ccheering-taryn.jpg` and now powers the `cheer` slug.

**Originals directory (#54).** 25 old non-conformant files (date-
coded `081222SLOvPR`, `03122GVWaterPolo`, plus generics like
`tennis.jpg` / `volleyball.jpg` / `water-polo-*.jpg`) moved to
`public/photos/originals/`. Convention-named copies live alongside
the new photos in `/photos/`. All in-code references — `HeroCarousel`,
`ClassicHero`, `page.tsx` impact card + watch thumbs,
`PHOTO_BY_SLUG`, `hudl.json`, `impact.json`, `baseball.json` —
migrated to the new names.

**Hero carousel addition (#55).** `ctrack-2.jpg` (a SLO Tiger track
athlete, runner #14, leading a Templeton runner mid-stride) is now
the 6th slide on the homepage hero. The carousel was football-heavy
(tunnel + helmets + water polo + student section + basketball);
adding track gives spring-season balance.

**Bonus images not yet placed:**
- `gswim-old-1200x727.jpg` — older girls swim group celebration
  (gswim-10 is the primary; this is a backup)
- `bgolf-raf-1200x1082.jpg`, `ggolf-admin-ajax.png`, `bsoccer-1200x800.jpeg`,
  `gfball-saff{1,6,9}.jpg`, `bbball-1200x906.png` (originally mis-
  prefixed; was actually baseball, now `bbaseball-team-1200x906.png`)
  — alternates not in active use but available for rotation

---

## 2026-05-13 / 14 session — what shipped

Long working session after the 2026-05-11 board cocktail at the Hub. The board reviewed the live preview, surfaced concrete cleanup items, and Erik came back with the official 2025-26 team-photo zip + new Hudl admin access.

### Sports list cleanup (#56)
- Removed Boys Lacrosse + Field Hockey from `teams.json`, `TeamsCarousel` `PHOTO_BY_SLUG`, and `events.ts` (boys-lacrosse was in the `EventCategory` union + `CATEGORY_ORDER`).
- Moved Girls Water Polo Winter → Fall (Central Section runs both polos in fall, not Winter like Southern Section).
- Added Girls Wrestling (Winter). Renamed `wrestling` slug → `boys-wrestling` for parallelism.
- Split Cheer: `cheer` is Fall sideline; new `competitive-cheer` is Winter competition. Stunt unchanged (Spring).
- Stat-bar count `27 → 26 → 27` after the changes net out.

### Nav + home page (#57)
- "Shop" promoted to top-level nav item between Watch and Hall of Fame; "Merch" removed from Get Involved dropdown.
- Top-right "Join" CTA pill retired — Donate/Sponsor/Volunteer hero + Get Involved dropdown cover it (reverses #50).
- New "Wear Your Stripes" featured-gear strip on the home page between the Teams carousel and Calendar+Watch — three Spring shirts (Baseball / Track & Field / Beach Volleyball) on cream cards w/ hover lift, "Shop all designs →" link. Single `FEATURED_MERCH` array at top of `page.tsx` for seasonal swap.

### Team photo refresh (#58)
- Visual audit of every PHOTO_BY_SLUG entry vs. the actual rendered images. Flagged: girls-tennis (Clovis player in shot), boys/girls cross country (shared co-ed photo), boys/girls wrestling (shared dark portrait), competitive-cheer (shared fall photo), boys-tennis (student-section placeholder).
- Erik delivered a 393 MB zip with official 2025-26 team portraits for every Fall + Winter sport (plus stunt + girls swim). All photos resized to 1200px wide / 82% quality / metadata stripped → ~150–400 KB each.
- 7 carousel slots updated with action-or-team-portrait fit; 13 additional team portraits staged in `public/photos/` for the 23 future team pages.
- New **"Meet the Team"** section on individual team pages, sitting between Quick Facts and Donate CTAs. Renders only when a team has its `teamPhoto` field set. Decap CMS now exposes `teamPhoto` field (separate from `heroPhoto`). Wired for football, girls-volleyball, baseball (3 of 4 active team pages — track-field skipped, no Spring photo in this zip yet).
- 3 orphan photos purged: `cXC-image-1200x900.jpeg`, `bwrestling-checukk.jpg`, `gtennis.jpg`.

### Hudl integration — biggest unblock since #48 (#59)
The narrative:
1. Started by probing fan.hudl.com → can't iframe (X-Frame-Options SAMEORIGIN).
2. Found that **vCloud's per-broadcast iframes** at `vcloud.hudl.com/broadcast/embed/<id>` *are* CSP-clean. Built a proof on /watch with broadcast 3864918 (public College of Marin baseball game). Worked.
3. Erik got vCloud admin access; broadcast 4031110 (SLOHS boys volleyball, archived) plays. But "Broadcast Unavailable" overlay until Erik found the "Available" toggle.
4. Built a full custom catalog around it: `broadcasts.json` + `broadcasts.ts` helpers + `BroadcastCard` / `BroadcastGrid` / `BroadcastEmbed` components + `/watch/[broadcastId]` per-game pages + Decap "Watch — Broadcast Catalog" collection + per-team strip on team pages. All shipped.
5. Hudl Support then handed us an **official `<blueframe-app>` web-component embed** pre-configured to vCloud site 6609 with theme colors *already in SLOTAB gold*. The widget renders the full SLOHS portal — live + upcoming + archived rows, search, section filters — auto-populating from vCloud. Zero ongoing editor work.
6. **Dropped the entire custom catalog.** `/watch` is now the BlueFrame embed wrapped in a dark "broadcast surface" section under a SLOTAB-branded intro strip. Per-team page strips swap to a "Open the Tigers Watch Portal →" CTA. Net 760+ lines of code deleted.

**Open**: portal currently lists 4 archived broadcasts that are in error state (Hudl Support clearing them) and omits recent "Available but not Archived" broadcasts (4031110, the stunt event) — pending the publish-to-viewer workflow answer.

### Public vs No-Scout policy draft (#60)
Drafted for Adam/Phil's review:
- **Public by default (12)**: cross country (b+g), swim & dive (b+g), golf (b+g), tennis (b+g), track-field, sideline cheer, competitive cheer, stunt — measurable individual performance + judged routines have no scout value.
- **No-Scout by default (13)**: football, volleyball (b/g/beach), basketball (b+g), soccer (b+g), water polo (b+g), baseball, softball, flag football — set plays + tendencies legitimately scouted.
- **Borderline (2)**: wrestling (b+g) — default private, easy to open per match.
- All defaults overridable per-broadcast; playoffs may lock normally-public sports.

### Footer ligature fix (#61)
- Manrope ships `(c) → ©`, `(r) → ®`, `(tm) → ™` in its standard `liga` feature (verified by diff-test — `calt`/`clig`/`dlig` alone don't stop it).
- Six places rendering "501©(3)" instead of "501(c)(3)": footer (TigerFooter + legacy Footer), home stats bar, donate form tax-deductible bullet, about page, DonateForm disclaimer.
- Fixed at `.tiger-scope` body level via `font-feature-settings: "liga" 0, "clig" 0, "calt" 0, "dlig" 0`. Negligible visual impact (Manrope's letter ligatures are subtle).

### Doc maintenance handoff (#62)
- Added `CLAUDE.md` at repo root with a `docs/project-status.md` maintenance instruction so future Claude sessions inherit the discipline.

---

## 2026-05-25 session — what shipped

### Photo library — 24 additional curated game photos (#66)

Erik dropped two folders (`SLOHS Sports Photographs-part-{1,2}/`,
1.7 GB combined) into `public/photos/` for filtering — a 180-photo
raw dump from the team photographer. Worked through them
sport-by-sport, prioritizing the photographer's own flagged
variants first: files with `copy`/`5x7`/`8x10`/letter suffixes
are print versions the photographer prepared themselves, so they
tend to be their own picks.

**Final keepers (24)** — all resized via the standard recipe
(`magick … -resize 1200x\> -quality 82 -strip`) and renamed to
the `<b|g|c><sport>-<descriptor>.jpg` convention:

- **Boys basketball (6):** `bbball-shot-394.jpg` (hero — shot
  attempt over PR #11 defender, peak action), `bbball-drive-past.jpg`,
  `bbball-fastbreak.jpg`, `bbball-drive-portrait.jpg`,
  `bbball-huddle.jpg` + `bbball-huddle-bw.jpg` (locker-room
  storytelling shots)
- **Football (5):** `football-helmets-bw.jpg` (B&W team holding
  helmets aloft, stadium light + mountains in BG),
  `football-four-backs-bw.jpg`, `football-team-meeting.jpg`,
  `football-jv-helmets-bw.jpg`, `tigers-mascot.jpg` (studio
  mascot portrait, jersey #61)
- **Boys volleyball (2):** `bvball-net-action.jpg`, `bvball-spike.jpg`
- **Tennis (3):** `btennis-backhand.jpg`, `btennis-serve.jpg`,
  `gtennis-huddle.jpg` (team huddle with mountain BG)
- **Girls soccer (3):** `gsoccer-huddle.jpg`, `gsoccer-celebration.jpg`,
  `gsoccer-keeper-save.jpg`
- **Boys soccer (3):** `bsoccer-huddle.jpg`, `bsoccer-keeper-save.jpg`,
  `bsoccer-dribble.jpg`
- **Cheer + water polo:** `ccheer-team.jpg`,
  `gwpolo-coach-huddle.jpg` (named distinctly from the existing
  `gwpolo-huddle.jpg` in the hero rotation to avoid collision)

Rejected several photographer-flagged shots that had text overlays
baked in ("How About Them Tigers?", "Not in Our House",
"Tiger Nation", "3..2..1.. We have liftoff!") — unusable for the
site without retouching.

### Carousel — boys basketball + girls soccer

`src/app/components/tiger/ClassicHero.tsx` gains slides 7 and 8
for boys basketball (`bbball-shot-394.jpg`, "Boys Basketball ·
attacking the rim") and girls soccer (`gsoccer-huddle.jpg`,
"Girls Soccer · the huddle before kickoff"). Both sports were
absent from the hero rotation despite the broader photo refresh
in #53 and #58 — this fills those slots. Existing 6 slides
untouched. `objectPosition` tuned to keep the focal action
visible against the text overlay (basketball "center 30%" anchors
on the players' faces; soccer "center 45%" balances huddle +
sky). Verified live in the local dev server.

### Originals archive

Both source folders moved into
`public/photos/originals/SLOHS Sports Photographs-part-{1,2}/`
to match the originals-dir pattern from #54. Added a `.gitignore`
rule for those specific subdirs (`/public/photos/originals/SLOHS Sports Photographs-part-*/`)
so the 1.7 GB doesn't track or deploy — the existing 25 small
archival files in `originals/` remain committed as before.

### Coordination notes

This session started against a stale local clone — the working
checkout was 28 commits behind `origin/main`, and what looked
like in-progress untracked photos locally turned out to be files
already shipped on origin (#53/#54/#58). After initial commits
that conflicted on rebase, did a `git reset --hard origin/main`
(tagged the discarded commits as `backup/photos-2026-05-25` for
recovery), backed the 24 new keepers to `/tmp`, and re-applied
the work cleanly against origin's current state. **Lesson:**
fetch + status against `origin/main` early in any session, not
just before push.

---

## Pre-2026-05-11 demo polish (Erik flagged 2026-05-06 evening)

Items to land before the casual board cocktail at the Hub:

- [ ] **Real data on home page calendar** — current section uses 5 hardcoded events (Apr 9, Apr 13, Apr 18, May 4, May 12). Apr/early-May entries are now in the past. Either wire the home calendar to `data/weekly-events.json` + `data/slotab-events.json` (real data, auto-refreshing) or refresh the hardcoded list with future-only events.
- [ ] **Verify weekly events scraper is firing** — the GitHub Actions workflow at `.github/workflows/update-events.yml` schedules Sun 11pm + Mon 6am Pacific + Wed 14:00 UTC scrapes of the SLOHS athletic Google Sheet into `data/weekly-events.json`. The data file last updated 2026-04-23, so the cron may not have run since. Manually triggered 2026-05-06 evening — confirm it commits a refresh.
- [ ] **Purge stale events from the home calendar** — anything before today's date should drop off automatically once the calendar reads from the JSON sources.
- [ ] **Quickie color + font matching pass on inner pages** — `/about`, `/teams`, `/teams/<slug>`, `/watch`, `/hall-of-fame`, `/impact`, `/contact`, `/spring-social`, `/upcoming`, `/season-passes`, `/merch`, `/volunteer`. Don't fully reskin — just retune the legacy `.slotab-scope` typography to match the new Tiger design system (serif headings instead of uppercase Manrope, drop the auto-underline link styling, align colors). New chrome already wraps these pages.
- [ ] **More real data generally** — sponsor URLs (in progress via Decap), real Impact ledger numbers (pending Trina), real team rosters (pending Adam Basch).

---

## 2026-05-06 — Action Items (who owes what)

| Owner | Item |
|---|---|
| **Erik** | Research Square transaction-ID + custom-metadata mechanics; share findings with Trina before committing to Square API vs hosted (#31, Q1) |
| **Erik** | Wire up the architectural changes from the transcript (#26–#42) on the Vercel-hosted preview |
| **Erik** | Preview demo at the casual cocktail board meeting at the Hub on **2026-05-11** |
| **Erik** | Draft `docs/coach-onboarding-slotab-funds.md` — 1-pager on how SLOTAB dollars work for coaches (#44) |
| **Erik** | Draft `docs/treasurer-square-qb.md` — Trina-facing operations doc for the Square→QB sidetool (#46) |
| **Erik** | Survey best-practice membership tier ladders for HS booster orgs; propose a SLOTAB ladder for the wine meeting (#37) |
| **Erik** | Secure Owner-level credentials for both Springly (Serenity) and Hudl (Pro) — both integrations tabled until then (#48) |
| **Board (Trina)** | Email Impact-page ledger data (dollars funded, items purchased, teams/programs) to Erik + team |
| **Board** | Schedule the Deneen + Ann wine meeting (within ~30 days of 2026-05-06) re: membership/sponsorship merge |
| **Board** | Discuss open Phase 0 considerations: sponsorship-bundle splits (e1), in-kind donations (e2), restricted-vs-unrestricted gifts (e4) (#47) |
| **Board** | Email the intern re: Booster Bash ticketing setup; sales launch 2026-07-01 |
| **Board** | Create + share the Events Google Sheet (Adam + Phil + liaisons + board); add 2026-2027 tab + SLOTAB events |
| **Adam Basch** (abasch@slcusd.org) | Volunteered to shepherd team-page templates with coaches during AD-handoff overlap with Phil |

---

## Built (already shipped)

Track removed/completed items here so they don't clutter the active backlog.

- ✅ Refactored 9-page WordPress → Next.js with the original visual language
- ✅ Modernized SLO|TAB masthead + 7-photo carousel + GO TIGERS!
- ✅ 50-logo sponsor wall sourced from JSON (Decap-editable)
- ✅ Hall of Fame page with 46 inductees scraped from school site, filterable by sport
- ✅ Impact ledger with By Year / By Team toggle (DRAFT data)
- ✅ Watch tab with Hudl placeholder grid + live badge support
- ✅ Upcoming events page with weekly-sheet scraper + sport filter
- ✅ Per-team pages: Football, Girls Volleyball, Baseball, Track & Field
- ✅ Standard Comms Kit playbook (internal-only) — Remind + BAND + ParentSquare with opt-out
- ✅ 6-item dropdown nav with persistent gold "Join" button
- ✅ Donate-first hero CTA replacing "Become a Member" + "Sign Up to Volunteer"
- ✅ Sponsor logos optionally clickable (when `website` field set)
- ✅ "Become a Sponsor" expandable + Print Sponsor Sheet button
- ✅ Decap CMS at `/admin` with 10 collections + Editorial Workflow
- ✅ Springly two-way stub (board admin portal + Join form + API routes)
- ✅ Security audit + fixes (CSRF state, SRI, postMessage origin, scraper sanitization)
- ✅ Standalone repo extracted to `~/slotab-website/`
- ✅ Board migration plan (`docs/migration-plan.md`)
- ✅ Decap setup guide (`docs/decap-setup.md`)
- ✅ Team comms kit playbook (`docs/team-comms-kit.md`)
- ❌ Tiger News Network — removed (Hudl is sole video source)
- ❌ NFHS Network placeholder — removed
- ❌ Auto-pulled team-page schedule — removed (schedule lives only on `/upcoming`)
- ❌ "For Players & Parents" team-page comms strip — removed (comms internal-only)
- ❌ "Three Ways to Support" home page cards — replaced by Donate-first hero

---

## Impact rollout plan — per-team thermometer progression

Approved 2026-05-06 as a phased path. Goal: ship a useful general thermometer at go-live, then earn the right to per-team thermometers by getting tracking, workflows, and coach-clarity right first.

### What the plan needs to solve (from the 2026-05-06 working session)

- **(a)** Solid efficient tracking of donation intent (general / sport / big-ticket) so dollars can be matched to budgets
- **(b)** Workflows to support tracking + reporting
- **(c)** Coach clarity — some currently believe they receive zero from SLOTAB
- **(d)** Transparency at the right level — donors see impact, no perception of unfair allocation
- **(e3)** Year-over-year comparison so the Impact page works mid-year ✅ approved
- **(e6)** Coach onboarding 1-pager ✅ approved (#44)
- **Pending board discussion:** (e1) sponsorship-bundle splits · (e2) in-kind donations · (e4) restricted-vs-unrestricted gifts (#47)

### Phase 0 — Foundations (before any thermometer is live)

| Workstream | Solves |
|---|---|
| Donation intent taxonomy: `general` · `sport=<slug>` · `big-ticket=<line-item>` · `sponsorship-bundle=<id>` | (a) |
| Square ↔ QB sidetool: pulls Square, applies tag, exports monthly QB-ready CSV | (a)(b) |
| Transaction-ID schema (e.g. `B-FB-S25` = Big-ticket / Football / Spring 25) | (a)(b) |
| Refund + correction workflow with audit trail in QB | (b) |
| Recurring-donation intent persistence (designation rolls forward each month) | (a)(b) |
| Trina-facing operations doc (#46) | (b) institutional knowledge |
| Coach onboarding 1-pager (#44) — frames the 25% as general fund, not overhead (#43) | (c) |

### Phase 1 — General thermometer (target: 2026-08-01 go-live)

- One thermometer on `/impact` anchored to treasurer's planned-budget figure
- Optional drive breakdown (fall / winter / spring)
- Monthly update cadence + 75% disclaimer
- **Year-end "Totals by Team" table** (no goals — just dollars in / dollars allocated)
- General-fund explainer block (what the 25% covers)
- YoY comparison (#45)

### Phase 2 — Team-level transparency (no goals yet)

- Each team page: "FY raised toward this team · 75% allocated · big-ticket sub-totals"
- **Coach-facing view** (gated): donor list + designation
- Public language emphasizes *what was raised*, not *what was spent on what* — preserves (d)
- Requires Phase 0 reliable for at least one full reporting cycle

### Phase 3 — Per-team thermometers with goals

- Goal-setting playbook: liaison drafts → board reviews → coach validates
- Stretch-goal states (don't stop at 100%)
- Big-ticket items as separate sub-goals
- Carryover policy at fiscal year end

### Phase 4 — Donor recognition + feedback loop

- Anonymous-default toggle on the donate form
- Year-end donor thank-you email tying their gift to outcomes
- Goal-met thank-you flows

---

## How to update this doc

When something lands or a decision is made:

1. **Decision** → append a row to *Decisions Log* with today's date and a one-line summary.
2. **Built / shipped** → move the item from *Active Backlog* to *Built*, prefix with ✅ or ❌.
3. **Blocked or deferred** → mark 🔴 / ⏳ with a one-line reason, leave in *Active Backlog*.
4. **External input received** → strike or remove the row from *External Inputs Pending* and update the relevant data file.
5. **Save & commit** with a short message like `docs: status update — [thing]`.
