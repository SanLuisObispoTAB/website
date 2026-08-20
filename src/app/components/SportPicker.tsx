"use client";

import teamsData from "../data/teams.json";

type Team = { slug: string; name: string; gender?: string };

/** Every designation, labelled exactly as `/donate`'s dropdown labels it, so a
 *  sponsor and a parent see the same sport described the same way. */
export const SPORT_OPTIONS = (teamsData.teams as Team[])
  .map((t) => ({
    slug: t.slug,
    label:
      !t.gender || t.gender === "Co-ed" ? t.name : `${t.name} (${t.gender})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Shared by the tier cards on /membership and the business tab of the donate
// box. One component rather than two copies: the two surfaces offer the same
// perk, and this session has repeatedly cost time to the same root cause —
// the same fact stated in two places, drifting apart.
export default function SportPicker({
  limit,
  picked,
  onChange,
  idPrefix,
}: {
  /** The tier's `sportsCredit`. The server re-checks it; this is the courtesy. */
  limit: number;
  picked: string[];
  onChange: (next: string[]) => void;
  /** Keeps checkbox ids unique when several pickers share a page. */
  idPrefix: string;
}) {
  const atLimit = picked.length >= limit;

  return (
    <>
      <div className="slotab-sport-picker-grid" role="group">
        {SPORT_OPTIONS.map((t) => {
          const on = picked.includes(t.slug);
          // Disabled rather than hidden once the allowance is used up — a
          // vanished option reads as a bug, a dimmed one reads as a limit.
          const blocked = !on && atLimit;
          return (
            <label
              key={t.slug}
              htmlFor={`${idPrefix}-${t.slug}`}
              className={`slotab-sport-option${blocked ? " blocked" : ""}`}
            >
              <input
                id={`${idPrefix}-${t.slug}`}
                type="checkbox"
                checked={on}
                disabled={blocked}
                onChange={() =>
                  onChange(
                    on
                      ? picked.filter((s) => s !== t.slug)
                      : [...picked, t.slug],
                  )
                }
              />
              <span>{t.label}</span>
            </label>
          );
        })}
      </div>

      <p className="slotab-sport-picker-count" aria-live="polite">
        {picked.length} of {limit} chosen
        {picked.length === 0 && " — optional, you can skip this"}
      </p>
    </>
  );
}
