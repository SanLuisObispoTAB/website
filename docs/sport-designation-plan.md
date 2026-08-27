# Sport designation — change plan

> **Status:** §§1–4 and §6 are a **plan — not implemented**, waiting on the
> board's answer to Erik's proposal about the 2026-27 sport designations.
> **No donation behaviour has changed.** The donate form still offers a sport
> to everyone, and the payment route still accepts it.
>
> **One thing here HAS shipped** (§5): `/board/square-report` now *flags* the
> gifts already affected. It is read-only — it reports, corrects nothing, and
> touches nothing in Square. It shipped ahead of the rest because the affected
> gifts could not be listed from this repo at all, and because the board needs
> that list to answer the very question the rest of this plan is waiting on.
>
> **Purpose:** make the board's answer a *data edit*, not a code hunt. Today
> the rule is spread across 18 places in 4 categories; this plan converges it
> to one, and lists every surface that has to follow.
>
> Written 2026-08-27.

---

## 1. What the rule is today

Erik, 2026-08-27: **"None of the general memberships are allowed to designate
a sport."**

The code does not implement that rule. It implements two *unrelated* rules
that were never reconciled, and the gap between them is where the Hall Family
gift fell through (§5).

### Rule A — sponsorship "sports credit" (implemented, enforced)

A business tier may be **credited** to N sports — banner placement and
recognition. It moves no money.

| Tier | Price | `sportsCredit` | Source |
|---|---|---|---|
| Champion Sponsor | $10,000 | 3 | `sponsor-tiers.ts:76` |
| Gold Sponsor | $5,000 | 3 | `sponsor-tiers.ts:92` |
| Silver Sponsor | $2,500 | 3 | `sponsor-tiers.ts:105` |
| Tiger Pride | $1,000 | 0 | `sponsor-tiers.ts:120` |
| Varsity | $500 | 0 | `sponsor-tiers.ts:130` |

Enforced end to end: bullet text from `sportsCreditPerk()`, picker `limit`,
and a server check at `payment-link/route.ts:212` that refuses more than the
tier allows.

### Rule B — donation designation (implemented, **ungated**)

Any donation from **$25 to $50,000** may designate **one** team, and **75%**
of it goes to that team. There is no tier check, no amount check, and no
membership check anywhere in this path. The level is derived *afterwards*
from the amount by `levelForGift()` and plays no part in the decision.

### The gap

**Nothing in the codebase encodes "who may designate a donation."** Rule B
has no gate to correct — it has no gate at all. `GENERAL_MEMBERSHIPS`
(`sponsor-tiers.ts:153`) has no `sportsCredit` field, so a general membership
has no way to *say* it may not designate, because nothing ever asks it.

That is the whole of the work: **introduce one gate, and have four call sites
consult it.**

---

## 2. Every surface the rule touches

18 places. The ones marked 🔴 state the rule in prose and will silently drift
from the code unless they are changed in the same commit.

### A. The rule itself — where the single source of truth should live

| # | File | What it holds now |
|---|---|---|
| 1 | `src/app/data/sponsor-tiers.ts:76,92,105,120,130` | `sportsCredit` per sponsorship tier |
| 2 | `src/app/data/sponsor-tiers.ts:153` | `GENERAL_MEMBERSHIPS` — **no `sportsCredit` field at all** |
| 3 | `src/app/data/sponsor-tiers.ts:192` | `sportsCreditPerk(n)` — renders the bullet from the number |
| 4 | `src/app/data/sponsor-tiers.ts:263` | `levelForGift(amount)` — amount → level name, no designation input |

### B. Client surfaces

| # | File | What it does |
|---|---|---|
| 5 | `components/MembershipTiers.tsx:65` | renders the sports bullet — sponsorship tiers only |
| 6 | `components/MembershipTiers.tsx:110` | 🔴 CTA **"Join or donate →"** → `/donate?tab=general` — conflates joining with donating, and is the exact path the Hall Family took |
| 7 | `components/BusinessSponsorPanel.tsx:166` | shows the picker only when `sportsCredit > 0`; clamps selection on tier switch |
| 8 | `components/SportPicker.tsx` | shared picker, takes a `limit` prop and nothing else |
| 9 | `components/DonateForm.tsx:447` | 🔴 "Designate your gift" `<select>` — **ungated**, offered to every donor |
| 10 | `components/DonateForm.tsx:190-191` | 🔴 hardcoded `0.75` / `0.25` preview — a **second copy** of the split, see #13 |

### C. Server and transaction path

| # | File | What it does |
|---|---|---|
| 11 | `api/square/payment-link/route.ts:212` | enforces `sportsCredit` on the **sponsorship** branch |
| 12 | `api/square/payment-link/route.ts:248` | **donation** branch — accepts any designation, sets `metadata.split="75-25"` and `metadata.level` |
| 13 | `lib/square-report.ts:21,306` | `TEAM_SHARE = 0.75` + `allocateCents()` — **the** authority for the arithmetic |
| 14 | `lib/donation-notification.ts:177,306` | prints level perks verbatim — the source of the false "Supports all sports" line (§5) |
| 15 | `lib/sponsor-fulfilment.ts:142` | `perkAction()` keyword table — decides actionable vs passive perks |
| 16 | `lib/donor-wall.ts` + `/board/donor-wall` | files accepted donors by level name |

### D. Prose that restates the rule 🔴

Each of these is a hand-written sentence asserting the current behaviour. None
is generated. All must move together.

| # | File | Text |
|---|---|---|
| 17a | `membership/page.tsx:53-54` | *"pick an amount, designate a team (or the general fund), and your membership lands at the matching tier automatically"* — **directly contradicts the new rule** |
| 17b | `page.tsx:221` (home) | *"75% to the team you designate · 25% to the general fund"* |
| 17c | `donate/page.tsx:22-23` | *"75% of every designated gift goes directly to the team you choose. 25% goes to the…"* |
| 17d | `donate/page.tsx:37` | *"75% to your sport, 25% to shared programs"* |
| 17e | `board/square-report/page.tsx:64,109` | prose + the `To team (75%)` column header |
| 17f | `sponsor-tiers.ts:157,162,167` | `"Supports all sports"` on **all three** general memberships |

### E. Outside this repo — cannot be fixed by a deploy

| # | Where | Why it matters |
|---|---|---|
| 18a | Square storefront — **27 per-sport donation items** (`data/square-donate.ts`, verified 2026-08-17) | Anyone can designate a sport by going straight to the storefront, bypassing the site entirely. **If the board bars general members from designating, the website alone cannot enforce it.** |
| 18b | Square storefront sponsorship items | Read as **5/4/3/2/1** on 2026-08-20; the site carries 3/3/3/0/0 from the board's final PDF (#170). Unverified since. **How to check now:** open the sponsorship items on `slotab-3.square.site` — they render client-side, so `curl` will not show it. |

---

## 3. The change that makes the board's answer one edit

**One gate, four consumers.** Extend the existing ladder rather than adding a
parallel one — `sponsor-tiers.ts` is already the single array that
`/membership`, `/donate`, the payment route and the donor wall all read
(#200), and that property is what makes this cheap.

### Step 1 — give every level an explicit allowance

Add `sportsCredit` to `MembershipTier` and set it on all three general
memberships. **Explicit `0`, not an absent field** — absence is why nothing
could ask the question. This is a data edit and is the *only* line the board's
decision needs to touch:

```
Family        sportsCredit: 0
Individual    sportsCredit: 0
Tiger Friend  sportsCredit: 0
```

### Step 2 — one function both halves consult

```ts
/** How many sports a gift at this level may designate. The only place this
 *  question is answered. */
export function sportsAllowedForLevel(levelName: string): number
```

Backed by `levelByName()`, which already searches both halves of the ladder.

### Step 3 — four call sites ask it instead of deciding for themselves

| Consumer | Change |
|---|---|
| `DonateForm` (#9) | show the designation `<select>` only when the amount's level allows it; when it does not, say so where the control was, rather than silently omitting it |
| `payment-link` donation branch (#12) | refuse a designation the level does not permit — **server-side, same as the sponsorship branch already does**; the form is a courtesy, the route is the control |
| `donation-notification` (#14) | do not print `"Supports all sports"` against a designated gift |
| `MembershipTiers` (#5) | render the allowance on the general cards too, so the sheet states the rule |

### Step 4 — collapse the duplicated split

`DonateForm.tsx:190-191` recomputes `0.75`/`0.25` by hand while
`allocateCents()` (#13) is the stated authority. Import it. Two copies of the
same arithmetic is the #143/#145 failure mode, and it is one line to remove.

### Step 5 — the prose (#17a–f) moves in the same commit

Non-negotiable. `membership/page.tsx:53` currently promises the opposite of
the new rule; shipping the code without it leaves the site arguing with
itself on the page where people join.

---

## 4. What each plausible board answer costs

The **shape** of the work is identical in every case — only the numbers move.
That is the point of doing steps 1–3 before the answer arrives.

| Board decides | Work after this plan is built |
|---|---|
| General memberships: **0 sports** (Erik's stated rule) | the 3 data lines in step 1. Nothing else. |
| General memberships may designate **1** | change three `0`s to `1`. Nothing else. |
| Sponsorship numbers change (e.g. Silver → 2) | edit `sportsCredit` in `SPONSOR_TIERS`. Already a one-line edit today. |
| **Designated giving stays open to everyone**, and only the *membership* framing changes | steps 2–4 still apply; step 1 stays `0` and the notification stops calling a designated gift a membership |
| Designated giving is withdrawn entirely below sponsorship level | all of the above **plus** the storefront (#18a) — 27 live per-sport items would need pulling, which is a Square dashboard job, not a deploy |

**Open question the board should also settle** (raised 2026-08-26, still
unanswered): **Silver's card contradicts itself.** It renders *"Banners at 2
sport locations of your choice"* and *"Choose up to three sports to receive
the credit"* — live on production now. Either the sheet lists banners (2) and
designation (3) separately and the card must distinguish them, or
`sportsCredit` should be 2.

---

## 5. The gift that exposed this — flagged, not decided

**2026-08-27, 8:06 AM PT · Square `ZU6vugzQ1QemYfsTfNknzx8admKZY` · $125 · The
Hall Family.** Designated **Wrestling (Boys)**, split **$93.75 team / $31.25
general**, recorded as level **Family**.

Every mechanical step was correct against the code as written — the split, the
level, the sub-$250 thank-you wording, the donor-wall queueing, and the "no
liaison on file" chase (`boys-wrestling.json` genuinely has no `liaison` key).

**But the notification told the Membership VP two contradictory things four
lines apart:** that the Family level includes *"Supports all sports"* (item 3),
and that $93.75 is designated to Wrestling (item 4). Under Erik's rule the
designation should not have been offered at all.

**Per Erik, 2026-08-27, the board decides what happens to this gift.** No
reallocation has been made and none should be made from here — it is real
money that a donor chose in good faith. What is needed:

1. Does the $93.75 stay with Wrestling, or revert to the general fund?
2. Should Dannene still notify Wrestling? The email told her to.
3. Trina reconciles from a QuickBooks connector posting daily summaries with
   no line detail (#161), so if this is reallocated it must be corrected in
   Square **and** flagged to her — nothing in this repo will do it.

### Finding the others — `/board/square-report` now flags them

Erik, 2026-08-27: *"Please flag every general membership donation where a team
was designated."* **That list could not be produced from this repo.** Donations
live only in Square, and `SQUARE_ACCESS_TOKEN` is a Vercel variable — there are
no local credentials, by design.

So rather than write a list that would be stale the next time someone donates,
the check was built where the data is. **`/board/square-report` now carries a
flagged-gifts panel**: pick any date range and it names every gift recorded at
Family, Individual or Tiger Friend that designated a team — date, designation,
level, gross, the 75% that went to the team, and the Square order id.

- **It reports, it does not correct.** The allocation table below it is
  unchanged and still includes these gifts. Nothing in Square is touched.
- **No donor names.** The order id opens the gift in Square, where the name
  already is. This page has never held a list of donor names and adding one to
  answer a reporting question is not a trade worth making.
- **It cannot go stale**, because it *is* the state — the same reasoning as the
  `/board` notification readout (#188).
- Logic is `isMisdesignatedGift()` in `lib/square-report.ts`, exported and pure
  so it can be exercised without a Square account. Nine cases pass, including
  the Hall of Fame fund **not** being flagged (a named fund is not a team and
  keeps 100%), and a sponsorship purchase not being flagged.

**One boundary worth confirming.** The flag matches Erik's rule exactly —
*general memberships*, meaning Family, Individual and Tiger Friend. It does
**not** flag a donation recorded at **Tiger Pride** or **Varsity**, even though
those tiers also carry `sportsCredit: 0`. A $500 donation designating a team is
recorded as "Varsity" by `levelForGift()` and passes unflagged. If the board's
rule is "any level with a zero allowance", that set widens — one line.

**This is not a one-off.** All three general memberships carry `"Supports all
sports"`, and every one is reachable by a designated gift, because designation
is ungated. **Any designated donation under $500 produces the same
contradiction** — which is most donations the club takes.

---

## 6. Order of work, once the board answers

1. Steps 1–2 (data + the one function) — no behaviour change, nothing user-visible.
2. Step 3 server-side first (#12), then the form (#9). Server before client,
   always: the route is the control, the form is the courtesy.
3. Step 4 (split de-duplication) — independent, safe to land any time.
4. Step 5 (prose) — **same commit as step 3**, or the site contradicts itself.
5. Re-verify #18b against the storefront and reconcile.
6. Cases worth covering before shipping: a designated gift at a
   zero-allowance level is refused by the route; the notification omits
   "Supports all sports" for a designated gift and keeps it for a general one;
   a level that allows N refuses N+1; and the storefront path (#18a) is
   documented as unenforceable rather than assumed closed.
