# Team page gaps

**Generated — do not edit by hand.** Re-run `npm run team-audit -- --write` after adding photos or coach info.

`/teams/cross-country` is the reference page (decisions #108, #109): head coaches with roles and bios, assistants listed, a labelled squad portrait, and action shots only in the action slots. Everything below is content the board supplies — no code change is needed for any of it.

## Standard teams (17)

| Team | action hero | action gallery | squad portrait | head coach | coach bio | coach email | liaison |
|---|---|---|---|---|---|---|---|
| `baseball` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `boys-basketball` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `boys-soccer` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `boys-water-polo` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `boys-wrestling` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `cross-country` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dance` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `flag-football` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `girls-basketball` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `girls-golf` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `girls-soccer` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `girls-swim-dive` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `girls-tennis` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `girls-volleyball` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `girls-water-polo` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `girls-wrestling` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `stunt` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |

### What's missing, by count

- **coach bio** — missing on 15 of 17 teams
- **action gallery** — missing on 7 of 17 teams
- **liaison** — missing on 7 of 17 teams
- **action hero** — missing on 2 of 17 teams
- **squad portrait** — missing on 0 of 17 teams ✅
- **head coach** — missing on 0 of 17 teams ✅
- **coach email** — missing on 0 of 17 teams ✅

Fully complete: `boys-water-polo`

### Per team

- `baseball` — needs **action hero**, **action gallery**, **coach bio** _(1 head coach, 0 assistants, 0 action shots, 1 portrait)_
- `boys-basketball` — needs **coach bio**, **liaison** _(1 head coach, 0 assistants, 6 action shots, 1 portrait)_
- `boys-soccer` — needs **coach bio**, **liaison** _(1 head coach, 0 assistants, 4 action shots, 1 portrait)_
- `boys-water-polo` — complete ✅ _(1 head coach, 0 assistants, 2 action shots, 1 portrait)_
- `boys-wrestling` — needs **action gallery**, **coach bio**, **liaison** _(1 head coach, 0 assistants, 0 action shots, 1 portrait)_
- `cross-country` — needs **action gallery** _(2 head coaches, 2 assistants, 0 action shots, 2 portraits)_
- `dance` — needs **coach bio** _(1 head coach, 0 assistants, 2 action shots, 1 portrait)_
- `flag-football` — needs **action gallery**, **coach bio**, **liaison** _(1 head coach, 0 assistants, 0 action shots, 1 portrait)_
- `girls-basketball` — needs **coach bio** _(1 head coach, 0 assistants, 1 action shot, 1 portrait)_
- `girls-golf` — needs **action gallery**, **coach bio** _(1 head coach, 0 assistants, 0 action shots, 1 portrait)_
- `girls-soccer` — needs **coach bio** _(1 head coach, 0 assistants, 4 action shots, 1 portrait)_
- `girls-swim-dive` — needs **coach bio** _(1 head coach, 0 assistants, 1 action shot, 1 portrait)_
- `girls-tennis` — needs **coach bio**, **liaison** _(1 head coach, 0 assistants, 4 action shots, 1 portrait)_
- `girls-volleyball` — needs **coach bio** _(1 head coach, 0 assistants, 1 action shot, 3 portraits)_
- `girls-water-polo` — needs **coach bio** _(1 head coach, 0 assistants, 5 action shots, 1 portrait)_
- `girls-wrestling` — needs **action hero**, **action gallery**, **coach bio**, **liaison** _(1 head coach, 0 assistants, 0 action shots, 1 portrait)_
- `stunt` — needs **action gallery**, **coach bio**, **liaison** _(1 head coach, 0 assistants, 0 action shots, 1 portrait)_

## Large programs (2) — held to a lower bar

Football is a three-level program and track & field spans ~18 events with a large staff, so neither fits the single-squad template. Listed for visibility only; not counted above.

| Team | action hero | action gallery | squad portrait | head coach | coach bio | coach email | liaison |
|---|---|---|---|---|---|---|---|
| `football` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `track-field` | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |

## Missing squad photos

Multi-squad programs show one captioned portrait per squad. These squads have no photo in `public/photos` yet — drop them through `photo-inbox/` and add a `teamPhotos` entry:

- `track-field` — missing **Boys**, **Girls** _(has 0)_

## Rule violations

None. No posed portrait is sitting in an action slot, and no page shows the same photo twice.

