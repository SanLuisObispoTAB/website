# SLOTAB Team Comms Kit — Architecture & Playbook

**Purpose:** give every SLOHS team a working operational communication
channel (coach → athletes & parents) by default, while still respecting
coaches who already have their own tools working.

---

## The two jobs a "team site" does

| | Operational | Booster / Community |
|---|---|---|
| **Audience** | Current players & their parents | Alumni, donors, community |
| **Content** | Practice changes, departure times, forms, announcements, team chat, RSVPs | Team identity, schedule, wishlist, donate, recognition |
| **Privacy** | Mostly private — rosters with contact info, parent numbers | Fully public, indexed, shareable |
| **Cadence** | Daily during season; dormant off-season | Aligned with news & fundraising calendar |
| **Owned by** | Head coach (changes when coach changes) | SLOTAB board (survives coaching changes) |
| **Lives on** | Coach's preferred tool (standard kit OR their own) | `slotab.org/teams/<sport>` |

The SLOTAB team page hosts the **community / booster face** only. The
coach's operational tool handles everything else. The SLOTAB team page
prominently links to the coach's tool via the "For Current Players &
Parents" strip.

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

When all three are set up, a team's page shows three branded cards under
"For Current Players & Parents" — Remind, BAND, and ParentSquare —
each with a one-click link to join.

---

## Per-Team Status Model

Each team carries an `operationalSetup` flag in `data/teams.json`:

| Status | Means | Shown on index as |
|---|---|---|
| `standard` | Coach is using the SLOTAB Standard Kit | Green "Standard Kit" badge |
| `custom` | Coach runs their own tool (Google Site, personal site, etc.) — standard kit not used | Gold "Coach's Site" badge |
| `none` | Not set up yet — SLOTAB board should help before season | Red "Not set up" badge |

Board members can scan the Teams index page in one glance to see which
teams need help getting their comms kit set up.

---

## Coach Onboarding — ~20 minutes

1. **SLOTAB creates the accounts** (board task, once per team):
   - Remind: new class with a SLOHS-branded code (e.g. `@slohsfb26`)
   - BAND: new team group with a vanity URL
   - ParentSquare: coach uses their existing district account; SLOTAB
     helps them create the team group if needed
2. **SLOTAB sends the coach a one-page onboarding sheet** with the
   codes, URLs, and invite links.
3. **Coach announces** all three at the first parent meeting of the
   season and/or first email home.
4. **SLOTAB updates `data/teams/<sport>.json`** with the three channel
   URLs and flips `operationalSetup` to `standard`.

When a coach leaves, SLOTAB transfers account ownership to the
incoming coach — no rebuild required.

---

## Opting Out (the "custom" path)

Some coaches already have something that works. T&F is the canonical
example: the head coach maintains a rich Google Site with calendar,
coaches' bios, school records, meet info, and a memorial scholarship.
Forcing them onto the Standard Kit would be strictly worse.

The opt-out is one field change:

```json
{
  "operationalSetup": "custom",
  "playerParentChannels": [
    {
      "kind": "google-site",
      "label": "SLOHS T&F and XC Team Website",
      "url": "https://sites.google.com/a/slcusd.org/slohs-track-and-field/",
      "meta": "Calendar, coaches, records, scholarships, meet info"
    },
    {
      "kind": "parentsquare",
      "label": "ParentSquare — SLOHS",
      "url": "https://www.parentsquare.com/schools/slohs",
      "meta": "District-wide comms"
    }
  ]
}
```

Custom teams are still encouraged to surface **ParentSquare** because
it's district-wide and some families only monitor that channel.

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

## When a team has `operationalSetup: "none"`

The team page shows a yellow "Not set up yet" callout in place of the
comms strip, pointing to this playbook. Parents are told to contact a
board member or the team liaison for interim access. This is also the
board's cue to schedule the Standard Kit onboarding for that team.

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
