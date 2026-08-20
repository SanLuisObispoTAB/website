# Finding the owner of Square account `6YKJFPPASVNW3`

**Why this matters:** every donation the club takes today lands in this
account, and nobody on the current board appears to hold it. The new Square
integration is built against a *different* account (`1RZ6X80KDPPNR`), so
launching without resolving this would move donation income somewhere else.
See decision #162. Written to mirror the GoDaddy recovery pack in
`dns-cutover-runbook.md`, because this is the same problem with a different
vendor.

## What is known

| | |
|---|---|
| Merchant ID (storefront) | **`6YKJFPPASVNW3`** |
| Storefront | <https://slotab-3.square.site> — titled *San Luis Obispo Tiger Athletic Boosters* |
| What it sells | 7 memberships, 4 business sponsorships, ~25 per-sport donation items |
| Merchant ID (Erik's account) | `1RZ6X80KDPPNR` — locations `SLOTAB` (INACTIVE) and `SLOTAB Merch` (ACTIVE) |
| How this was established | The embedded `merchant_id` on three storefront product pages, including `/product/volleyball-girls/89`, the item `/donate` falls back to |

The storefront exposes **no contact details at all** — no footer email, no
contact page, no phone. It is a single-page site. So the answer will not come
from the site itself; it has to come from the money or from Square.

## Try these first — they need nobody's permission

Ordered by speed. The first two identify the account without contacting Square
at all, and both are things the club already has.

1. **Trina's QuickBooks connector.** It is authorised against a Square account,
   and the connector's settings page names it — usually the business name and
   the account email. Since donations reconcile through it (#161), it is almost
   certainly pointed at `6YKJFPPASVNW3`. **This is the fastest answer and it is
   entirely internal.**
2. **The bank statement.** Square deposits carry a descriptor and land in a
   specific club bank account. Whoever set that up gave Square those details,
   and the bank record shows which account is depositing.
3. **Any past donation receipt.** Square emails a receipt from the *merchant*,
   showing the business name and a receipt link. Any board member who has
   donated through the storefront has one sitting in their inbox — ask on the
   board thread rather than assuming nobody does.
4. **The Square Dashboard account switcher.** If a single login is attached to
   both businesses, Square shows a business switcher (top-left, or Account →
   Businesses). Erik has already looked and sees only merch — but worth a
   second look now that the merchant IDs are known and can be told apart.

## If those fail — Square Support

Square can look up an account by merchant ID and confirm a **masked** email
without breaching the holder's privacy, the same way GoDaddy support did for
the domain.

**The ask:** *"We are a 501(c)(3) and this Square account is taking donations
on our behalf. Please confirm the masked email on the account that owns
merchant ID `6YKJFPPASVNW3` so we can identify which of our volunteers set it
up."*

| Evidence to bring | Value |
|---|---|
| Merchant ID | `6YKJFPPASVNW3` |
| Storefront under our name | <https://slotab-3.square.site> |
| Organizational ownership | SLO Tiger Athletic Boosters, 501(c)(3), **EIN 45-4897120** |
| Proof of continuity | Trina Cisneros, Treasurer — reconciles this account's deposits today |
| Second account we do control | `1RZ6X80KDPPNR`, same organization |
| Bank account receiving deposits | *(from step 2 above — bring it, it is the strongest proof)* |

A **volunteer-run nonprofit whose treasurer reconciles the deposits** is a
strong ownership claim. If the named holder is unreachable, ask for Square's
process for **transferring account ownership to the organization**.

## Once it is recovered — close the hole

1. **Decide which account is the club's**, and say so in writing to the board.
   Two accounts taking money is the actual defect; identifying the owner only
   makes it visible.
2. **Move the Square account to a SLOTAB-owned email**, not a volunteer's
   personal address — the same failure mode as the GoDaddy account.
3. **Re-point the integration** by generating a production token from the
   surviving account. This is a credentials change; no code changes.
4. **Record it in `/board`** alongside the other logins, so the next treasurer
   does not repeat this.
