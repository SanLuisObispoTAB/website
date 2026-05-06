# Handoff: SLOTAB Modernization — Design A · Classic Collegiate

## Overview
This package documents **Design A — "Classic Collegiate"** for the SLO Tiger Athletic Booster Club (SLOTAB) website. The design is editorial and photo-led: a full-bleed image hero with rotating photography, a black stat strip, magazine-style sections, and a closing gold "join the pride" CTA. It restores the original site's "SLO | TAB" wordmark banner above the navigation while modernizing every screen below it.

The package covers the **homepage** plus the full **inner-page IA** (Teams index, Team Detail, Membership, Events, Watch, Hall of Fame, Impact, About).

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look and behavior, not production code to ship as-is. They use Babel-transformed JSX loaded directly in the browser via `<script type="text/babel">`, which is intentional for fast iteration but not appropriate for production.

Your job is to **recreate these designs in the target codebase** using its existing framework, build pipeline, and component conventions. Treat the JSX in `home-classic.jsx` and `design-system.jsx` as source-of-truth for layout, spacing, typography, and copy — but rewrite the components properly (named exports, real CSS or CSS-in-JS, asset pipeline, routing, etc.) for whatever stack the booster site is being rebuilt in (e.g. Next.js, Astro, plain HTML/CSS, WordPress block theme, etc.).

If no environment is in place yet, **Astro or Next.js with static output** is recommended — the site is content-led and largely static.

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
- **Bottom border:** `3px solid #f5b800` (TIGER.gold/orange — see Tokens below for the var-name caveat)
- **Layout:** centered column, `padding: 22px 32px`
- **Wordmark row:** `inline-flex`, `gap: 24px`, `align-items: center`
  - "SLO" — Source Serif 4, weight 800, **56px**, letter-spacing `0.08em`, color `#ffffff`, line-height 1
  - Vertical divider — `2px × 44px`, `background: #f5b800`
  - "TAB" — same font/size/weight as SLO, color `#f5b800`
- **Tagline row** (below wordmark, `gap: 10px` from wordmark):
  - JetBrains Mono, **12px**, letter-spacing `0.22em`, uppercase, color `#fbf7ec` (TIGER.cream)
  - Format: `San Luis Obispo  •  Tiger Athletic Boosters`
  - Separator dot: 5×5px circle, `#f5b800`, `gap: 12px` between elements
- **Behavior:** entire banner is an `<a>` linking to home.

### 2. TopBar (score ticker / marquee)
- **Background:** `#0a0a0a`, **bottom border:** `2px solid #f5b800`
- **Type:** JetBrains Mono, **11px**, letter-spacing `0.08em`, uppercase, color `#fbf7ec`
- **Items:** infinite-scroll marquee (animation `marquee 40s linear infinite`, pauses on hover), each item is `inline-flex; gap: 10px; padding: 0 24px; border-right: 1px solid #333`
- **Item shape:** optional orange tag (e.g. "NEXT UP", "RESULT") + text + optional orange score (e.g. "W 3-1")
- Items duplicated 3× in the DOM so the marquee loops seamlessly.

### 3. Nav (sticky, glassy)
- `position: sticky; top: 0; z-index: 100`
- **Background:** `rgba(250, 246, 238, 0.92)` with `backdrop-filter: blur(12px)` — falls back to solid `var(--bg)` if browser doesn't support
- **Bottom border:** `1px solid #e9e0c8` (bone)
- **Inner container:** `max-width: 1440px; margin: 0 auto; padding: 14px 40px; display: flex; align-items: center; gap: 24px`
- **Brand block (left):** Logo PNG (`assets/logo.png`, 42×42, border-radius 50%) + two-line text ("SLOTAB" 18px Source Serif 4 weight 800 / "Tiger Athletic Boosters" 9.5px JetBrains Mono caps letter-spacing 0.16em)
- **Nav items** (Home, About▼, Get Involved▼, Events, Teams▼, Watch, Hall of Fame): Manrope 13px weight 600, `padding: 10px 14px`, color `var(--graphite)` default / `var(--ink)` active, `border-bottom: 2px solid` — orange when current
- **Dropdowns** (About, Get Involved, Teams): appear on hover; min-width 220px; bg `var(--bg)`; `border: 1px solid var(--bone); border-top: 2px solid #f5b800`; box-shadow `0 12px 40px rgba(0,0,0,0.08)`; items `padding: 10px 18px`, 13px weight 500
- **Donate button (right edge):** three prominence levels — for production use the **medium / "btn btn-dark"** variant: black background, gold text, "Donate" label, `padding: 14px 24px`, 13px weight 700 caps letter-spacing 0.08em.

### Footer (every page)
- **Background:** `#0a0a0a`, color `#fbf7ec` cream
- **Padding:** `100px 40px 40px`
- **Layout:** four columns inside `max-width: 1440px` container — Brand (logo + tagline), Get Involved, Events & Teams, Connect
- **Top accent:** `4px solid #f5b800` line above the column grid (or the section), with `Est. 1894 · San Luis Obispo` in monospace caps
- **Bottom strip:** "© 2026 SLOTAB · All Rights Reserved" + "Title IX Compliant · Privacy · Terms" — JetBrains Mono 11px, color pewter

---

## Homepage Sections (in order)

### A. Hero — Full-bleed photo carousel
- **Section height:** `720px`
- **Background:** `#0a0a0a` (visible during fade between slides)
- **Slides:** 5 photos, cross-fade every 6 seconds (1.2s ease opacity transition); each slide also slowly Ken Burns scales from 1.0 → 1.04 over 7s
  1. `assets/photos/tunnel-runout.jpg` — Football, "Friday night under the lights · Holt Field"
  2. `assets/photos/football-helmets.jpg` — Football, "Tigers helmets up · pre-game ritual"
  3. `assets/photos/water-polo-huddle.jpg` — Water Polo, "Girls Water Polo · the huddle"
  4. `assets/photos/student-section.jpg` — Student Section, "GO TIGERS · the body-paint section"
  5. `assets/photos/basketball-girls.jpg` — Basketball, "Girls Varsity Basketball · #22 Hartford"
- **Image filter:** `contrast(1.05) saturate(1.05)`, `object-fit: cover`
- **Two stacked overlays:**
  - Vertical: `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)`
  - Horizontal: `linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)`
- **Content block** (`max-width: 1440px; padding: 0 40px 80px`, bottom-aligned):
  - Eyebrow row: gold pill "SLO Tiger Athletics" (JetBrains Mono 11px caps weight 700, gold bg, black text, `padding: 6px 12px`) + "Est. 1894" in mono caps cream
  - Headline: **"Go Tigers."** — Source Serif 4, **124px**, weight 800, color white, letter-spacing -0.025em, with **"Tigers."** italicized in `#f5b800`
  - Sub-copy: "Raising funds and rallying the community to support every CIF-sanctioned team and cheer squad at San Luis Obispo High School." — 19px line-height 1.55, max-width 560px, color `#f3ede0`
  - Buttons: orange "Become a Member" (btn-primary with arrow) + ghost "Volunteer"
- **Hero meta strip** (bottom of section): caption text in mono caps left, slide-position indicators right (dots: 12×3 inactive, 36×3 active orange)

### B. Stats Bar (black band)
- **Background:** `#0a0a0a`, color cream, `padding: 36px 0`, `border-bottom: 1px solid #2a2a2a`
- **Grid:** 4 columns inside max-width 1440 / padding 40, `gap: 40px`
- Each cell `padding-left: 24px`; **first cell** has `border-left: 2px solid #f5b800`, others `border-left: 1px solid #2a2a2a`
- Number: Source Serif 4 weight 800, **44px**, white
- Label below: JetBrains Mono 11px caps letter-spacing 0.12em, silver
- **Content:**
  - 22 / CIF-sanctioned teams
  - 600+ / Student-athletes annually
  - $1.4M / Raised since 2012
  - 501(c)(3) / Non-profit · EIN 45-4897120

### C. "Three Ways" cards
- **Padding:** `120px 0`, background `var(--bg)` (cream)
- **Section head** (left-aligned): eyebrow "How You Can Help", title "Three ways to support Tiger athletics." (Source Serif 4 48px), kicker "Memberships, sponsorships, and volunteer hours fund equipment, travel, facilities, and the small things that make a season."
- **Card grid:** `repeat(3, 1fr)`, `gap: 1px`, wrapped in `border: 1px solid var(--bone)` with `background: var(--bone)` so the gap reads as hairline divider lines
- Each card: bg `var(--bg)`, `padding: 48px 36px 40px`, hover lifts -3px
  - "01 —" / "Join SLOTAB" / "Individual and family memberships go directly into our general fund — coaches, equipment, travel, facilities." / "Membership Levels →"
  - "02 —" / "Sponsor a Team" / "Local businesses sponsor SLOTAB at Platinum, Gold, Silver, or Bronze tiers — or sponsor a specific team directly." / "Business Sponsorship →"
  - "03 —" / "Volunteer" / "Concession stand, apparel booth, gate, or Booster Bash. Every hour goes straight to the athletes." / "Volunteer Opportunities →"
- Number: JetBrains Mono 11px gold letter-spacing 0.18em
- Title: Source Serif 4 weight 800 32px, margin `14px 0`
- Body: 15px line-height 1.65, color graphite, min-height 90px (so cards align)
- CTA: `.ulink` underlined link

### D. Impact / Editorial split
- **Padding:** `120px 0`, background `var(--paper)` (`#f3ecda`)
- **Grid:** `1.1fr 1fr`, gap 80px, align-items center
- **Left column:**
  - Eyebrow "Where Your Dollars Go"
  - Title: "Every donation funds a real *purchase* for Tiger athletes." — 64px Source Serif 4, "purchase" italic gold
  - 17px paragraph, max-width 480
  - 2×2 grid of dollar figures with hairline borders:
    - $48,200 / Equipment & gear
    - $31,500 / Travel & tournaments
    - $22,800 / Facility upgrades
    - $14,300 / Athlete meals & snacks
  - "See the Full Impact →" btn-dark
- **Right column:**
  - Photo: `assets/photos/basketball-girls.jpg`, height 560, with caption "Bailey Hartford · Senior Captain" + credit "Photo · TNN"
  - Floating card overlay (`position: absolute; bottom: 60; left: -40`): black bg, `border-top: 4px solid #f5b800`, contents: "2024-25 TOTAL" in mono gold, "$116,800" in 48px Source Serif 4, "Raised & deployed for Tiger athletes" 13px

### E. Teams Grid
- **Padding:** `120px 0`, bg cream
- Header row: section head ("22 Teams · One Pride" / "Every team. Every season.") on left, "View all teams →" link on right
- **Grid:** `repeat(4, 1fr)`, gap 16px
- Each card: black bg, image height 320 (`object-fit: cover`, contrast 1.05 sat 1.05), info strip below with season tag (orange mono caps 10px) + team name (Source Serif 4 22px) + record on right
- **Teams shown:** Football (8–3), Girls Volleyball (21–4), Boys Water Polo (14–6), Girls Tennis (12–2)

### F. Calendar + Watch (split)
- **Padding:** `120px 0 100px`, bg paper
- **Grid:** `1fr 1.1fr`, gap 80
- **Left — calendar:** title "What's on the calendar."; list of 5 events; each row is a 90px / 1fr / auto grid:
  - Date in 24px orange Source Serif 4 + day in 10px mono pewter
  - Title 18px weight 700 + meta 13px graphite
  - Optional orange tag pill ("Featured")
  - Hairline `border-bottom: 1px solid var(--bone)`
- **Right — Watch:** title "Live & on-demand."
  - Featured tile (height 380): `assets/photos/volleyball-set.jpg` at 70% opacity, gradient overlay, top-left LIVE badge (red bg, animated pulsing dot) + "Beach Volleyball" tag, bottom title "Girls Beach Volleyball vs Morro Bay" (28px Source Serif 4) + "NOW STREAMING ON HUDL · 1,247 watching" mono
  - Two smaller tiles (height 180) below in 1fr 1fr grid: Basketball, Water Polo

### G. Sponsor Wall
- **Padding:** `100px 0`, bg `#0a0a0a`, color cream
- Header: eyebrow "Powered By Local" + 56px white title "Our 2025-26 sponsors." + "Become a Sponsor" btn-primary on right
- **`<SponsorWall mode="compact" onDark={true}/>`** — see `sponsor-wall.jsx`. Renders the actual Platinum/Gold/Silver/Bronze tier list using logo files from `assets/sponsors/`.
- Footer link: "SEE ALL 60 SPONSORS →" gold mono caps, centered

### H. Hall of Fame
- **Padding:** `120px 0`, bg cream
- **Grid:** `1fr 1.4fr`, gap 80, align center
- **Left:** eyebrow "Tigers For Life" / title "Hall of *Fame*" (56px, "Fame" italic orange) / paragraph / btn-dark "Visit the Hall"
- **Right:** 3-column grid of 6 inductee cards. Each: bg paper, `border-top: 2px solid #f5b800`, padding `24px 22px`. Year mono caps, name 19px Source Serif 4, sport 12px graphite.

### I. Closing CTA — Gold
- **Padding:** `120px 0`, bg `#f5b800`, color black
- **Decorative:** PawMark SVG, 500px, opacity 0.12, positioned `right: -100; top: -100`
- Centered max-width 1100, padding 0 40
- Eyebrow "— Join The Pride" (mono caps black at 0.7 opacity)
- Headline: "One school. *One pride.*" — 88px Source Serif 4
- Sub: "Memberships start at $50. 100% of every dollar goes to SLOHS student-athletes." 19px charcoal max-width 620
- Buttons: btn-dark "Become a Member" + btn-ghost "Contact the Board"

---

## Inner Pages
All inner pages share the same Banner + TopBar + Nav + Footer chrome above. Page-specific bodies live in `pages.jsx`. Read that file directly — each is a single component with the layout fully spelled out:

- **TeamsPage** — index of all 22 teams, season filter pills, team cards
- **TeamDetailPage** — single-team layout (Football example): photo masthead, schedule rail, roster grid, coaching staff
- **MembershipPage** — tier comparison (Family / Booster / Champion / Hall of Fame) + Sponsor tiers (Platinum/Gold/Silver/Bronze)
- **EventsPage** — calendar list + featured Spring Social hero
- **WatchPage** — Hudl-embedded grid, live + replays
- **HallPage** — searchable inductee gallery
- **ImpactPage** — annual report with charts and breakdown of dollars deployed
- **AboutPage** — board portraits, mission, contact form

---

## Design Tokens

### Colors
| Token | Hex | Notes |
|---|---|---|
| `TIGER.orange` / `--orange` | `#f5b800` | **NB:** the variable is named "orange" for legacy reasons but the value is school **gold**. Treat this as the brand primary accent. Rename in production code. |
| `TIGER.orangeDeep` / `--orange-deep` | `#c89400` | Hover/pressed for primary |
| `TIGER.orangeLight` | `#ffd34d` | |
| `TIGER.gold` / `--gold` | `#f5b800` | Same as orange |
| `TIGER.goldDeep` | `#c89400` | |
| `TIGER.black` / `--black` | `#0a0a0a` | Brand black |
| `TIGER.ink` / `--ink` | `#161616` | Body copy |
| `TIGER.cream` / `--bg` | `#fbf7ec` | Page background (warm) |
| `TIGER.paper` / `--paper` | `#f3ecda` | Alt section bg |
| `TIGER.bone` / `--bone` | `#e9e0c8` | Hairlines, dividers |
| `TIGER.charcoal` / `--charcoal` | `#1f1f1f` | |
| `TIGER.graphite` / `--graphite` | `#454340` | Secondary text |
| `TIGER.pewter` / `--pewter` | `#76736b` | Tertiary text / mono captions |
| `TIGER.silver` / `--silver` | `#b3ada0` | |

Dark mode tokens (when `dark` prop is true on `GlobalStyles`) are defined in `design-system.jsx`; document only if dark mode is in scope.

### Typography
- **Display serif:** Source Serif 4 (Google Fonts), weights 300–900, optical-sizing `8..60`, italic available. Used for all headlines via `.display` class (weight 800, letter-spacing -0.02em, line-height 0.95, `text-wrap: balance`).
- **Sans:** Manrope (Google Fonts), weights 300/400/500/600/700/800. Body copy and UI.
- **Mono:** JetBrains Mono (Google Fonts), weights 400/500/700. Eyebrows, tags, scores, captions.

Type scale used:
- Display 124 (hero) / 88 (closing CTA) / 64 / 56 / 48 / 32 / 28 / 22 / 19 / 18
- Body 19 (hero sub) / 17 / 16 / 15 / 13
- Mono 12 / 11 / 10 / 9.5 (eyebrows, tags)

### Spacing
- Section padding: **120px** vertical (96px on tighter sections)
- Container: `max-width: 1440px; padding: 0 40px`
- Card padding: typically `48px 36px 40px` or `24px 22px`
- Button padding: `14px 24px`
- Grid gaps: 16 / 24 / 40 / 80 (large editorial splits)

### Borders & Radius
- The design is intentionally **square** — `border-radius: 0` everywhere except the circular logo. Don't introduce rounded corners.
- Hairline: `1px solid var(--bone)` (`#e9e0c8`)
- Brand accent border: `2px solid` or `4px solid` in `#f5b800`

### Shadows
- Dropdown menu: `0 12px 40px rgba(0,0,0,0.08)`
- Otherwise the design relies on hairlines and contrast, not shadows. Lift on hover is a transform (`translateY(-3px)`), not a shadow.

### Motion
- Hero crossfade: opacity 1.2s ease, 6s interval
- Hero Ken Burns: `transform 7s ease-out` scale 1.0 → 1.04
- Card lift: `transform .25s ease`
- Button hover: `translateY(-1px)` `.15s`
- Marquee: 40s linear infinite, pauses on hover
- LIVE pulse: dot `animation: pulse 1.5s infinite`

---

## Components Inventory

In `design-system.jsx`:
- `TIGER` — token object
- `GlobalStyles({ dark })` — injects `<style>` with all CSS vars and base styles
- `Logo({ size })` — circular booster-club PNG
- `PawMark({ size, color })` — geometric SVG paw
- `Chevron({ dir, size })` — small SVG chevron
- `SectionHead({ eyebrow, title, kicker, align, dark })`
- `SiteBanner({ onNavigate })` — **the SLO | TAB wordmark banner** (top of every page)
- `TopBar({ items })` — score-ticker marquee
- `Nav({ current, onNavigate, donateProminence, solid })` — sticky main nav
- `Footer({ onNavigate })`
- Button classes (in CSS): `.btn`, `.btn-primary`, `.btn-dark`, `.btn-ghost`, `.btn-arrow`
- `.tag`, `.tag-orange`, `.tag-dark`, `.eyebrow`, `.ulink`, `.display`, `.mono`, `.serif`

In `home-classic.jsx`:
- `HomeClassic({ onNavigate, donateProminence })` — full homepage

In `pages.jsx`:
- `TeamsPage`, `TeamDetailPage`, `MembershipPage`, `EventsPage`, `WatchPage`, `HallPage`, `ImpactPage`, `AboutPage`

In `sponsor-wall.jsx`:
- `SponsorWall({ mode, onDark })`

---

## Assets
All assets live in `assets/`:
- `assets/logo.png` — SLOTAB Tiger Athletic Booster Club roundel (PNG, used in nav and footer)
- `assets/logos/` — additional logo lockups (SLOHS school logo)
- `assets/photos/` — full photography library (footballhelmets, basketball-girls, volleyball-set, water-polo-*, student-section, tennis-team, tunnel-runout, etc.). All real photographs — do not regenerate.
- `assets/sponsors/` — sponsor logo files referenced by `sponsor-wall.jsx`

Photography tone: warm, contrast-pushed, slightly saturated. The `contrast(1.05) saturate(1.05)` filter is applied in the design — production should aim for the same look in the source images themselves rather than via runtime filter where possible.

---

## Data / Content the Developer Will Need to Wire
The prototype hard-codes content in JSX. In production these should come from a CMS, JSON files, or APIs:

- **Score ticker items** (TopBar) — recent results, upcoming games, impact callouts
- **Hero photo set** — 5 rotating photos with sport + caption per slide
- **Stats bar numbers** — annual figures, refreshed yearly
- **Calendar events** — upcoming SLOTAB and athletic events
- **Watch tiles** — live games (Hudl integration) + recent replays
- **Teams list** — all 22 CIF teams with season + current record + cover image
- **Sponsors** — tiered list, refreshed yearly (the prototype uses `assets/sponsors/`)
- **Hall of Fame inductees** — name, year, sport/role
- **Impact dollar breakdown** — annual purchase summaries

---

## Files in This Bundle
- `preview.html` — runnable preview (open via local web server)
- `design-system.jsx` — tokens, GlobalStyles, SiteBanner, TopBar, Nav, Footer, Logo, primitives
- `home-classic.jsx` — homepage layout (Design A)
- `pages.jsx` — all inner-page layouts
- `sponsor-wall.jsx` — sponsor tier component
- `assets/` — all photography, logos, sponsor files

## Implementation Checklist
1. Pick framework (Next.js / Astro recommended for static-first content site).
2. Port `TIGER` tokens to your design system (rename `orange` → `gold` since the value is school gold, not orange).
3. Set up Source Serif 4 + Manrope + JetBrains Mono via `next/font` or equivalent.
4. Build `SiteBanner`, `TopBar`, `Nav`, `Footer` as your shared layout shell.
5. Build the homepage section-by-section, wiring real data sources.
6. Build inner pages, reusing the section primitives (SectionHead, card grids, tag pills, etc.).
7. Wire Hudl embed for the Watch page; wire form for Contact; wire CMS for Events / Teams / Sponsors / Hall.
8. QA against `preview.html`.
