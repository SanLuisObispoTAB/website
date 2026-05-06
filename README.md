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

**GitHub repo:** <https://github.com/eramberg/slo-tab-website>

### First-deploy checklist

When this repo first gets pointed at a Vercel project (and later when
the domain cuts over to slotab.org), a few things need to be filled in:

1. **`public/admin/config.yml`** — already wired to
   `eramberg/slo-tab-website`. If/when the repo is transferred to an
   org, update `backend.repo` here. Also swap `https://slotab.org`
   for the actual deploy URL if different during staging.
2. **GitHub OAuth App** — create one at <https://github.com/settings/developers>
   with callback URL `<deploy-url>/api/decap/callback`. Then add the
   client ID + secret as `DECAP_GITHUB_CLIENT_ID` and
   `DECAP_GITHUB_CLIENT_SECRET` on Vercel. Full walkthrough in
   [docs/decap-setup.md](docs/decap-setup.md).
3. **Springly env vars** (optional, for the join form to create real
   Springly records) — `SPRINGLY_API_BASE` and `SPRINGLY_API_KEY`.
   Without them, the form still works but responses are stubbed.
4. **Weekly scraper workflow** — in `.github/workflows/update-events.yml`,
   the committer email `erik@ravens-peak-consulting.com` should be
   updated to whoever owns the production Vercel team account (Vercel
   only auto-deploys commits authored by a team member).
5. **Drop `robots: noindex`** in `src/app/layout.tsx` once the domain
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
