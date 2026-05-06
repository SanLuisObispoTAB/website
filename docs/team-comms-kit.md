# SLOTAB Team Comms Kit — Architecture & Playbook

**Purpose:** give every SLOHS team a working operational communication
channel (coach → athletes & parents) by default, while still respecting
coaches who already have their own tools working.

> **Board decision (April 2026):** the kit is an **internal operational
> standard for the board and coaches** — it is *not* surfaced on
> slotab.org. The website pages will not display Remind codes, BAND
> invites, or ParentSquare links. Liaisons sourced from the kit *are*
> shown on each team page.
>
> The kit also no longer carries the team's schedule. Coaches link out
> to the central schedule (the SLOHS athletic-department weekly sheet,
> mirrored on `slotab.org/upcoming`) rather than maintaining a separate
> copy inside Remind/BAND.

---

## The two jobs a "team site" does

| | Operational | Booster / Community |
|---|---|---|
| **Audience** | Current players & their parents | Alumni, donors, community |
| **Content** | Practice changes, departure times, forms, announcements, team chat, RSVPs | Team identity, roster, wishlist, donate, recognition, liaisons |
| **Privacy** | Mostly private — rosters with contact info, parent numbers | Fully public, indexed, shareable |
| **Cadence** | Daily during season; dormant off-season | Aligned with news & fundraising calendar |
| **Owned by** | Head coach (changes when coach changes) | SLOTAB board (survives coaching changes) |
| **Lives on** | Coach's chosen tools (Remind / BAND / ParentSquare / coach's own) | `slotab.org/teams/<sport>` |

The SLOTAB team page hosts the **community / booster face** only. The
coach's operational tools handle everything else and are not linked from
slotab.org. Parents find them via direct distribution at the start of
the season (parent meeting, team email, school office).

---

## The Standard Kit

Every team gets these three tools set up by default:

### 1. Remind
- **What**: One-way announcements (coach → everyone), SMS fallback for
  parents without the app.
- **Why**: Ubiquitous across CA schools, teachers already use it, zero
  onboarding friction for parents.
- **Setup time**: ~5 minutes per team.
- **Cost**: Free.

### 2. BAND
- **What**: Two-way group activity — team chat, RSVPs, photos, polls,
  parent coordination.
- **Why**: Purpose-built for sports teams, stronger than Remind for
  anything collaborative, free.
- **Setup time**: ~10 minutes per team.
- **Cost**: Free.

### 3. ParentSquare
- **What**: District-wide communications platform. Every SLCUSD
  family already has an account through the district.
- **Why**: Some parents only check ParentSquare. Cross-posting coach
  announcements here catches them.
- **Setup time**: The coach's ParentSquare access comes with their
  district account. A per-team group post takes ~2 minutes.
- **Cost**: Free (district-provided).
- **SLOHS URL**: <https://www.parentsquare.com/schools/1903/>
  (use this exact URL in the `playerParentChannels` entry for
  every team — it's the SLOHS school ID, not per-team).

All three are set up by SLOTAB and handed to the coach. The kit is
**not** linked from slotab.org — parents discover it via the parent
meeting, the team email, and printed handouts.

### What the kit does NOT include

- **Schedule**. The team's schedule lives in one place: the SLOHS
  athletic-department weekly sheet (mirrored on `slotab.org/upcoming`).
  Coaches link to that URL from inside Remind / BAND / ParentSquare
  rather than maintaining a duplicate schedule that drifts.
- **Rosters with contact info**. Those live inside whichever tool the
  coach uses (Remind subscribers list, BAND members, etc.) — never on
  slotab.org.

---

## Liaisons

Each team has 1-2 SLOTAB volunteer liaisons identified at the start of
the season. **Liaison name + role + email IS surfaced on the public
team page** (under the Quick Facts strip) — they're the public-facing
booster contact for that team. Liaison contact information is sourced
from the comms kit metadata so the kit and the website stay in sync.

---

## Coach Onboarding — ~20 minutes

1. **SLOTAB creates the accounts** (board task, once per team):
   - Remind: new class with a SLOHS-branded code (e.g. `@slohsfb26`)
   - BAND: new team group with a vanity URL
   - ParentSquare: coach uses their existing district account; SLOTAB
     helps them create the team group if needed
2. **SLOTAB sends the coach a one-page onboarding sheet** with the
   codes, URLs, and invite links — *and the central schedule URL*
   (`slotab.org/upcoming`) the coach pins at the top of each tool.
3. **Coach announces** all three at the first parent meeting of the
   season and/or first email home.
4. **SLOTAB updates `data/teams/<sport>.json`** with the team's
   liaison(s) sourced from the kit roster — but **does not** publish
   the comms URLs to the website.

When a coach leaves, SLOTAB transfers account ownership to the
incoming coach — no rebuild required.

---

## Opting Out (the "custom" path)

Some coaches already have something that works. T&F is the canonical
example: the head coach maintains a rich Google Site with calendar,
coaches' bios, school records, meet info, and a memorial scholarship.
Forcing them onto the Standard Kit would be strictly worse.

For these teams the SLOTAB board logs the opt-out internally (which
tools the coach uses + how parents reach them) but the public team
page on slotab.org carries no operational links either way.

ParentSquare is still encouraged for every team because it's
district-wide and some families only monitor that channel.

---

## Privacy

Nothing that appears on the public booster team page should expose
individual athlete contact info:

- Roster: jersey number + first name + year + position. **No emails,
  no phones, no parent contacts.**
- Captains: names only.
- Coach contact: school email is fine. Personal emails only if the
  coach explicitly OKs it.
- Anything sensitive (parent phone trees, private schedule links, team
  documents) lives on the operational tool, behind whatever auth gate
  that tool provides.

---

## Tracking which teams have the kit

Since comms aren't surfaced on slotab.org anymore, the per-team status
is tracked **internally** (board spreadsheet or a future Decap
collection that's hidden from public rendering). Status values:

- **standard** — Coach is using the SLOTAB Standard Kit.
- **custom** — Coach uses their own tool; SLOTAB still helps with
  ParentSquare cross-posting if needed.
- **none** — Not set up yet. Board's cue to schedule onboarding.

The board's job is to track which teams need to move from `none` to
either `standard` or `custom` before each season starts.

---

## Why not build our own in-SLOTAB team portal?

Tempting but wrong for a volunteer-run booster:

- **Maintenance burden** — we'd own features that Remind/BAND already
  ship for free.
- **Privacy surface** — storing student rosters with contact info on
  the SLOTAB site means we now carry COPPA / FERPA-adjacent
  obligations.
- **Doesn't survive turnover** — when whichever volunteer built the
  portal moves on, the next webmaster inherits a product, not a doc.
- **Duplicates ParentSquare** — the district already bought a
  communications platform.

The right job for SLOTAB is the public booster face and the glue that
points parents at the coach's chosen tool.
