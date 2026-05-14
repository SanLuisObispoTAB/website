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
- **Decap CMS** is at `/admin` — collections in `public/admin/config.yml`.
  Any new editable data file needs a matching collection there.
- **Custom worktrees** live under `.claude/worktrees/`. Commit from
  the worktree; push with `git push origin HEAD:main` (the worktree
  branch tracks `origin/main`, so a fast-forward push is the standard
  ship path).
- **Cron commits** to `weekly-events.json` and similar happen from the
  GitHub Actions workflow. If `git push` is rejected, fetch + rebase —
  don't force.
- **Robots noindex** is on until the slotab.org cutover. Don't remove
  the `robots: noindex` from `src/app/layout.tsx` until then.
- **No comms-channel features on team pages** — Home Campus is the
  source of truth for game schedules and changes (decision #40).
- **/watch is the Hudl BlueFrame portal embed**, not a custom catalog.
  See decision #59. Don't recreate the custom catalog without the
  user explicitly asking for it back.
