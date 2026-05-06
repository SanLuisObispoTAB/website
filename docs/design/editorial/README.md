# Handoff: SLOTAB Modernization — Design B · Editorial Split

## Overview
This package documents **Design B — "Editorial Split"** for the SLO Tiger Athletic Booster Club (SLOTAB) website. The design is magazine-styled and typography-led: an asymmetric hero with oversized serif headline next to a stacked photo collage, a black "scoreboard strip" with live game cards, vertical "three ways" rows with sticky section title, an athlete-spotlight pull-quote spread, a season-grouped teams list, a dark Watch + Events section, a centered impact editorial, sponsors, and a black testimonial CTA. It restores the original site's "SLO | TAB" wordmark banner above the navigation.

The package covers the **homepage** plus the full **inner-page IA** (Teams index, Team Detail, Membership, Events, Watch, Hall of Fame, Impact, About). All inner pages are shared with Design A — the variation is on the homepage only.

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look and behavior, not production code to ship as-is. They use Babel-transformed JSX loaded directly in the browser via `<script type="text/babel">`, which is intentional for fast iteration but not appropriate for production.

Your job is to **recreate these designs in the target codebase** using its existing framework, build pipeline, and component conventions. Treat the JSX in `home-broadcast.jsx` and `design-system.jsx` as source-of-truth for layout, spacing, typography, and copy — but rewrite the components properly (named exports, real CSS or CSS-in-JS, asset pipeline, routing, etc.) for whatever stack the booster site is being rebuilt in (e.g. Next.js, Astro, plain HTML/CSS, WordPress block theme, etc.).

If no environment is in place yet, **Astro or Next.js with static output** is recommended — the site is content-led and largely static, with one dynamic surface (the live scoreboard / Watch tile) that can be polled.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and photography are all final. Recreate pixel-perfectly. The only thing that should change in implementation is real data wiring (events, scores, sponsors, team rosters) replacing the placeholder content.

## How to Preview
Open `preview.html` in a local web server (e.g. `npx serve .` from this folder) — opening it via `file://` will not work because the JSX scripts are loaded as separate files. The preview shows the homepage with full in-page navigation to all inner pages.

---

## Site-Wide Chrome (every page)

Three stacked elements at the top of every page, in this order:

### 1. SLO | TAB Wordmark Banner
Pulled from the original site, restored across the new design.
- **Background:** `#0a0a0a` (TIGER.black)
- **Bottom border:** `3px solid #f5b800` (school gold)
- **Layout:** centered column, `padding: 22px 32px`
- **Wordmark row:** `inline-flex`, `gap: 24px`, `align-items: center`
  - "SLO" — Source Serif 4, weight 800, **56px**, letter-spacing `0.08em`, color `#ffffff`, line-height 1
  - Vertical divider — `2px × 44px`, `background: #f5b800`
  - "TAB" — same font/size/weight, color `#f5b800`
- **Tagline row** (below wordmark, `gap: 10px` from wordmark):
  - JetBrains Mono, **12px**, letter-spacing `0.22em`, uppercase, color `#fbf7ec`
  - Format: `San Luis Obispo  •  Tiger Athletic Boosters`
  - Separator dot: 5×5px circle, `#f5b800`, `gap: 12px` between elements
- **Behavior:** entire banner is an `<a>` linking to home.

### 2. TopBar (score ticker / marquee)
- **Background:** `#0a0a0a`, **bottom border:** `2px solid #f5b800`
- **Type:** JetBrains Mono, **11px**, letter-spacing `0.08em`, uppercase, color `#fbf7ec`
- Items: infinite-scroll marquee (`marquee 40s linear infinite`, pauses on hover), each item `inline-flex; gap: 10px; padding: 0 24px; border-right: 1px solid #333`
- **Item shape:** optional orange tag + text + optional orange score
- Items duplicated 3× for seamless loop.

### 3. Nav (sticky, glassy)
Same as Design A. See `design-system.jsx` `Nav` component:
- `position: sticky; top: 0; z-index: 100`, glassy bg `rgba(250,246,238,0.92)` + `backdrop-filter: blur(12px)`
- 1440px max container, 14px/40px padding
- Brand (logo + "SLOTAB"/"Tiger Athletic Boosters" two-line)
- Nav items: Home, About▼, Get Involved▼, Events, Teams▼, Watch, Hall of Fame
- Donate button right edge — use **medium / btn-dark** in production (black bg, gold text)

### Footer
Same shared footer as Design A — black, four columns inside max-width 1440 container, `Est. 1894 · San Luis Obispo` mono caps, copyright row.

---

## Homepage Sections (in order)

### A. Hero — Asymmetric editorial split
- **Padding:** `40px 0 0`, background `var(--bg)` (cream)
- **Grid:** `1.1fr 1fr`, gap 56, align-items stretch, inside `max-width: 1440px; padding: 0 40px`
- **Left column** (`paddingTop: 40; paddingBottom: 60`):
  - Eyebrow: `— SAN LUIS OBISPO HIGH · EST. 1894` — JetBrains Mono 11px caps letter-spacing 0.2em, color `#f5b800`, marginBottom 28
  - Headline: **"For the / love of / *the Tigers.*"** — Source Serif 4, **156px**, weight 800, line-height 0.88, letter-spacing `-0.03em`, with line-breaks shown above; "the Tigers." italicized in `#f5b800`
  - Sub-copy: "The SLO Tiger Athletic Booster Club has supported every CIF-sanctioned team and cheer squad at SLOHS since 1958. Parents, alumni, and neighbors keeping Tiger athletics — and Tiger excellence — strong." — 19px line-height 1.55, max-width 520, color graphite, marginTop 36
  - Buttons (marginTop 40, gap 14): primary "Become a Member" (orange + arrow) + ghost "See Our Impact"
- **Right column** (`position: relative; min-height: 720px`) — three layered absolute elements:
  - **Big photo top:** `position: absolute; top: 0; right: 0; width: 100%; height: 70%`, black bg, image `assets/photos/tunnel-runout.jpg` cover with `filter: contrast(1.05) saturate(1.05)`
  - **Smaller offset photo bottom-left:** `position: absolute; bottom: 0; left: 0; width: 60%; height: 45%`, `border: 8px solid #fbf7ec` (cream — reads as a paper bezel), image `assets/photos/water-polo-huddle.jpg` cover
  - **NOW callout** (bottom-right of right column, `position: absolute; bottom: 24; right: 24; max-width: 260; padding: 20px 24px`): glassy black `rgba(13,13,13,0.92)` + `backdrop-filter: blur(10px)`, white text. "NOW" in mono caps gold, then "Spring sports in full swing — 11 teams competing this season." 15px weight 700.

### B. Scoreboard Strip
- **Background:** `#0a0a0a`, color white, `padding: 32px 0`, `border-top: 2px solid #f5b800`
- Header row inside 1440 container: `— SCOREBOARD` eyebrow gold, hairline rule `flex: 1` color `#2a2a2a`, "ALL RESULTS →" link mono silver 11px
- **Grid:** `repeat(4, 1fr)`, gap 1px, wrapper bg `#222` (so gaps read as dividers); each cell bg `#0a0a0a`, padding `22px 24px`
- **Cell layout:**
  - Top row: sport name in mono silver 10px caps + status (right-aligned) — "FINAL" in orange, "LIVE Q3" in red `#e63946` with pulsing red dot prefix
  - Middle row: school code (e.g. "SLO") in Source Serif 4 weight 700 20px + score in 32px Source Serif 4 (orange when win, white otherwise)
  - Opponent row: opponent code 16px serif + their score 24px serif, opacity 0.7
- **Sample data:**
  - BASEBALL · FINAL · SLO 7, ATS 4 (win)
  - GIRLS V-BALL · FINAL · SLO 3, RGT 1 (win)
  - TRACK & FIELD · MT. SAC · SLO 3rd
  - GIRLS WP · LIVE Q3 · SLO 8, AG 6 (live, red pulsing)

### C. Three Ways — vertical with big numbers
- **Padding:** `120px 0`, bg cream
- **Grid:** `0.9fr 2fr`, gap 80
- **Left column** (sticky `top: 100; align-self: flex-start`):
  - Eyebrow "How You Can Help"
  - Title: "Three ways / to *support.*" — 56px Source Serif 4, "support." italic gold
  - Paragraph: "Choose the lane that fits — every contribution funds Tiger athletics directly." 16px line-height 1.65 graphite
- **Right column** — three rows, each a `120px 1fr 200px` grid with `gap: 32`, `padding: 36px 0`, hairline `border-top: 1px solid var(--bone)` (and bottom on the last row):
  - **Number cell:** "01" / "02" / "03" — Source Serif 4 56px gold line-height 1
  - **Body cell:** title (30px Source Serif 4) + body (15px line-height 1.6 graphite) + ulink ("See membership levels →" / "Business sponsorship" / "Volunteer opportunities")
  - **Right cell** (text-align right): "STARTING" mono caps pewter, then amount in 24px Source Serif 4 (`From $50` / `$500–$10,000` / `2 hrs / season`)
- Body copy is the same as Design A but slightly longer per-row.

### D. Athlete Spotlight — Magazine spread
- **Background:** `var(--paper)` (`#f3ecda`)
- Inner: `max-width: 1440; padding: 120px 40px`, two-column grid 1fr 1fr, gap 0
- **Left column** (`padding-right: 60`):
  - Eyebrow "Athlete Spotlight · Spring 2026"
  - Headline (pull quote): `"The boosters bought us our travel uniforms — now we're going to *state.*"` — 64px Source Serif 4, line-height 0.95, "state." italic gold
  - Author block: 56×56 round avatar (`assets/photos/basketball-girls.jpg`, object-position `center 20%`) + name "Bailey Hartford" 16px weight 700 + role "SENIOR CAPTAIN · GIRLS TRACK" mono 11px caps
  - Body paragraph: "Bailey is one of three Tigers headed to CIF State Championships this May. Booster funds covered uniforms, hotels, and registration for the entire travel squad — no athlete left behind for cost." 16px line-height 1.7
  - Ulink "Read the full impact report →"
- **Right column:** `<PhotoCaption>` with `assets/photos/student-section.jpg`, height 620, caption "Body-paint section · GO TIGERS", credit "© SLOTAB 2026"

### E. Teams — list view, season-grouped
- **Padding:** `120px 0`, bg cream
- Header row: SectionHead "22 Teams · Three Seasons / The pride, by team." (left), "All teams →" ulink (right)
- **Grid:** `1fr 1fr 1fr`, gap 48 — three season columns
- Each column header: season name "Fall" / "Winter" / "Spring" in Source Serif 4 26px, with team count (mono 11px caps pewter "X TEAMS") on right; underlined by `border-bottom: 2px solid #0a0a0a`, paddingBottom 12
- Team list: `<ul>`, items styled as `padding: 14px 0; border-bottom: 1px solid var(--bone)`, 16px text + arrow on right (pewter)
- Teams enumerated by season (see source for full list — Fall 6 / Winter 7 / Spring 9)

### F. Watch + Events combo (dark)
- **Padding:** `120px 0`, bg `#0a0a0a` color cream
- **Grid:** `1.4fr 1fr`, gap 60
- **Left — Watch:**
  - Eyebrow "Watch the Tigers" + 56px white title "Live & on-demand."
  - Paragraph: "SLOHS streams home games from Holt Field and the Big Gym. Catch a game live or watch the replay on Hudl and the Tiger News Network." 16px silver max-width 480
  - Featured tile (height 380, marginTop 32): `assets/photos/volleyball-set.jpg` opacity 0.65, gradient overlay, top-left LIVE badge (red bg pulsing dot), bottom: orange mono "BEACH VOLLEYBALL", title "Girls Beach Volleyball vs Morro Bay" 36px Source Serif 4, "STREAMING NOW · 1,247 WATCHING" mono 11px
- **Right — Upcoming:**
  - Eyebrow "Upcoming" + 36px white "This week."
  - List of 5 events, each row `60px 1fr` grid: date in orange mono 12px + title (15px white weight 600) + meta (12px silver). Hairline `border-bottom: 1px solid #2a2a2a`.
  - "Full Calendar" btn-primary at bottom

### G. Impact — Centered editorial
- **Padding:** `120px 0`, bg paper
- Centered max-width 1100, padding 0 40, text-align center
- Eyebrow "2024–25 Impact"
- Headline: "*$116,800* / back to the Tigers." — **88px** Source Serif 4, line-height 0.95, dollar amount italic gold
- Sub: "Across 22 CIF-sanctioned teams and cheer squads. Every dollar accounted for, every purchase documented." 17px max-width 620 graphite
- **Stats grid** (marginTop 60, `repeat(4, 1fr)`, gap 32, text-align left):
  - 1,847 / Pieces of equipment
  - 64 / Tournament trips funded
  - 12 / Facility upgrades
  - 600+ / Athletes supported
  - Each cell has `border-top: 2px solid #f5b800`, paddingTop 18; number 44px Source Serif 4; label 13px graphite
- "Read the Full Report" btn-dark, marginTop 56

### H. Sponsors
- **Padding:** `100px 0`, bg cream
- Header row: SectionHead "Powered By Local / Our 2025–26 sponsors." left, "Become a Sponsor" btn-primary right
- `<SponsorWall mode="compact" onDark={false}/>` (light variant)
- Bottom centered link "SEE ALL 60 SPONSORS →" gold mono caps 12px

### I. Final CTA — Black testimonial split
- **Padding:** `140px 0`, bg `#0a0a0a` color white
- **Grid:** `1fr 1fr`, gap 80, align-items center
- **Left column:**
  - Eyebrow "— JOIN THE PRIDE" (mono gold)
  - Headline: "*Be* a booster." — **96px** Source Serif 4 line-height 0.95, "Be" italic gold
  - Paragraph: "Memberships start at $50. 100% of every dollar goes to SLOHS student-athletes. Tax-deductible — EIN 45-4897120." 18px silver max-width 480
  - Buttons: btn-primary "Become a Member" + ghost "Contact the Board" (white)
- **Right column** — testimonial card with `border-left: 2px solid #f5b800; padding-left: 32`:
  - Quote: `"Tiger athletics shaped me as much as anything else at SLOHS. I'm a booster because I want every kid to have what we had."` — 32px Source Serif 4 italic line-height 1.35
  - Author block: 48×48 round avatar (`assets/photos/water-polo-boys-2.jpg`) + name "Dr. Robert Teitge" 14px weight 700 + role "SLOHS '78 · BOARD MEMBER" mono 11px silver caps

---

## Inner Pages
All inner pages share the same Banner + TopBar + Nav + Footer chrome. Page-specific bodies live in `pages.jsx`. Each is a single component with the layout fully spelled out:

- **TeamsPage** — index of all 22 teams, season filter pills, team cards
- **TeamDetailPage** — single-team layout (Football example): photo masthead, schedule rail, roster grid, coaching staff
- **MembershipPage** — tier comparison (Family / Booster / Champion / Hall of Fame) + Sponsor tiers (Platinum/Gold/Silver/Bronze)
- **EventsPage** — calendar list + featured Spring Social hero
- **WatchPage** — Hudl-embedded grid, live + replays
- **HallPage** — searchable inductee gallery
- **ImpactPage** — annual report with charts and dollar breakdown
- **AboutPage** — board portraits, mission, contact form

---

## Design Tokens

### Colors
| Token | Hex | Notes |
|---|---|---|
| `TIGER.orange` / `--orange` | `#f5b800` | **NB:** named "orange" for legacy reasons but the value is school **gold**. Treat this as the brand primary accent and rename in production. |
| `TIGER.orangeDeep` / `--orange-deep` | `#c89400` | Hover/pressed |
| `TIGER.orangeLight` | `#ffd34d` | |
| `TIGER.gold` | `#f5b800` | Same value as orange |
| `TIGER.black` / `--black` | `#0a0a0a` | Brand black |
| `TIGER.ink` / `--ink` | `#161616` | Body copy |
| `TIGER.cream` / `--bg` | `#fbf7ec` | Page background (warm) |
| `TIGER.paper` / `--paper` | `#f3ecda` | Alt section bg |
| `TIGER.bone` / `--bone` | `#e9e0c8` | Hairlines |
| `TIGER.charcoal` / `--charcoal` | `#1f1f1f` | |
| `TIGER.graphite` / `--graphite` | `#454340` | Secondary text |
| `TIGER.pewter` / `--pewter` | `#76736b` | Tertiary text |
| `TIGER.silver` / `--silver` | `#b3ada0` | |
| `LIVE red` | `#e63946` | Used only for LIVE badges/pulsing dots |

### Typography
- **Display serif:** Source Serif 4 (Google Fonts). Used for all headlines via `.display` class (weight 800, letter-spacing -0.02em, line-height 0.95, `text-wrap: balance`). Italic available — heavily used for accent words ("the Tigers.", "support.", "Be", "state.").
- **Sans:** Manrope (Google Fonts). Body copy and UI.
- **Mono:** JetBrains Mono (Google Fonts). Eyebrows, tags, scores, captions.

Type scale used:
- Display 156 (hero) / 96 (final CTA) / 88 / 64 / 56 / 44 / 36 / 32 / 30 / 26 / 24 / 20
- Body 19 (hero sub) / 18 / 17 / 16 / 15 / 14 / 13
- Mono 12 / 11 / 10 (eyebrows, tags, scores)

### Spacing
- Section padding: **120px** vertical (140px on the closing CTA, 100px on sponsor section, 32px on Scoreboard strip)
- Container: `max-width: 1440px; padding: 0 40px`
- Grid gaps: 1px (divider trick) / 16 / 32 / 48 / 56 / 60 / 80

### Borders & Radius
- **All squared.** `border-radius: 0` everywhere except the circular logo and round avatars.
- Hairline: `1px solid var(--bone)` light / `1px solid #2a2a2a` on dark
- Brand accent border: `2px solid #f5b800` (or 3px on banner)
- Photo "paper bezel" trick: `border: 8px solid #fbf7ec` on the offset hero photo

### Motion
- Card lift: `transform .25s ease`, `translateY(-3px)` on hover
- Button hover: `translateY(-1px)` `.15s`
- Marquee: 40s linear infinite, pauses on hover
- LIVE pulse: dot `animation: pulse 1.5s infinite`

---

## Components Inventory

In `design-system.jsx`:
- `TIGER`, `GlobalStyles`, `Logo`, `PawMark`, `Chevron`, `SectionHead`
- `SiteBanner({ onNavigate })` — **the SLO | TAB wordmark banner** (top of every page)
- `TopBar({ items })`, `Nav({ current, onNavigate, donateProminence, solid })`, `Footer({ onNavigate })`
- `PhotoCaption({ src, caption, credit, height })` — used in Athlete Spotlight
- Button classes: `.btn`, `.btn-primary`, `.btn-dark`, `.btn-ghost`, `.btn-arrow`
- `.tag`, `.tag-orange`, `.tag-dark`, `.eyebrow`, `.ulink`, `.display`, `.mono`, `.serif`

In `home-broadcast.jsx`:
- `HomeBroadcast({ onNavigate, donateProminence })` — full homepage (Design B)

In `pages.jsx`:
- All inner pages (shared with Design A)

In `sponsor-wall.jsx`:
- `SponsorWall({ mode, onDark })` — `onDark={false}` is used on this design's sponsor section (vs `onDark={true}` on Design A's)

---

## Assets
All assets live in `assets/`:
- `assets/logo.png` — SLOTAB Tiger Athletic Booster Club roundel
- `assets/logos/` — additional lockups
- `assets/photos/` — full library; this design specifically uses `tunnel-runout.jpg`, `water-polo-huddle.jpg`, `student-section.jpg`, `basketball-girls.jpg`, `volleyball-set.jpg`, `water-polo-boys-2.jpg`
- `assets/sponsors/` — sponsor logos for `SponsorWall`

Photography tone: warm, contrast-pushed, slightly saturated. The `contrast(1.05) saturate(1.05)` filter is applied at runtime in the design — production should bake this look into source images where possible.

---

## Data / Content the Developer Will Need to Wire
- **Score ticker items** (TopBar) — recent results, upcoming games
- **Hero NOW callout** — short editorial line, refreshed seasonally
- **Scoreboard strip** — last 4 games incl. one live game (poll an API or Hudl feed)
- **Athlete Spotlight** — quote, name, role, photo — refreshed weekly/monthly
- **Teams list** — all 22 teams grouped by season
- **Watch tile** — live game (Hudl), with viewer count
- **Upcoming events** — next 5 events
- **Impact stats** — annual numbers
- **Sponsors** — tiered list
- **Final-CTA testimonial** — quote, author, photo

---

## Files in This Bundle
- `preview.html` — runnable preview (open via local web server)
- `design-system.jsx` — tokens, GlobalStyles, SiteBanner, TopBar, Nav, Footer, primitives
- `home-broadcast.jsx` — homepage layout (Design B)
- `pages.jsx` — all inner-page layouts
- `sponsor-wall.jsx` — sponsor tier component
- `assets/` — photography, logos, sponsor files

## Implementation Checklist
1. Pick framework (Next.js / Astro recommended).
2. Port `TIGER` tokens (rename `orange` → `gold` since the value is school gold).
3. Set up Source Serif 4 + Manrope + JetBrains Mono via `next/font` or equivalent.
4. Build `SiteBanner`, `TopBar`, `Nav`, `Footer` as your shared layout shell.
5. Build the homepage section-by-section. Pay special attention to:
   - The asymmetric hero: three layered absolute-positioned elements inside a `position: relative; min-height: 720px` right column
   - The scoreboard strip's "1px gap on `#222` wrapper" divider trick
   - The sticky `top: 100` left column on the "Three Ways" section
6. Build inner pages from `pages.jsx`.
7. Wire data sources: scoreboard API/Hudl, events CMS, sponsors CMS, athlete spotlight CMS.
8. QA against `preview.html`.
