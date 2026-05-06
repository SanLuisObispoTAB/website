"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SPONSOR_TIERS, type Sponsor } from "../data/sponsors";

const ROTATE_MS = 4500;

function getPlatinumSponsors(): Sponsor[] {
  const platinum = SPONSOR_TIERS.find((t) => t.tier === "Platinum");
  return platinum?.sponsors ?? [];
}

export default function PlatinumCarousel() {
  const sponsors = getPlatinumSponsors();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (sponsors.length < 2 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % sponsors.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [sponsors.length, paused]);

  if (sponsors.length === 0) return null;

  const current = sponsors[index];
  const inner = (
    <Image
      src={current.logo}
      alt={current.name}
      width={520}
      height={280}
      style={{ objectFit: "contain", width: "100%", height: "100%" }}
    />
  );

  return (
    <section
      className="slotab-platinum-carousel"
      aria-label="Platinum Sponsors"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="slotab-container">
        <div className="slotab-platinum-head">
          <span className="slotab-kicker">Platinum Sponsors</span>
          <h2>Tigers Athletics is brought to you by</h2>
        </div>
        <div className="slotab-platinum-stage">
          {current.website ? (
            <a
              href={current.website}
              target="_blank"
              rel="noopener noreferrer"
              className="slotab-platinum-slide"
              aria-label={`${current.name} (opens in a new tab)`}
            >
              {inner}
            </a>
          ) : (
            <div className="slotab-platinum-slide">{inner}</div>
          )}
          <div className="slotab-platinum-name">{current.name}</div>
        </div>
        {sponsors.length > 1 && (
          <div
            className="slotab-platinum-dots"
            role="tablist"
            aria-label="Select sponsor"
          >
            {sponsors.map((s, i) => (
              <button
                key={s.name}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.name}
                className={`slotab-platinum-dot ${i === index ? "on" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
