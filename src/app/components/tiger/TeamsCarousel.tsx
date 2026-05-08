"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import teamsData from "../../data/teams.json";

type Team = {
  slug: string;
  name: string;
  gender: "Boys" | "Girls" | "Co-ed";
  season: "Fall" | "Winter" | "Spring" | "Year-round";
  hasPage: boolean;
};

// Sport-specific photos. New convention: first letter b/g/c (boys/girls/co-ed),
// then short sport name. Note: `bball` = basketball, `bbaseball` = baseball
// (the latter required because `bball` would otherwise collide). Sports
// without a real photo yet fall back to /photos/cstudent-section.jpg (a
// generic Tigers crowd shot) — see "Missing photos" notes in
// docs/project-status.md.
const PHOTO_BY_SLUG: Record<string, string> = {
  football: "/photos/bfball-fbspargo-1200x857.jpg",
  "girls-volleyball": "/photos/gvball-ahopple.jpg",
  "boys-volleyball": "/photos/bvball-milla.jpg",
  "beach-volleyball": "/photos/gbvball-ruby-1200x675.png",
  baseball: "/photos/bbaseball-team-1200x906.png",
  softball: "/photos/gsball-1200x960.jpg",
  "boys-tennis": "/photos/btennis-team.jpg",
  "girls-tennis": "/photos/gtennis.jpg",
  "boys-water-polo": "/photos/bwpolo-2.jpg",
  "girls-water-polo": "/photos/gwpolo.jpg",
  "boys-basketball": "/photos/bbball-e1765386832968.jpg",
  "girls-basketball": "/photos/gbball-goodwin-1200x900.jpg",
  "boys-soccer": "/photos/bsoccer-1200x800.jpg",
  "girls-soccer": "/photos/gsoccer-old-addisoccerupdate.jpeg",
  "boys-cross-country": "/photos/cXC-image-1200x900.jpeg",
  "girls-cross-country": "/photos/cXC-image-1200x900.jpeg",
  "track-field": "/photos/ctrack-1200x800.jpg",
  "boys-swim-dive": "/photos/bswim-image-0.jpg",
  "girls-swim-dive": "/photos/gswim-10.jpg",
  "boys-golf": "/photos/bgolf-jonnygolf.jpg",
  "girls-golf": "/photos/ggolf-5-1200x896.jpg",
  // Note: blacrosse photo shows Los Gatos jerseys — appears to be a stock/other-school
  // image rather than SLO Tigers. Using as a placeholder until a real SLO lacrosse
  // photo arrives.
  "boys-lacrosse": "/photos/blacrosse-20250501-025-9463.jpeg",
  wrestling: "/photos/bwrestling-checukk.jpg",
  // Note: gfieldhockey photo shows Wilton jerseys — also appears to be a stock/other-school
  // image rather than SLO Tigers. Using as a placeholder until a real SLO field-hockey
  // photo arrives.
  "field-hockey": "/photos/gfieldhockey-JRW_FH_100923_206.jpg",
  "flag-football": "/photos/gfball-saff7-1200x900.jpg",
  cheer: "/photos/ccheering-taryn.jpg",
  stunt: "/photos/cstunt-CHafourd.jpg",
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
