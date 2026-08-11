# slotab.org DNS Cutover — Runbook

**For:** Erik · **Written:** 2026-08-11 · **Est. hands-on time:** 30–40 min,
plus a wait for DNS to propagate.

The code side is done and deployed (decision #100). This document is the
part only you can do, because it needs registrar and Vercel dashboard
access.

---

## Your actual setup (verified 2026-08-11, not assumed)

| Thing | Value |
|---|---|
| Vercel account/team | **eramberg-9955's projects** (`eramberg-9955s-projects`) |
| Vercel project | **slo-tab-website** (Next.js) |
| Project dashboard | <https://vercel.com/eramberg-9955s-projects/slo-tab-website> |
| GitHub repo | `SanLuisObispoTAB/website`, branch `main` (public) |
| Domains already on the project | `slo-tab-website.vercel.app`, `slotab.ravens-peak-consulting.com` |
| Latest production deploy | commit `c82ece4`, state READY |

> **Note on the docs:** decisions #67/#69 describe the deploy target as a
> separate "Raven's Peak Vercel team." That isn't how it looks today —
> there is **one** Vercel account holding two projects (`slo-tab-website`
> and `ravens-peak-consulting`). Nothing is wrong; just don't go hunting
> for a second team when you log in.

---

## ⛔ Before you touch anything — the one that bites people

### 0.1 Check whether slotab.org handles email

If slotab.org has MX records (Google Workspace, GoDaddy email, anything),
and you change nameservers, **email stops arriving**. Run this first:

```bash
dig +short MX slotab.org
```

- **Empty output** → no mail on the domain. You're clear. (Likely, since
  the whole board uses `@gmail.com` addresses.)
- **Any output** → mail IS configured. That's fine, but it makes Step 2's
  "records only, never nameservers" rule non-negotiable.

### 0.2 Photograph the current DNS so you can roll back

```bash
dig +short A slotab.org; dig +short CNAME www.slotab.org; dig +short NS slotab.org; dig +short TXT slotab.org
```

Paste the output into a note. If anything goes wrong, this is how you put
it back.

### 0.3 Confirm the new site is actually healthy right now

Open <https://slo-tab-website.vercel.app> and click through Home,
Membership, Teams, Booster Bash. If something's broken here, it will be
broken on slotab.org too — fix first, cut over after.

### 0.4 (Optional but nice) Lower the TTL

In your registrar's DNS panel, set the TTL on the existing `slotab.org` A
record to **600 seconds** and save. Wait an hour before Step 2. This makes
the switch propagate in minutes instead of hours, and makes a rollback
fast too. Skip it if you'd rather just accept a slower switch.

---

## Step 1 — Add the domains in Vercel (do this BEFORE changing DNS)

Adding the domain first lets Vercel start issuing the SSL certificate and,
more importantly, **it will show you the exact DNS records to use**.

1. Go to <https://vercel.com/eramberg-9955s-projects/slo-tab-website>
2. **Settings** → **Domains**
3. In the input, type `slotab.org` → **Add**
4. Vercel will ask how you want to handle `www`. Choose:
   **"Add slotab.org and redirect www.slotab.org to it"**
   (apex is primary, www redirects — matches the canonical URL the site
   already advertises in its sitemap and meta tags)
5. Both entries now appear with **"Invalid Configuration"** and a red dot.
   **This is expected** — DNS hasn't been pointed yet.
6. Click **"View DNS Records / Configure"** next to `slotab.org`.

**📋 Copy the exact values Vercel shows you on that screen.** They are
typically:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

…but Vercel's own docs say these are *general* values and to use whatever
your domain screen recommends. **Vercel's screen wins over this table.**

---

## Step 2 — Point DNS at Vercel (at your registrar)

> ### ⚠️ Change RECORDS. Do not change NAMESERVERS.
> Vercel will offer "or, change your nameservers to ns1.vercel-dns.com…".
> **Don't.** Moving nameservers hands Vercel your entire DNS zone and drops
> every record you don't recreate — MX (email), TXT/SPF, and any
> verification records. Editing two records is safer and fully reversible.

At the registrar that controls slotab.org (almost certainly GoDaddy →
**My Products → Domains → slotab.org → DNS → Manage Zones**):

1. **Find the existing `A` record for `@`** (host `@`, pointing at a
   GoDaddy/WordPress IP). **Edit** it — change the value to the IP from
   Step 1. Don't add a second one; there must be exactly one A record
   for `@`.
2. **Find or create the `CNAME` for `www`.** Set its value to the target
   from Step 1. If a `www` **A record** exists instead, delete it — you
   can't have both an A and a CNAME on the same name.
3. **Delete anything that conflicts:**
   - Extra `A` or `AAAA` records on `@`
   - GoDaddy **"Domain Forwarding"** or parked-page entries — check
     under the Forwarding section and remove any forward on the root
     domain. This silently overrides your A record if left on.
   - Any old `CNAME` on `@` (invalid anyway, but some panels allow it)
4. **Leave alone:** MX records, TXT/SPF/DKIM, and anything you don't
   recognise. Those aren't yours to break today.
5. Save.

---

## Step 3 — Wait, then verify

Give it 10–30 minutes (or up to a few hours if you skipped the TTL step).

```bash
dig +short A slotab.org          # expect the Vercel IP from Step 1
dig +short CNAME www.slotab.org  # expect the Vercel CNAME target
```

Then in Vercel → Settings → Domains, both entries should flip to
**"Valid Configuration"** with a green check, and the certificate issues
automatically within a minute or two.

**If it still says Invalid after 30 minutes:** click **Refresh** on the
domain row. If it persists, the usual culprits are a leftover second A
record, or GoDaddy domain forwarding still switched on.

---

## Step 4 — Verify the live site (the site-specific checks)

Once `https://slotab.org` loads:

```bash
# 1. The real site, and it IS indexable (no X-Robots-Tag at all)
curl -sI https://slotab.org | grep -i "x-robots-tag" || echo "OK — indexable"

# 2. The firewall alias still works but is NOT indexable
curl -sI https://slotab.ravens-peak-consulting.com | grep -i "x-robots-tag"
#    expect: x-robots-tag: noindex, nofollow

# 3. www redirects to the apex
curl -sI https://www.slotab.org | grep -iE "^(HTTP|location)"

# 4. Crawler files are live
curl -s https://slotab.org/robots.txt
curl -s https://slotab.org/sitemap.xml | head -5
```

Then by hand in a browser:

- [ ] Home page loads with photos and the ticker
- [ ] **Cookie banner appears**, Accept and Decline both work
- [ ] `/privacy` loads and shows your own record after accepting
- [ ] **`https://slotab.org/admin` — log in with GitHub.** This is the
      one most likely to surprise you; see Step 6.
- [ ] `/board` still asks for the password
- [ ] **The one unverified path:** open `/membership`, scroll down to the
      sponsor logo wall, then go to `/privacy` — "Sections reached" should
      now include `sponsorship`. (I couldn't test this locally; the
      preview pane freezes the browser API it depends on.)

---

## Step 5 — Tell Google the site exists

1. <https://search.google.com/search-console> → **Add property** →
   **URL prefix** → `https://slotab.org`
2. Verify via the **DNS TXT record** method (add the TXT record at the
   registrar — this is additive and safe) or the HTML tag method (tell me
   and I'll add the tag).
3. Once verified: **Sitemaps** → submit `sitemap.xml`
4. **Removals → Outdated content** — if the old WordPress site has pages
   indexed that no longer exist, you can request their removal here.

---

## Step 6 — The /admin fix that MUST be done as one change

**Right now `slotab.org/admin` will load and login will work** — I already
allowlisted slotab.org for the OAuth handshake back in decision #65. So
this isn't urgent. But two settings still name the old Vercel URL, and
they have to move together:

> ⚠️ **Change either one alone and every board member loses `/admin`
> login.** The OAuth handshake round-trips through whatever `base_url`
> says, and GitHub will only redirect back to a URL registered on the
> OAuth App. Mismatch = broken login for everyone.

**Your half:**
1. <https://github.com/settings/developers> → **OAuth Apps** → the SLOTAB
   Decap app
2. **Authorization callback URL** → change to
   `https://slotab.org/api/decap/callback`
3. Save, and tell me you've done it

**My half:** I change `base_url` in `public/admin/config.yml` from
`https://slo-tab-website.vercel.app` to `https://slotab.org`, push, and we
test a login together.

Do these within a few minutes of each other. If it breaks, reverting the
callback URL restores service immediately.

---

## Step 7 — Cancel GoDaddy WordPress (wait 48 hours)

**Do not do this on cutover day.** Wait until slotab.org has been serving
the new site correctly for two days.

> ### ⚠️ Cancel the HOSTING. Never the DOMAIN.
> In GoDaddy these sit next to each other and read almost identically.
> - ✅ Cancel: **Managed WordPress** / **Web Hosting** product
> - ⛔ Do NOT cancel, transfer, or let lapse: the **slotab.org domain
>   registration**. If the registration goes, the DNS records you just set
>   go with it and the site disappears.

Before cancelling:
1. **Take a full backup** of the WordPress site (GoDaddy offers an
   export/download). Once it's gone, any old content, PDFs, or photos not
   copied into the new site are gone for good.
2. Confirm again that `dig +short A slotab.org` still returns the Vercel
   IP — i.e. DNS is genuinely independent of the hosting product.
3. Then cancel.

---

## If something goes wrong — rollback

DNS changes are fully reversible. Put back the values you saved in step
0.2 (the original A record for `@`, and the original `www` record), save,
and wait for the TTL to expire. The old WordPress site returns.

Nothing in the new site's code needs reverting — it happily serves from
the Vercel URL and the ravens-peak alias regardless of where slotab.org
points.

---

## Quick reference — who does what

| # | Step | Who |
|---|---|---|
| 0 | Pre-flight: MX check, record current DNS, lower TTL | Erik |
| 1 | Add `slotab.org` + `www` in Vercel, copy the DNS values | Erik |
| 2 | Edit the A + CNAME records at the registrar (**not** nameservers) | Erik |
| 3 | Wait, confirm "Valid Configuration" | Erik |
| 4 | Verify the live site (checks above) | Erik — tell me anything odd |
| 5 | Search Console + submit sitemap | Erik |
| 6 | OAuth callback URL → then I push the matching `base_url` | Both, together |
| 7 | Cancel GoDaddy **hosting only**, after 48h | Erik |
