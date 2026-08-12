# SLOTAB website — instructions for Claude

This is the Next.js static site for the San Luis Obispo Tiger Athletic
Booster Club (slotab.org). Auto-deploys to Vercel on push to `main`.
See `README.md` for build/run, and `docs/project-status.md` for the
living state of decisions, backlog, and pending external inputs.

## Always keep `docs/project-status.md` current

This is the single most important convention for working on this repo.
The status doc is the board's source of truth between meetings — every
decision, every shipped chunk, every external blocker lives there.
After **every** substantive change you ship:

1. **Append a row to the Decisions Log** with today's date, a sequential
   `#`, a one-line summary that explains *why* (not just *what*), and
   the owner. Never edit prior rows.
2. **Move done items** from the *Active Backlog* sections to the *Built*
   block at the bottom (or mark them ✅ in place if they have history
   worth preserving). Update status emoji: ✅ done · 🟡 in progress ·
   🔴 blocked · ⏳ deferred · ❌ removed.
3. **Refresh External Inputs Pending** — strike through resolved rows
   with a date and a one-line "what unblocked it"; add new rows for
   anything new the change surfaced.
4. **Update the `Last updated:` line** at the top of the doc with
   today's date and a short parenthetical of what landed.
5. **Add a session narrative** if the work spans more than 2-3
   decisions in a sitting. Follow the existing `## 2026-05-13 / 14
   session` pattern: short subsections per area with bullets that
   include filenames, decision numbers, and the *narrative* of how the
   work landed (not just outcomes).
6. **Commit the doc update in the same commit** as the code change when
   the change is small. For larger sessions, a separate
   `docs: status update — <thing>` commit after the work commits is
   fine.

If the user has to ask you whether you updated this doc, you missed
the convention.

## Other conventions worth knowing

- **Photo naming**: `<b|g|c><sport>-<descriptor>.jpg`. `b/g/c` =
  boys/girls/co-ed. Convention: `bfball`, `gvball`, `bbball` =
  basketball, `bbaseball` = baseball (`bball` was needed for
  basketball so baseball took a longer prefix), `wpolo`, `XC`, etc.
  Resize new photos to 1200px wide / 82% JPEG quality / metadata
  stripped via `magick <src> -resize 1200x\\> -quality 82 -strip <dst>`.
- **New photos go through `photo-inbox/`** (gitignored), not straight
  into `public/photos/`. Drop files there, then `npm run photo-intake`
  to audit (dup-check, name-convention check, dims),
  `npm run photo-intake -- --rename` to interactively rename misnamed
  drops (suggests sport + gender), and
  `npm run photo-intake -- --process` to resize the ready ones into
  `public/photos/`. See `photo-inbox/README.md` and
  `scripts/photo-intake.mjs` (decisions #77, #78).
- **Decap CMS** is at `/admin` — collections in `public/admin/config.yml`.
  Any new editable data file needs a matching collection there.
- **Custom worktrees** live under `.claude/worktrees/`. Commit from
  the worktree; push with `git push origin HEAD:main` (the worktree
  branch tracks `origin/main`, so a fast-forward push is the standard
  ship path).
- **Cron commits** to `weekly-events.json` and similar happen from the
  GitHub Actions workflow. If `git push` is rejected, fetch + rebase —
  don't force.
- **Indexing is host-aware** as of the 2026-08-11 cutover (decision #100).
  The blanket `robots: noindex` is gone from `src/app/layout.tsx`; instead
  `src/proxy.ts` sets `X-Robots-Tag: noindex` for any Host that isn't in
  `INDEXABLE_HOSTS` (`slotab.org`, `www.slotab.org`). Keep it that way —
  the `slotab.ravens-peak-consulting.com` alias still serves the site for
  the SLOHS firewall and must not be indexed as a duplicate. Add any new
  canonical host to that set.
- **Creating a team page** (decisions #74, #79): add
  `src/app/data/teams/<slug>.json` (mirror an existing one — `heroPhoto`
  = action shot, `teamPhoto` = posed portrait, `gallery` = array of extra
  action shots, one `"Liaison TBD"` placeholder so the quick-facts band
  isn't empty; omit roster/coach/wishlist — those sections self-hide),
  a thin route `src/app/teams/<slug>/page.tsx`, and flip `hasPage: true`
  in `teams.json`. The nav dropdown, home carousel, and `/teams` index
  all pick it up **automatically** — no manual menu edit. The nav lists
  only in-season teams (upcoming Fall during summer) via
  `src/app/data/seasons.ts`. Convention: a team with a posed team photo
  should have a page; show its action shots in the `gallery`.
- **Action slots take action shots only** (decision #108). `heroPhoto`
  and `gallery` are for real in-game photos; posed squad portraits go in
  `teamPhoto`/`teamPhotos`. **If a team has no action shot, leave the
  slot empty** — `gallery` empty hides the whole "In Action" section,
  and an empty `heroPhoto` renders a plain black band (the
  `.slotab-team-hero.no-photo` rule, needed because the hero text is
  white and would vanish over the cream page). Never put a `-team-`
  portrait in an action slot to fill space, and never use the same file
  for `heroPhoto` and `teamPhoto` — that shows one photo twice. Audit
  with: `grep -l '"heroPhoto".*-team' src/app/data/teams/*.json`.
- **`npm run team-audit`** reports what every team page is still missing
  (coach bios, squad portraits, action shots, liaisons) and flags posed
  portraits sitting in action slots. Run it with `-- --write` to
  regenerate `docs/team-page-gaps.md`, and **re-run it after adding any
  team photo or coach info** — the doc is generated, never hand-edited.
  `/teams/cross-country` is the reference page. Football and track &
  field are held to a lower bar (`LARGE_PROGRAMS` in the script): a
  three-level program and an ~18-event program don't fit the
  single-squad template. Multi-squad expectations live in
  `EXPECTED_SQUADS` — add a slug there and the missing squads get
  tracked automatically.
- **Combined teams** (cross country runs boys + girls as one program):
  use `headCoaches: [...]` with a `role` on each ("Head Coach — Boys")
  and `teamPhotos: [{photo, label}]` with a label per squad. Both plural
  forms override their singular counterparts (`headCoach`, `teamPhoto`),
  which stay in place for the 18 single-squad teams.
- **Only `football.json` has a Decap collection.** The other 18 team
  JSONs are code-edit-only — the board cannot edit them at `/admin`.
  Worth fixing if a board member asks to edit a team page themselves.
- **No comms-channel features on team pages** — Home Campus is the
  source of truth for game schedules and changes (decision #40).
- **/watch is the Hudl BlueFrame portal embed**, not a custom catalog.
  See decision #59. Don't recreate the custom catalog without the
  user explicitly asking for it back.
- **Centered text must not end on a short line** (decision #107). A
  centered block ending in fewer than ~4 words strands a word alone in
  the middle of an empty line. The rule is enforced in CSS, not per
  block: `.slotab-prose` gets `text-wrap: pretty`, and every centered
  container gets `text-wrap: balance` — see the *LINE BALANCING* block
  near the top of `src/app/slotab.css`. `text-wrap` inherits, so it's
  set on the container and new copy is covered automatically.
  **When you add a centered block, add its selector to that list**; the
  `[style*="text-align:center"]` selector already catches inline
  `style={{ textAlign: "center" }}`. CSS can't see phrase boundaries, so
  when specific words must never split (a date, a name, an address),
  join them with `&nbsp;` — `.slotab-mail-address` does this (#89).
- **/watch Hudl venues**: streaming covers Holt Field (stadium), the Big
  Gym, and the baseball and softball fields — **not** the pool
  (confirmed 2026-08-11, decision #106). Coverage is also per-coach
  opt-in, so don't write copy promising every team is streamed.
