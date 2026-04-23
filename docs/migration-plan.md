# SLOTAB Website Migration — Board One-Pager

**Prepared for:** SLOHS Tiger Athletic Booster Club Board
**Purpose:** Approve the migration of slotab.org from GoDaddy Managed WordPress to a static Next.js site hosted on Vercel, with a browser-based editor so any board member can update content.

---

## Today vs. Proposed

|                    | Today                                              | Proposed                                       |
| ------------------ | -------------------------------------------------- | ---------------------------------------------- |
| **Platform**       | WordPress + Nectar theme                           | Next.js static site                            |
| **Hosting**        | GoDaddy Managed WordPress                          | Vercel (Hobby plan)                            |
| **DNS**            | GoDaddy                                            | Cloudflare (free)                              |
| **Domain**         | slotab.org @ GoDaddy — owned by SLOTAB             | Unchanged — SLOTAB still owns it               |
| **Content editor** | WordPress admin (one volunteer knows how)          | Decap CMS at slotab.org/admin (GitHub login)   |
| **Annual cost**    | **~$150–300/year** (hosting + renewal + plugins)   | **~$20/year** (just the domain renewal)        |
| **Maintenance**    | Plugin/PHP/theme updates; security patches         | None. Re-deploys on every content save         |
| **Page load**      | ~2–4s (WP + plugins + cache)                       | <0.5s (static files on a CDN edge)             |
| **Who holds the keys** | Whoever has the WP admin password              | GitHub repo owner + named board editors        |

**Net savings:** ~$130–280/year plus the "who knows how to update the site" problem goes away.

---

## The 5-Step Cutover

Total elapsed time: **about 2 hours of technical work + 24–48 hours for DNS to propagate**. Zero downtime if we cut over in the right order.

### 1. Board vote + handoff — *prerequisite*
- Board approves the migration.
- Current webmaster exports any content from the WordPress admin that isn't already on the preview site (photos, recent news posts, anything I missed).
- Designate 2–3 board members who will have edit access through Decap CMS.

### 2. Finalize the preview site — *me, ~2 hours*
- Wire the real "Join Online", "Shop Merch", and "Donate" CTAs to whatever Google Forms, Stripe, or GiveButter accounts the board uses today.
- Replace placeholder copy on About / Membership / Volunteer with final-approved text.
- Board reviews the preview URL one more time and signs off.

### 3. Promote the preview to production — *me, ~30 minutes*
- Move the `/*` code into its own Vercel project called `slotab`.
- Add `slotab.org` and `www.slotab.org` as custom domains in that Vercel project.
- Vercel automatically issues SSL certificates.

### 4. Cut over DNS — *board + me, ~15 minutes*
- Log into the GoDaddy domain panel.
- Change the `A` record and `www CNAME` to point at Vercel's endpoints:
  - `A` → `76.76.21.21`
  - `www CNAME` → `cname.vercel-dns.com`
- **Optional:** move the domain's nameservers to Cloudflare (free) for faster DNS and simpler management later. Not required.
- The old GoDaddy WordPress install stays up at its original IP address during the transition — nothing is deleted yet.

### 5. Monitor for 48 hours, then decommission — *me, ~30 minutes*
- Watch Vercel analytics and uptime for two business days.
- Once confident, cancel the GoDaddy Managed WordPress plan (keep the domain registration — that's a separate line item at GoDaddy).
- Final savings confirmed; migration complete.

---

## Risk & Rollback

- **Rollback:** Revert the DNS `A` record to the old GoDaddy IP. The WordPress install is still running during the 48-hour monitoring window, so rollback is a 5-minute change and ~10 minutes of DNS propagation.
- **Email:** SLOTAB doesn't use `@slotab.org` email addresses (all board contacts are `@gmail.com`). Migrating web hosting does not affect email in any way.
- **SEO:** We're preserving the URL structure of the existing pages. Google's index will carry over automatically.
- **Content in the WordPress database:** anything not on the preview site gets exported in Step 1 and checked into the new site's git repo. Nothing is lost.

---

## What the Board Needs to Approve

1. **Move hosting from GoDaddy Managed WordPress to Vercel.** No cost.
2. **Use Decap CMS** (free, open-source, browser-based editor) with GitHub as the content store.
3. **Designate 2–3 board members** to have edit access through `slotab.org/admin`.
4. **Keep the slotab.org domain at GoDaddy** (or optionally move to Cloudflare later — free either way).
5. **Cancel the GoDaddy Managed WordPress plan** 48 hours after cutover once the new site is confirmed stable.

---

## Projected Budget (Annual)

| Line item                          | Today          | Proposed       |
| ---------------------------------- | -------------- | -------------- |
| Hosting (GoDaddy Managed WP)       | ~$120–180      | $0             |
| Domain renewal (slotab.org)        | ~$20           | ~$20           |
| Nectar theme license               | ~$0–20         | $0             |
| Premium plugins                    | ~$0–80         | $0             |
| **Total**                          | **~$140–300**  | **~$20**       |

All numbers above assume the booster club's actual usage never exceeds Vercel's free tier (it won't — the site gets a few thousand visitors a month and the free tier allows 100 GB/month of bandwidth).

---

*Questions or objections: contact erik@ravens-peak-consulting.com*
