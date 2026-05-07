"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = {
  src: string;
  sport: string;
  caption: string;
};

const SLIDES: Slide[] = [
  {
    src: "/photos/tunnel-runout.jpg",
    sport: "Football",
    caption: "Friday night under the lights · Holt Field",
  },
  {
    src: "/photos/football-helmets.jpg",
    sport: "Football",
    caption: "Tigers helmets up · pre-game ritual",
  },
  {
    src: "/photos/water-polo-huddle.jpg",
    sport: "Water Polo",
    caption: "Girls Water Polo · the huddle",
  },
  {
    src: "/photos/student-section.jpg",
    sport: "Student Section",
    caption: "GO TIGERS · the body-paint section",
  },
  {
    src: "/photos/basketball-girls.jpg",
    sport: "Basketball",
    caption: "Girls Varsity Basketball · #22 Hartford",
  },
];

const ROTATE_MS = 6000;

export default function ClassicHero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

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
          />
        </div>
      ))}
      <div className="tiger-hero-overlay-v" />
      <div className="tiger-hero-overlay-h" />

      <div className="tiger-hero-content">
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
            <Link
              href="/donate"
              className="tiger-btn tiger-btn-primary tiger-btn-arrow"
            >
              Donate Now
            </Link>
            <Link href="/membership" className="tiger-btn tiger-btn-ghost">
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
