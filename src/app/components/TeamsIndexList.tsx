"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { teamPhotoFor } from "../data/team-photos";

type TeamIndexEntry = {
  slug: string;
  name: string;
  gender: string;
  season: string;
  hasPage: boolean;
};

type Group = { season: string; teams: TeamIndexEntry[] };

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
                  const photo = teamPhotoFor(t.slug);
                  const inner = (
                    <>
                      <div className="slotab-team-card-photo">
                        <Image
                          src={photo}
                          alt=""
                          fill
                          sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 270px"
                        />
                      </div>
                      <div className="slotab-team-card-body">
                        <div className="slotab-team-card-gender">
                          {t.gender}
                        </div>
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
