"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { spreadBySport } from "../../data/spread-by-sport";

type Slide = {
  src: string;
  sport: string;
  /** Athletic season the photo belongs to, so the in-season slides can lead.
   *  "Any" (the student section) is seasonless and sorts after them. */
  season: "Fall" | "Winter" | "Spring" | "Any";
  caption: string;
  /**
   * CSS object-position value applied to this slide's image.
   * Default "center center". Use this to anchor crops on the action
   * — e.g. body-paint chests, players' faces, ball.
   */
  objectPosition?: string;
};

// Order here is a preference, not the final rotation: spreadBySport (below)
// moves slides so the same sport never plays twice in a row.
const SLIDE_LIST: Slide[] = [
  {
    src: "/photos/bfball-tunnel.jpg",
    season: "Fall",
    sport: "Football",
    caption: "Friday night under the lights · Holt Field",
    objectPosition: "center 35%",
  },
  {
    src: "/photos/bfball-helmets.jpg",
    season: "Fall",
    sport: "Football",
    caption: "Tigers helmets up · pre-game ritual",
    objectPosition: "center 30%",
  },
  {
    src: "/photos/gwpolo-huddle.jpg",
    season: "Fall",
    sport: "Water Polo",
    caption: "Girls Water Polo · the huddle",
    objectPosition: "center 40%",
  },
  {
    src: "/photos/cstudent-section.jpg",
    season: "Any",
    sport: "Student Section",
    caption: "GO TIGERS · the body-paint section",
    // Tighter crop than the original — body-paint chests are roughly
    // centered, so default object-position needs less anchoring.
    objectPosition: "center 50%",
  },
  {
    src: "/photos/gbball-hartford.jpg",
    season: "Winter",
    sport: "Basketball",
    caption: "Girls Varsity Basketball · #22 Hartford",
    objectPosition: "center 35%",
  },
  {
    src: "/photos/ctrack-2.jpg",
    season: "Spring",
    sport: "Track & Field",
    caption: "Tiger track · leading the pack",
    objectPosition: "center 30%",
  },
  {
    src: "/photos/bbball-shot-394.jpg",
    season: "Winter",
    sport: "Basketball",
    caption: "Boys Basketball · attacking the rim",
    objectPosition: "center 30%",
  },
  {
    src: "/photos/gsoccer-huddle.jpg",
    season: "Winter",
    sport: "Soccer",
    caption: "Girls Soccer · the huddle before kickoff",
    objectPosition: "center 45%",
  },
  // Winter action shots, added at the 2026-27 Fall → Winter turnover so the
  // hero has more than basketball to lead with from November.
  {
    src: "/photos/bsoccer-keeper-save.jpg",
    season: "Winter",
    sport: "Soccer",
    caption: "Boys Soccer · the keeper rises to the corner",
    objectPosition: "center 40%",
  },
  {
    src: "/photos/ccheer-winter-tigers-2026.jpg",
    season: "Winter",
    sport: "Cheer",
    caption: "Winter Cheer · LET'S GO TIGERS, courtside",
    objectPosition: "center 35%",
  },
  {
    src: "/photos/bwrestling-action.jpg",
    season: "Winter",
    sport: "Wrestling",
    caption: "Boys Wrestling · on the mat",
    // Portrait original: the wrestlers sit in the lower half of the frame.
    objectPosition: "center 72%",
  },
];

/** In-season slides first, then seasonless ones, then the rest of the year —
 *  each group keeping SLIDE_LIST's order — and only then spread by sport, so
 *  Winter opens on basketball rather than two football photos (#267).
 *  `season` comes from the server (page.tsx) so the server render and the
 *  client agree on slide order even across a season boundary. */
function orderSlides(season?: string): Slide[] {
  const rank = (s: Slide) =>
    s.season === season ? 0 : s.season === "Any" ? 1 : 2;
  const sorted = season
    ? [...SLIDE_LIST].sort((a, b) => rank(a) - rank(b))
    : SLIDE_LIST;
  return spreadBySport(sorted, (s) => s.sport);
}

const ROTATE_MS = 9500;

type Props = {
  /** Whether the seasonal Donate drive is running (resolved server-side). */
  donateActive?: boolean;
  /** Tiger News card, shown top-right over the photo on desktop (#266). */
  teaser?: React.ReactNode;
  /** Current athletic season (seasons.ts `currentSeason()`), resolved
   *  server-side. Its slides lead the rotation. */
  season?: string;
};

export default function ClassicHero({ donateActive = false, teaser, season }: Props) {
  const SLIDES = useMemo(() => orderSlides(season), [season]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [SLIDES.length]);

  return (
    <section
      className="tiger-hero"
      aria-roledescription="carousel"
      aria-label="SLOHS Tiger athletics"
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`tiger-hero-slide${i === idx ? " active" : ""}`}
          aria-hidden={i !== idx}
        >
          <Image
            src={slide.src}
            alt={slide.sport}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectPosition: slide.objectPosition ?? "center center" }}
          />
        </div>
      ))}
      <div className="tiger-hero-overlay-v" />
      <div className="tiger-hero-overlay-h" />

      <div className="tiger-hero-content">
        {teaser && <div className="tiger-hero-news">{teaser}</div>}
        <div>
          <div className="tiger-hero-pill-row">
            <span className="tiger-hero-pill">SLO Tiger Athletics</span>
            <span className="tiger-hero-est">Est. 1894</span>
          </div>
          <h1 className="tiger-hero-headline">
            Go <em>Tigers.</em>
          </h1>
          <p className="tiger-hero-sub">
            Raising funds and rallying the community to support every
            CIF-sanctioned team and cheer squad at San Luis Obispo High
            School.
          </p>
          <div className="tiger-hero-cta-row">
            {donateActive && (
              <Link
                href="/donate"
                className="tiger-btn tiger-btn-primary tiger-btn-arrow"
              >
                Donate Now
              </Link>
            )}
            <Link
              href="/membership"
              className={`tiger-btn tiger-btn-arrow ${
                donateActive ? "tiger-btn-ghost" : "tiger-btn-primary"
              }`}
            >
              Become a Member
            </Link>
            <Link href="/volunteer" className="tiger-btn tiger-btn-ghost">
              Volunteer
            </Link>
          </div>
        </div>

        <div className="tiger-hero-meta">
          <div className="tiger-hero-caption">{SLIDES[idx].caption}</div>
          <div className="tiger-hero-dots" role="tablist">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}: ${s.sport}`}
                className={`tiger-hero-dot${i === idx ? " active" : ""}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
