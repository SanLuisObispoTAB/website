# SLOTAB website

San Luis Obispo Tiger Athletic Booster Club — `slotab.org`.

Next.js static site. Prototype/staging phase: board is reviewing the
preview before the domain cutover from the current WordPress site.

## Getting started

```
npm install
npm run dev
```

Site runs at <http://localhost:3000>.

## Production build

```
npm run build
npm start
```

## Editing content (for board members)

Content editors use the Decap CMS admin at `/admin` — no code, no
terminal. Covered in detail in [docs/decap-setup.md](docs/decap-setup.md).

Three data files that live outside the CMS are refreshed automatically
by the weekly GitHub Actions cron:

- `src/app/data/weekly-events.json` — SLOHS athletic dept weekly schedule
- `src/app/data/tnn-videos.json` — Tiger News Network YouTube videos
  tagged by sport
- Run locally: `npm run update-events`

## Deploy

Hosted on Vercel; auto-deploys on push to `main`.

**GitHub repo:** <https://github.com/SanLuisObispoTAB/website>

### First-deploy checklist

When this repo first gets pointed at a Vercel project (and later when
the domain cuts over to slotab.org), a few things need to be filled in:

1. **`public/admin/config.yml`** — already wired to
   `SanLuisObispoTAB/website`. Swap `https://slotab.org` for the
   actual deploy URL if different during staging.
2. **GitHub OAuth App** — create one at <https://github.com/settings/developers>
   with callback URL `<deploy-url>/api/decap/callback`. Then add the
   client ID + secret as `DECAP_GITHUB_CLIENT_ID` and
   `DECAP_GITHUB_CLIENT_SECRET` on Vercel. Full walkthrough in
   [docs/decap-setup.md](docs/decap-setup.md).
3. **Springly env vars** (optional, for the join form to create real
   Springly records) — `SPRINGLY_API_BASE` and `SPRINGLY_API_KEY`.
   Without them, the form still works but responses are stubbed.
4. **Square transaction notifications** (`/api/square/webhook`) — emails the
   Membership VP the moment Square confirms a payment: a perk-fulfilment
   handoff for a business sponsorship, and for a donation a numbered **to-do
   list** — thank-you or IRS acknowledgement, donor wall, whatever the gift's
   level owes, and which team liaisons to tell. Both checklists are *generated*
   from `sponsor-tiers.ts` and the team JSONs, never written out, so revising
   the board's sheet revises the emails. That second one is not a nicety —
   since the checkout cutover (#181) Square's own
   notification is a bare *payment received*, where the old storefront raised
   an *order* notification naming the item and the buyer, and Square exposes no
   setting to change either (#187). **Needs all four of these**, and says so in
   the logs rather than failing quietly. **Don't guess whether they're set —
   look:** `/board` reads them live and shows 🔴 off / 🟡 half on / ✅ on
   (#188). From outside the board password,
   `curl -X POST https://slotab.org/api/square/webhook -d '{}'` answers **401**
   when the signature key and URL are set (it rejected an unsigned caller) and
   **503** when they are not:
   - `SQUARE_WEBHOOK_SIGNATURE_KEY` — from Square Dashboard → Developers →
     Webhooks, after subscribing to **`payment.updated`** with the
     notification URL `https://slotab.org/api/square/webhook`.
   - `SQUARE_WEBHOOK_URL` — that same URL, character for character. Square
     signs the URL string *as you configured it*, so a trailing slash or a
     `www.` difference fails every signature. **May hold several URLs,
     comma-separated**, and the canonical/alias sibling is added automatically
     — see below for why that matters.

   **The path trap that cost this integration several days (#191).** The live
   subscription was created with `https://slotab.org/api/webhook`, one segment
   short of the route, so every `payment.updated` 404'd and no email ever sent
   while the configuration looked complete. `/api/webhook` is now a working
   **alias** for `/api/square/webhook`, and the signature check accepts either,
   so both spellings work. `/board` shows which URLs are accepted. If you edit
   the subscription URL in Square, check it against that list.
   - `RESEND_API_KEY` and `EMAIL_FROM` — the mailer. `EMAIL_FROM` must be on
     a domain verified in Resend, or sends fail with a 422.

   Optional: `SPONSOR_FULFILMENT_EMAIL` and `DONATION_NOTIFICATION_EMAIL`
   override the recipients, both defaulting to `slotabmembership@gmail.com`.
   They are separate variables on purpose — a sponsorship handoff is a work
   order and a donation notice is a heads-up, so the board can send the second
   somewhere the first should not go. Test it end to end from Square's
   dashboard — the webhook page can replay a sample event, and sandbox works if
   `SQUARE_ENVIRONMENT` is `sandbox`.
5. **Weekly scraper workflow** — in `.github/workflows/update-events.yml`,
   the committer email `erik@ravens-peak-consulting.com` should be
   updated to whoever owns the production Vercel team account (Vercel
   only auto-deploys commits authored by a team member).
6. **Drop `robots: noindex`** in `src/app/layout.tsx` once the domain
   cutover lands at slotab.org. The flag is there now so the staging
   URL isn't indexed before the real domain is live.

## Structure

```
src/app/
├── layout.tsx              Root HTML layout + font loading + scoped CSS wrapper
├── globals.css             Minimal reset
├── slotab.css              All scoped site styling under .slotab-scope
├── page.tsx                Home
├── about/                  About
├── impact/                 Impact ledger (donor-funded purchases)
├── membership/             Sponsors/Members + Join form
├── teams/                  Team index + per-team pages
├── hall-of-fame/           HOF page + inductee roster
├── watch/                  Hudl game embeds
├── upcoming/               Filterable events feed
├── admin-portal/           Springly board admin stub
├── components/             Shared React components
├── data/                   Editable JSON content (Decap sources + scraper outputs)
└── api/
    ├── decap/              GitHub OAuth proxy for CMS commits
    └── springly/           Stub API routes for member/sponsor forms

public/
├── admin/                  Decap CMS HTML shell + config.yml
├── admin.html              Served at /admin via next.config.ts rewrite
├── photos/                 Hero carousel and team photos
├── sponsors/               Sponsor logos by tier
├── logos/                  SLOTAB identity marks
├── merch/                  Sport-specific shirt designs
└── ... more assets
```

## Useful docs

- [`docs/migration-plan.md`](docs/migration-plan.md) — board one-pager
  on the move from GoDaddy WordPress to this site.
- [`docs/decap-setup.md`](docs/decap-setup.md) — CMS admin setup
  (GitHub OAuth App + Vercel env vars + editor invitations).
- [`docs/team-comms-kit.md`](docs/team-comms-kit.md) — the team-site
  architecture (Standard Kit of Remind + BAND + ParentSquare, opt-out
  for coaches with their own tools, onboarding checklist).
