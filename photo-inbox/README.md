# photo-inbox/

Staging folder for new photos. **Drop raw photos here** — not into
`public/photos/` directly.

Everything in this folder except this README is gitignored, so raws never get
committed or deployed by accident. (That accidental pile-up is exactly what
decisions #74–#76 cleaned up.)

## Workflow

1. Drop image files (`.jpg` / `.jpeg` / `.png`) into this folder.
2. Audit them:
   ```
   npm run photo-intake
   ```
   For each drop it reports dimensions + size and flags:
   - **DUPLICATE** — identical content already lives in `public/photos/` (just delete it here).
   - **RENAME** — the filename doesn't match the `<b|g|c><sport>-<descriptor>` convention.
   - **NAME EXISTS** — a different photo already uses that published name.
   - **READY** — passes all checks.
3. Fix any flagged names. Let the helper suggest them interactively — it
   infers the sport + gender (boys/girls/co-ed) from the original filename and
   you accept or edit each:
   ```
   npm run photo-intake -- --rename
   ```
   (Or rename by hand to `<b|g|c><sport>-<descriptor>.jpg`; `b`/`g`/`c` =
   boys/girls/co-ed — see `CLAUDE.md`.) Then process the ready ones:
   ```
   npm run photo-intake -- --process
   ```
   This resizes each into `public/photos/` at 1200px wide / 82% JPEG /
   metadata stripped — the house convention.
4. `git status public/photos/`, eyeball the results, then commit. Wire a photo
   into the site via `src/app/data/team-photos.ts` (index/carousel) or a team
   JSON's `teamPhoto` / `heroPhoto` (`src/app/data/teams/<slug>.json`).

## Flags

- `--rename` — interactively rename misnamed (non-duplicate) drops; suggests a
  convention name from the original filename, you accept (Enter), override
  (type one), or skip (`s`).
- `--process` — resize READY files into `public/photos/`.
- `--keep-originals` — also archive each full-res source to
  `public/photos/originals/<stem>-original.<ext>`. Off by default to keep the
  repo lean (decision #66); use it when a hi-res source is worth preserving in-repo.
- `--force` — allow overwriting an existing `public/photos/` file of the same
  name but different content (use when intentionally replacing a photo).

The inbox copies are left in place after processing (they're gitignored);
delete them once you're happy with the results.
