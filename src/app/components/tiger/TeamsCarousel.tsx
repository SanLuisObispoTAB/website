"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import teamsData from "../../data/teams.json";
import { TEAM_PHOTO_BY_SLUG as PHOTO_BY_SLUG } from "../../data/team-photos";

type Team = {
  slug: string;
  name: string;
  gender: "Boys" | "Girls" | "Co-ed";
  season: "Fall" | "Winter" | "Spring" | "Year-round";
  hasPage: boolean;
};

function currentSeason(): Team["season"] {
  const m = new Date().getMonth(); // 0-11
  if (m >= 7 && m <= 9) return "Fall"; // Aug-Oct
  if (m === 10 || m === 11 || m === 0 || m === 1) return "Winter"; // Nov-Feb
  return "Spring"; // Mar-Jun + Jul (off-season previews Spring continuing)
}

function teamHref(t: Team): string {
  return t.hasPage ? `/teams/${t.slug}` : "/teams";
}

function teamLabel(t: Team): string {
  if (t.gender === "Co-ed") return t.name;
  return `${t.gender} ${t.name}`;
}

export default function TeamsCarousel() {
  const season = currentSeason();
  const teams: Team[] = (teamsData.teams as Team[]).filter(
    (t) => t.season === season || t.season === "Year-round",
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".tiger-team-card") as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.9;
    el.scrollBy({ left: step * dir * 1.5, behavior: "smooth" });
  };

  return (
    <section className="tiger-section">
      <div className="tiger-container">
        <div className="tiger-teams-head">
          <div className="tiger-section-head">
            <span className="tiger-eyebrow">{season} Season · In Play Now</span>
            <h2>Every team. Every season.</h2>
          </div>
          <Link href="/teams" className="tiger-ulink">
            View all teams →
          </Link>
        </div>

        <div className="tiger-teams-carousel">
          <button
            type="button"
            className="tiger-teams-arrow prev"
            aria-label="Previous teams"
            onClick={() => scrollByCards(-1)}
            disabled={!canPrev}
          >
            ‹
          </button>
          <div className="tiger-teams-track" ref={trackRef}>
            {teams.map((t) => (
              <Link
                key={t.slug}
                href={teamHref(t)}
                className="tiger-team-card tiger-card-lift"
              >
                <div className="tiger-team-photo">
                  <Image
                    src={PHOTO_BY_SLUG[t.slug] ?? "/photos/about-hero.jpg"}
                    alt={teamLabel(t)}
                    width={400}
                    height={320}
                    sizes="(max-width: 720px) 80vw, 320px"
                  />
                </div>
                <div className="tiger-team-meta">
                  <div>
                    <div className="tiger-team-season">
                      {t.season === "Year-round" ? "Year-Round" : t.season}
                    </div>
                    <div className="tiger-team-name">{teamLabel(t)}</div>
                  </div>
                  <div className="tiger-team-record">
                    {t.hasPage ? "View →" : "Soon"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="tiger-teams-arrow next"
            aria-label="Next teams"
            onClick={() => scrollByCards(1)}
            disabled={!canNext}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
