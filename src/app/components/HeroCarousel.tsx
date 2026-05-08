"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  src: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    src: "/photos/bfball-vsPR-2022.jpg",
    alt: "SLO Tigers football in action",
  },
  {
    src: "/photos/gvball-slogv-2022.jpg",
    alt: "SLO Girls Volleyball",
  },
  {
    src: "/photos/gwpolo-2022.jpg",
    alt: "SLO Girls Water Polo",
  },
  {
    src: "/photos/gtennis-2022.jpg",
    alt: "SLO Girls Tennis",
  },
  {
    src: "/photos/bwpolo-teitge-2022.jpg",
    alt: "SLO Boys Water Polo — Bobby Teitge",
  },
  {
    src: "/photos/bbaseball-baileyhartford.jpg",
    alt: "SLO Tiger student-athlete Bailey Hartford",
  },
  {
    src: "/photos/ccheering-2022.jpg",
    alt: "SLOHS Tigers cheering at a football game",
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setTimeout(
      () => go(index + 1),
      AUTO_ADVANCE_MS,
    );
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, go]);

  return (
    <section
      className="slotab-hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="SLOHS Tiger athletics"
    >
      <div className="slotab-hero-slides">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`slotab-hero-slide ${i === index ? "active" : ""}`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
        <div className="slotab-hero-overlay" />
      </div>

      <div className="slotab-hero-content">
        <div className="slotab-kicker">San Luis Obispo High School</div>
        <h1>Go Tigers!</h1>
        <p>
          The SLO Tiger Athletic Booster Club raises funds and rallies the
          community to support every CIF-sanctioned team and cheer squad at
          SLOHS. Parents, alumni, and neighbors keep Tiger athletics strong.
        </p>
        <div className="slotab-hero-cta">
          <Link
            href="/donate"
            className="slotab-btn slotab-hero-cta-primary"
          >
            Donate Now
          </Link>
          <div className="slotab-hero-cta-secondary">
            <Link href="/volunteer">Volunteer</Link>
            <span aria-hidden="true">·</span>
            <Link href="/membership">Become a Sponsor</Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="slotab-hero-arrow prev"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        className="slotab-hero-arrow next"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
      >
        ›
      </button>

      <div className="slotab-hero-dots" role="tablist">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            className={`slotab-hero-dot ${i === index ? "active" : ""}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
