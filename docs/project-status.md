# SLOTAB Website — Project Status & Backlog

A living document the board updates between sessions to keep
decisions, pending work, and external inputs in one place.

> **Last updated:** 2026-05-07 *(mobile pass + Raven's Peak custom domain)*
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
| 2026-05-06 | 48 | **Springly + Hudl integrations TABLED** until access is sorted. **Springly** (Serenity tier): no Integrations tab visible at admin level — Owner role almost certainly required, OR API access may be a paid add-on Serenity doesn't include; pending support reply. **Hudl** (Pro tier): no self-service developer portal — `developer.hudl.com` routes back to the regular admin console. API access is gated through Hudl's Partner Program (broadcast/stat partners), not exposed to individual schools. Erik to email Hudl support 2026-05-07 asking whether Pro includes any API or if a Partner agreement is required for a single-org public-data integration. Plan B options (Zapier for Springly; manual `data/hudl.json` updates via Decap) remain in place. | Erik 🔴 |
| 2026-05-06 | 49 | **Membership Join form folded into the Donate flow** (philosophy from #37 made concrete). The standalone `/membership` "Join Online" form is gone; `/donate` now captures donor identity (Name, Email, Phone, Display-on-Wall checkbox). Submit alert shows membership tier enrollment alongside the donation. Once Springly creds land, one combined POST creates the contact record + donation in a single round-trip. | Erik ✅ |
| 2026-05-06 | 50 | **Nav top-right CTA: Donate → Join** (links to `/membership`). Reverses an earlier swap (#27) — having two Donate CTAs in the same fold (nav + hero) was redundant. Hero keeps the primary "Donate Now" button | Erik ✅ |
| 2026-05-07 | 51 | **Custom domain `slotab.ravens-peak-consulting.com`** added (CNAME → Vercel) so the SLOHS district firewall (which blocks `*.vercel.app`) can reach the preview. Aliased to the `slo-tab-website` Vercel project's production deployment, no code changes needed. Domain pulls Let's Encrypt cert automatically. The old `ravens-peak-consulting.com/slotab-preview` mirror path is now obsolete — this aliases the live build instead of mirroring it into the Raven's Peak repo | Erik ✅ |
| 2026-05-07 | 52 | **Mobile responsive pass**. The 2026-05-06 rebuild was tuned for desktop and read poorly on phones. Added two breakpoint tiers (480px phone + 720px tablet) covering masthead wordmark, hero (edge-to-edge photo, drop the desktop side mask), stats grid (stays 2×2), sponsor wall (force 2-up across all tiers), watch feature (smaller, stronger blackout, title text-shadow), and impact card (full-width, shorter photo). Required re-asserting `.tiger-scope` (0,2,0) overrides for headlines and watch-feature title to beat unscoped late rules in tiger.css | Erik ✅ |

---

## Current Build State

### Live preview URLs

- **Production-track Vercel URL**: <https://slo-tab-website.vercel.app> — auto-deploys from <https://github.com/eramberg/slo-tab-website> on push to `main`. Currently noindexed; this is the URL `slotab.org` will eventually point at.
- **SLOHS-firewall-friendly URL**: <https://slotab.ravens-peak-consulting.com> — CNAME alias of the same Vercel deployment (#51). Use this when sending the preview to anyone on the school district network — `*.vercel.app` is firewalled.
- ❌ **`ravens-peak-consulting.com/slotab-preview`** — abandoned 2026-05-07 (#51). The mirror in the Raven's Peak repo is months out of date and no longer maintained; the CNAME alias supersedes it.

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
- [ ] Real photos (placeholder hero on T&F is the tennis photo)
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
- [ ] 🔴 Bulk-import existing membership data (Google Docs) into Springly once creds land

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
| E13 | Sport / game photos | Board / parents | Real T&F hero + one game shot per team minimum |
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
| **Sport / game photos** | Board / parents | At minimum: real T&F hero, one game shot per team |
| 🔴 **Owner-level Hudl Pro credentials** | Erik (#48) | Pro tier confirmed; OAuth client_id/secret via developer.hudl.com requires Owner-role login. *Tabled 2026-05-06* until secured |
| 🔴 **Sample Hudl per-game embed URL** | Erik (#48) | Confirms iframe format. Tabled with above |
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
