"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { teamPhotoFor, teamPhotoPairFor } from "../data/team-photos";

type TeamIndexEntry = {
  slug: string;
  name: string;
  /** Absent for a team with no gender designation — the card omits the
   *  label rather than printing an empty chip. */
  gender?: string;
  season: string;
  /** Set when a team runs across more than one season — see seasons.ts. */
  seasons?: string[];
  hasPage: boolean;
};

type Group = { season: string; teams: TeamIndexEntry[] };

/** Index card photo for a co-ed program that runs boys and girls as one team.
 *  Both squads are rendered stacked; CSS crossfades to the other on hover or
 *  keyboard focus, so neither is permanently the face of the program.
 *
 *  Which one leads is random *per page load*, but the randomness has to wait
 *  for mount: picking during render would make the server and client disagree
 *  and blow up hydration. So the server always emits boys-first, and the coin
 *  flip happens in an effect. The swap is a class toggle on markup that is
 *  already identical on both sides, so nothing re-renders visibly. */
function CoedCardPhoto({
  pair,
  name,
}: {
  pair: { boys: string; girls: string };
  name: string;
}) {
  const [girlsLead, setGirlsLead] = useState(false);
  useEffect(() => {
    setGirlsLead(Math.random() < 0.5);
  }, []);

  const lead = girlsLead ? pair.girls : pair.boys;
  const trail = girlsLead ? pair.boys : pair.girls;
  const leadLabel = girlsLead ? "girls" : "boys";
  const trailLabel = girlsLead ? "boys" : "girls";

  return (
    <div className="slotab-team-card-photo is-pair">
      <Image
        src={lead}
        alt={`${name} ${leadLabel} team`}
        fill
        sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 270px"
        className="slotab-team-card-photo-lead"
      />
      <Image
        src={trail}
        alt={`${name} ${trailLabel} team`}
        fill
        sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 270px"
        className="slotab-team-card-photo-trail"
      />
    </div>
  );
}

export default function TeamsIndexList({ groups }: { groups: Group[] }) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [focusedSeason, setFocusedSeason] = useState<string>(
    groups[0]?.season ?? "",
  );

  useEffect(() => {
    const nodes = sectionRefs.current.filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    // Track each section's current intersection ratio; pick the highest.
    // Threshold list gives smooth handoff as the user scrolls between sections.
    const ratios = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const season = (e.target as HTMLElement).dataset.season ?? "";
          ratios.set(season, e.intersectionRatio);
        }
        let bestSeason = focusedSeason;
        let bestRatio = -1;
        for (const [season, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r;
            bestSeason = season;
          }
        }
        // Require a minimum visibility before changing focus, so a sliver
        // of the next section doesn't yank focus prematurely.
        if (bestRatio > 0.15 && bestSeason !== focusedSeason) {
          setFocusedSeason(bestSeason);
        }
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );

    for (const n of nodes) obs.observe(n);
    return () => obs.disconnect();
  }, [focusedSeason]);

  return (
    <>
      {groups.map((g, idx) => {
        const isFocused = g.season === focusedSeason;
        return (
          <section
            key={g.season}
            ref={(el) => {
              sectionRefs.current[idx] = el;
            }}
            data-season={g.season}
            className={`slotab-section slotab-teams-season-section${
              isFocused ? " is-focused" : ""
            }`}
            style={{
              background:
                g.season === "Fall" || g.season === "Spring"
                  ? "var(--slotab-bg-alt)"
                  : "#fff",
            }}
          >
            <div className="slotab-container">
              <div className="slotab-section-title">
                <span className="slotab-kicker">{g.season} Season</span>
                <h2>
                  {g.teams.length}{" "}
                  {g.teams.length === 1 ? "program" : "programs"}
                </h2>
              </div>
              <div className="slotab-teams-grid slotab-teams-grid-photo">
                {g.teams.map((t) => {
                  const pair = teamPhotoPairFor(t.slug);
                  const inner = (
                    <>
                      {pair ? (
                        <CoedCardPhoto pair={pair} name={t.name} />
                      ) : (
                        <div className="slotab-team-card-photo">
                          <Image
                            src={teamPhotoFor(t.slug)}
                            alt=""
                            fill
                            sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 270px"
                          />
                        </div>
                      )}
                      <div className="slotab-team-card-body">
                        {t.gender && (
                          <div className="slotab-team-card-gender">
                            {t.gender}
                          </div>
                        )}
                        <div className="slotab-team-card-name">{t.name}</div>
                        <div className="slotab-team-card-cta">
                          {t.hasPage ? "View team →" : "Coming soon"}
                        </div>
                      </div>
                    </>
                  );
                  return t.hasPage ? (
                    <Link
                      key={t.slug}
                      href={`/teams/${t.slug}`}
                      className="slotab-team-card"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={t.slug}
                      className="slotab-team-card soon"
                      aria-disabled
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
