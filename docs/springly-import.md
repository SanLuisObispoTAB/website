# Importing SLOTAB's existing data into Springly

**Status:** Research / planning. Real source spreadsheets not yet received —
this doc captures (a) what we know Springly supports, (b) the canonical
column shape we want SLOTAB's source spreadsheets in *before* we hand them
to Springly, and (c) sample test CSVs in `docs/springly/` we can dry-run
the import against once we have admin access.

Related decisions: **#8**, **#48**, **#49** in `docs/project-status.md`.

---

## What Springly provides (as of 2026-05)

Springly markets a spreadsheet → CRM import flow on every Serenity-tier
plan. The public marketing pages are consistent on the shape but thin on
specifics; the actual field-mapping wizard lives behind the admin login.
What we can confirm from Springly's own pages:

| Capability | Source |
|---|---|
| Import contacts from Excel / spreadsheet via copy-paste | [Springly CRM features page](https://www.springly.org/en-us/features/crm-nonprofit/) |
| Field auto-detection during import ("all fields will automatically be configured to your needs") | Springly CRM page |
| Export back to Excel / PDF | [Serenity tier page](https://www.springly.org/en-us/pricing/serenity/) |
| Custom fields for name, email, address, phone, plus user-defined fields | Springly CRM page |
| Groups / segments / categories on contacts | Springly CRM page |
| Membership campaigns w/ tier pricing, renewals, reminders | Serenity tier page |

What we **don't** know from the public pages — and need to confirm by
logging into the SLOTAB Springly admin once Owner access is sorted (per
decision #48):

- The exact column names Springly's import wizard expects (vs. the
  free-form auto-detection it advertises)
- Maximum row count per import; whether large CSVs are chunked
- Whether membership tier + renewal date can be set at import time, or
  whether contacts come in and then a separate membership-enroll step
  runs
- Whether sponsor entries are modeled as "Contact = business" with a
  custom-field-flag for sponsor type, or as a separate Organization
  entity (this affects how we shape `test-sponsors.csv`)
- Whether donation history can be back-filled at import (relevant if
  Trina hands us a multi-year donor ledger)
- Dedup behavior: does Springly merge on email match, or always create
  new rows?

**Recommendation for the discovery step**: once Owner access is sorted
and Erik can see the **Contacts → Import** screen, capture screenshots
of (1) the wizard's required-vs-optional fields, (2) the custom-field
creation UI, and (3) any sample template Springly offers for download.
Paste those into a `docs/springly/import-wizard-screens/` folder so we
have a fixed reference for the column mapping that follows. The
**Membership API documentation** at the same time will clarify whether
tier + renewal can be set in one import or must be a follow-up enroll.

---

## Canonical column shape for SLOTAB source spreadsheets

Regardless of which import path we land on (Springly's native wizard,
Zapier webhook, or direct REST POST to `/contacts`), the data should
live in two clean CSVs with the columns below. Structuring it this way
*now* — before real data arrives — means whatever Trina / Phil / the
outgoing board hands over can be normalized once and re-used across all
three paths.

### Members (individual + household donors)

| Column | Required | Notes |
|---|---|---|
| `external_id` | ✅ | Stable ID we control (e.g. `m-2026-001`). Survives re-imports and lets us dedup. |
| `record_type` | ✅ | `individual` or `household`. Household = a couple/family treated as one membership. |
| `first_name` | ✅ if individual | Primary household member if `record_type=household`. |
| `last_name` | ✅ | |
| `second_first_name` | optional | Spouse first name for households. |
| `second_last_name` | optional | Only fill if different from primary. |
| `display_name` | ✅ | What we render on a sponsor wall / receipt ("Tom & Nicole Katona", "Wallace Family"). Springly imports use this as fallback when first/last are blank. |
| `email` | ✅ | Lowercase, single primary. Dedup key. |
| `email_secondary` | optional | Spouse's email if both want comms. |
| `phone` | optional | Free-form; we normalize on import side. |
| `address1` | optional | Mailing address — needed for tax-letter generation. |
| `address2` | optional | |
| `city` | optional | |
| `state` | optional | 2-letter, US. |
| `zip` | optional | 5-digit, US. |
| `tier` | ✅ | One of `Supporter` / `Fan` / `Booster` / `Champion` / `Patron`. Coaches use `Coach` tier (comp). |
| `tier_qualifying_amount` | optional | Dollar amount that qualified them (annual). Useful for "upgrade prompt" emails. |
| `joined_date` | ✅ | ISO `YYYY-MM-DD`. First-ever membership date. |
| `renewal_date` | ✅ | ISO `YYYY-MM-DD`. Anniversary or fiscal-year end, depending on tier rules. |
| `recurring_monthly` | ✅ | `yes` / `no`. Marks the $10/mo+ recurring crowd separately from annual writers. |
| `status` | ✅ | `active` / `lapsed` / `pending`. |
| `display_on_wall` | ✅ | `yes` / `no`. Matches the consent checkbox in the donate form. |
| `tags` | optional | Semicolon-separated. Examples: `football-parent;senior-2026;coach-of-tennis`. |
| `notes` | optional | Free-form. Tribal knowledge stays here. |
| `source` | optional | Where they came from: `website`, `springly-form`, `square`, `paper-form`, `legacy-import`. |

### Sponsors (businesses)

| Column | Required | Notes |
|---|---|---|
| `external_id` | ✅ | `s-2026-001`-style. |
| `business_name` | ✅ | Legal / DBA name as it should appear on the sponsor wall. |
| `tier` | ✅ | `Platinum` / `Gold` / `Silver` / `Bronze`. |
| `annual_amount` | ✅ | Dollar amount sponsored this cycle. Tier and amount can disagree (e.g. in-kind Platinum); record both. |
| `in_kind` | ✅ | `yes` / `no`. In-kind sponsors get a separate Trina workflow. |
| `primary_contact_first` | ✅ | |
| `primary_contact_last` | ✅ | |
| `primary_contact_email` | ✅ | Dedup key. |
| `primary_contact_phone` | optional | |
| `website_url` | optional | Lights up the clickable logo on `/membership` (#35). |
| `logo_filename` | optional | Filename we'll drop in `public/sponsors/`. Strip path. |
| `address1`, `city`, `state`, `zip` | optional | For thank-you letters. |
| `joined_date` | ✅ | First-ever sponsorship cycle. |
| `renewal_date` | ✅ | Most cycles renew 2026-08-01 (fiscal year start). |
| `status` | ✅ | `active` / `lapsed` / `pending`. |
| `tags` | optional | `bash-table-host;mvp-club;multi-year`. |
| `notes` | optional | "Owner is alumni — likes to be called before renewal" type stuff. |
| `source` | optional | `outreach`, `inbound-form`, `legacy`, `referral`. |

### Why two files, not one

Springly treats individuals and businesses both as "contacts" under the
hood, but the column shapes diverge enough (and the workflows on top of
them — membership renewal vs. sponsor logo rotation) that one
combined CSV always ends up with half the columns blank per row. Two
clean CSVs import faster, are easier to QA visually, and map 1:1 onto
the two existing API stubs at
[src/app/api/springly/member/route.ts](src/app/api/springly/member/route.ts)
and
[src/app/api/springly/sponsor/route.ts](src/app/api/springly/sponsor/route.ts).

---

## Test CSVs in this folder

- [`springly/test-members.csv`](springly/test-members.csv) — 12 fake
  individual + household donors across all 5 tiers, plus one `Coach`
  entry and one `lapsed` row to exercise that filter
- [`springly/test-sponsors.csv`](springly/test-sponsors.csv) — 8 fake
  businesses across all 4 sponsor tiers, including one in-kind and one
  lapsed renewal

The names are intentionally fake (no overlap with the real SLOTAB
member/sponsor lists). Drop these into Springly's import wizard once
we have admin access and capture (a) what fields the wizard auto-maps
correctly, (b) what it asks us to manually map, (c) what custom fields
it offers to create on the fly.

---

## Likely gotchas we'll hit on real data

These are the things that almost always go wrong on a first nonprofit
CRM import — worth eyeballing the source spreadsheets for *before* we
run them through Springly:

1. **Households as a single row vs. two rows.** A couple who donates
   once a year as "Tom & Nicole Katona" should be one record with both
   emails, not two records. If the source spreadsheet has them as two
   rows, we'll see double-counted donor totals and double tax letters.
2. **Inconsistent tier naming.** "TIGER PRIDE" vs. "Tiger Pride" vs.
   "tiger-pride" — Springly will treat these as three different
   custom-field values. Normalize before import.
3. **Joined vs. renewal date confusion.** Some boards track "first
   ever joined" only; some track "renewed this year"; some overwrite
   one with the other. Keep both columns; if only one is available,
   use it for `renewal_date` and leave `joined_date` blank.
4. **Recurring donors imported as annual writers.** A $10/mo recurring
   donor at Square will look like 12 separate $10 donations in the
   ledger. Tag them `recurring_monthly=yes` in the source spreadsheet
   so we don't import each month as a new membership.
5. **Free-text addresses.** Trina-era ledgers often have addresses in
   one field — "123 Oak St, San Luis Obispo CA 93401" — instead of
   normalized columns. Springly handles this if mapped to a single
   address field, but downstream mail-merges break. Split before
   import.
6. **Lapsed records still marked active.** A membership that ended in
   2024 but never got marked lapsed will look like a 2-year-overdue
   renewal in Springly. Audit `renewal_date` against today before
   importing — anything more than 90 days past should default to
   `lapsed`.
7. **Email collisions on shared family addresses.** Coaches whose
   spouses are also boosters, parents who use one shared email — these
   will dedup on email and lose information. Mark them explicitly
   (`household` record_type) with both names on one row.
8. **In-kind sponsors.** A sponsor who donates $5K of catering instead
   of cash. Tier shows Platinum on the wall, but `annual_amount` is
   $0 in Trina's books. `in_kind=yes` keeps the wall logic clean
   without messing up the books.

---

## Next steps (in order)

1. **Unblock Springly Owner access** (#48) — required to see the actual
   import wizard.
2. **Capture import-wizard screens** into `docs/springly/import-wizard-screens/`
   for a fixed mapping reference.
3. **Receive real source spreadsheets** — likely from Trina (members /
   donors) and from the sponsorship lead (sponsor list).
4. **Normalize source → canonical columns** in a one-shot script
   (probably a small Node script in `scripts/normalize-springly-import.ts`).
5. **Dry-run import** of the normalized CSVs against a Springly
   sandbox or a test segment; verify dedup and tier-assignment behavior.
6. **Full import** + audit pass against the source totals.
7. **Wire `/admin-portal` to live Springly data** (replaces stub mode).

---

## Why we're not using Zapier as the primary path

Decision #48 lists Zapier as Plan B if Springly API access stays
blocked. Worth being explicit about why it's Plan B, not Plan A:

- Zapier adds a third party with a recurring cost (~$20/mo) and a
  failure mode neither the board nor Erik will easily debug.
- Springly's REST contacts endpoint already works in our two API stubs
  for the on-website join/sponsor forms; one-shot bulk import wants
  the same path.
- The native Springly import wizard skips both — copy-paste from a
  spreadsheet, no API key needed at all.

The native wizard is the fastest path for the historical-data bulk
import. The two API stubs handle the ongoing daily creation of new
members + sponsors from the live website. Zapier stays in reserve in
case Owner-level API key access is denied long-term.
