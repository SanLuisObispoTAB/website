# SLOTAB Website — Project Status & Backlog

A living document the board updates between sessions to keep
decisions, pending work, and external inputs in one place.

> **Last updated:** 2026-04-23 *(board meeting decisions captured)*
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
| 2026-04-23 | 7 | **Hudl integration**: awaiting API key | Board ⏳ |
| 2026-04-23 | 8 | **Springly integration**: awaiting API key | Board ⏳ |
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

---

## Current Build State

### Live preview URLs

- **Production-track Vercel URL**: <https://slo-tab-website.vercel.app> — auto-deploys from <https://github.com/eramberg/slo-tab-website> on push to `main`. Currently noindexed; this is the URL `slotab.org` will eventually point at.
- **Board review URL** (deprecated path, kept until cutover): <https://www.ravens-peak-consulting.com/slotab-preview> — mirror in the Raven's Peak repo

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

- [ ] **Decide Square API vs hosted site** — needed before I can prototype
- [ ] Multi-sport selection (currently one-at-a-time on `slotab-3.square.site/#YtTGmq`)
- [ ] Tier buttons: $25 / $50 / $100 / $200 + custom amount field
- [ ] Monthly recurring option
- [ ] Transaction ID with sport tags + one-time/recurring marker for QuickBooks reconciliation
- [ ] Show 75% team / 25% SLOTAB allocation at point of donation

### Sponsors

- [x] Sponsor logos clickable when `website` field is set ✅
- [x] "Become a Sponsor" expandable above the wall ✅
- [x] Print sponsor sheet button ✅
- [ ] **Highest-tier (Platinum) sponsor rotator on home page**
- [ ] Populate real `website` URLs for each sponsor (~50 sponsors)

### Impact page

- [ ] Goal thermometer per team (visible progress to a fundraising goal)
- [ ] Per-trimester campaign goal (one overall goal per trimester)
- [ ] Filter to **large purchases only**; broad-impact framing for shared items (e.g. scoreboard helps N teams)
- [ ] Monthly auto-update workflow + "donations are bundled and the page updates around the 1st of each month" messaging
- [ ] Replace the 24 placeholder line items with real ledger data
- [ ] Remove the DRAFT watermark + red ribbon when real data lands

### Membership

- [ ] **Donation → tier auto-assignment** (simpler "everyone becomes a member when they donate" flow — pending board decision)
- [ ] Real "Join Online" form (live Springly when API key arrives)

### Teams

- [ ] Real rosters from each coach/liaison (currently 12-player placeholder per team)
- [ ] Real wishlist line items per team (currently plausible placeholders)
- [ ] Real photos (placeholder hero on T&F is the tennis photo)
- [ ] Real liaisons per team (currently "Liaison TBD")
- [ ] Coach bios (school site has name + email only)
- [ ] Build out the other 23 team pages once they have content
- [ ] Update the Standard Comms Kit doc with the link-to-schedule pattern instead of in-kit duplication

### Hall of Fame

- [ ] Real induction ceremony date + venue
- [ ] Real **Booster Bash Tickets** + **HOF Fund Donate** URLs (currently `#`)
- [ ] Real committee roster
- [ ] Alumni Membership tier — pricing + benefits + join URL

### Watch (Hudl)

- [ ] Real Hudl game data (auto-scrape via API once key arrives)
- [ ] Per-game iframe embeds (replace link-out cards on paid Hudl)
- [ ] Live-badge pipeline that flips when a stream is live

### Springly

- [ ] Add `SPRINGLY_API_BASE` + `SPRINGLY_API_KEY` env vars on Vercel
- [ ] Confirm the Springly REST endpoint path (currently guessed `/contacts`)
- [ ] Swap admin-portal page from static JSON to live fetch

### Deploy / GitHub

- [x] Push `slotab-website` to a new GitHub repo ✅ — <https://github.com/eramberg/slo-tab-website>
- [ ] Connect to Vercel as its own project
- [ ] Update Decap config `repo` field to the new org/repo path
- [ ] Update GitHub OAuth App callback URL to the new deploy URL
- [ ] Add `DECAP_GITHUB_CLIENT_ID` + `DECAP_GITHUB_CLIENT_SECRET` env vars
- [ ] Designate the 2–3 board editors and grant Write access on the new repo
- [ ] DNS: point `slotab.org` at the Vercel project (cutover)
- [ ] Drop `robots: noindex` from `src/app/layout.tsx` at cutover
- [ ] Cancel the GoDaddy Managed WordPress plan 48 hours after cutover

---

## Pending Snapshot — 2026-04-23

Cross-cut of everything still pending, grouped by blocker. Detailed
versions of each row appear in *Active Backlog*, *Open Questions*,
and *External Inputs Pending* below — this section is the at-a-glance
view to skim before each session.

### Pending the transcript (6)

Items likely to surface context the typed notes don't fully cover.

| # | Item | Why deferred |
|---|---|---|
| T1 | **Square donate page rebuild** — multi-sport multi-select, $25/$50/$100/$200 + custom, monthly recurring, transaction-ID strategy for QuickBooks reconciliation, "75% team / 25% SLOTAB" framing at point of donation | Need to hear the full QB-reconciliation pain discussion |
| T2 | **Square API vs. hosted-site decision** | Architectural decision that gates T1 |
| T3 | **Impact page rebuild** — per-team goal thermometers, per-trimester campaign goal, large-purchases-only filter, monthly bundled-update cadence + messaging | Goal source, trimester definition, "large" threshold likely discussed |
| T4 | **Membership tier auto-assignment from donation amount** | The simplified "everyone becomes a member when they donate" flow |
| T5 | **Highest-tier sponsor home-page rotator** | Mechanics (auto-rotate? click? how many?) |
| T6 | Anything else mentioned but not in the notes | Open-ended |

### Pending board decisions (7)

| # | Decision needed | Unblocks |
|---|---|---|
| Q1 | **Square API vs. hosted Square site** | T1, T2 |
| ~~Q2~~ | ~~GitHub org name~~ ✅ — repo is at `eramberg/slo-tab-website` (transfer to org later if desired) | — |
| Q3 | **Donation-to-tier mapping** ($X → Friend, $Y → Bronze, etc.) | T4 |
| Q4 | **Per-team fundraising goal source** (board sets centrally vs. liaisons set their own) | T3 |
| Q5 | **Per-trimester campaign goal source** (treasurer's planned-budget number vs. board-set rallying number) | T3 |
| Q6 | **Standard Comms Kit defaults** post-#10 evolution | Internal kit playbook update |
| Q7 | **Real Impact ledger data** | Removes draft watermark from `/impact` |

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
| G4 | GitHub OAuth App + `DECAP_GITHUB_CLIENT_ID` / `DECAP_GITHUB_CLIENT_SECRET` env vars | Now unblocked |
| G5 | DNS cutover — `slotab.org` → new Vercel project | After G3 live |
| G6 | Drop `robots: noindex` from `src/app/layout.tsx` | At cutover |
| G7 | Cancel GoDaddy Managed WordPress | 48 hours after G5 |

### Highest-leverage unblockers

The transcript and the two API keys (E1, E3) release the most:
- Transcript → T1, T2, T3, T4, T5
- Hudl API key → E1, E2, real Watch tab
- Springly API key → E3, live Join form, admin portal

**Total open**: 6 transcript-blocked · 6 board-blocked · 15 external-blocked · 4 deploy-blocked

---

## Open Questions (waiting on a decision)

| # | Question | Notes |
|---|---|---|
| Q1 | Square API vs hosted Square site? | API gives QuickBooks-friendly transaction metadata; hosted is zero-maintenance. Decision needed before donate rebuild. |
| ~~Q2~~ | ~~New GitHub org name?~~ — repo is at `eramberg/slo-tab-website` ✅ | Resolved 2026-04-23 |
| Q3 | Donation→tier mapping | E.g. "$0–249 → Friend, $250–499 → Bronze member, $500–999 → Silver, …" — board considering. |
| Q4 | Per-team fundraising goals | Where do they come from? Board sets centrally vs. each team liaison sets their own? |
| Q5 | Per-trimester campaign goal source | Treasurer's planned-budget figure vs. a board-set rallying number? |

---

## External Inputs Pending

| Item | Owner | Notes |
|---|---|---|
| ~~GitHub org name~~ | ~~Board~~ | ✅ Resolved — repo at `eramberg/slo-tab-website` |
| **2–3 board editor GitHub usernames** | Board | Get Write access on the new repo for Decap CMS commits |
| **Real Impact ledger data** | Treasurer | Fill `data/impact.json`; remove draft watermark |
| **HOF ceremony date + venue** | HOF Committee | Update `data/hof.json` |
| **HOF Booster Bash Tickets URL** | Board | Replace `#` in `data/hof.json` |
| **HOF Fund Donate URL** | Board | Replace `#` in `data/hof.json` |
| **HOF Committee roster** | HOF Committee | Replace placeholder in `data/hof.json` |
| **Alumni Membership pricing + join URL** | Board | Update `data/hof.json.alumniMembership` |
| **Real per-team rosters** | Team coaches/liaisons | Replace placeholder in `data/teams/<slug>.json` |
| **Real per-team wishlists** | Team coaches/liaisons | Same files |
| **Real liaison names + emails per team** | Board | Sourced from comms kit; surfaced on team pages |
| **Sport / game photos** | Board / parents | At minimum: real T&F hero, one game shot per team |
| **Hudl API key** | Board / Hudl admin | Drives auto-population of `data/hudl.json` |
| **Sample Hudl per-game embed URL** | Board / Hudl admin | Confirms iframe format for paid plans |
| **Springly API base URL** | Board / Springly admin | `SPRINGLY_API_BASE` env var |
| **Springly API key** | Board / Springly admin | `SPRINGLY_API_SECRET` env var |
| **Sponsor websites** | Sponsorship Development | Add `website` field for each sponsor in `data/sponsors.json` to make logos clickable |

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

## How to update this doc

When something lands or a decision is made:

1. **Decision** → append a row to *Decisions Log* with today's date and a one-line summary.
2. **Built / shipped** → move the item from *Active Backlog* to *Built*, prefix with ✅ or ❌.
3. **Blocked or deferred** → mark 🔴 / ⏳ with a one-line reason, leave in *Active Backlog*.
4. **External input received** → strike or remove the row from *External Inputs Pending* and update the relevant data file.
5. **Save & commit** with a short message like `docs: status update — [thing]`.
