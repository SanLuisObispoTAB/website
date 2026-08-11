"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  consentServerSnapshot,
  consentSnapshot,
  getConsent,
  recordSection,
  recordVisit,
  setConsent,
  subscribe,
  type TrackedSection,
} from "./consent";

/** Routes that map straight onto a tracked section. Sponsorship lives on
 *  /membership rather than its own route, so it's tracked separately by
 *  <SponsorshipMarker> when the sponsor block actually scrolls into view —
 *  otherwise every membership visit would double-count as a sponsorship one. */
const SECTION_BY_PATH: Record<string, TrackedSection> = {
  "/membership": "membership",
  "/donate": "donate",
  "/volunteer": "volunteer",
};

export default function ConsentGate() {
  const pathname = usePathname() || "";
  // Cookies are an external store. The server snapshot is deliberately
  // `null` — it cannot know the answer, so SSR renders the undecided state
  // and React swaps in the real one on hydration without a mismatch.
  const consent = useSyncExternalStore(
    subscribe,
    consentSnapshot,
    consentServerSnapshot,
  );

  const choose = useCallback((value: "granted" | "denied") => {
    setConsent(value);
    if (value === "granted") {
      const e = recordVisit();
      if (e && e.visits > 1) {
        track("returning_visitor", { visits: e.visits });
      }
    }
  }, []);

  // Count the visit for someone who accepted on an earlier trip.
  useEffect(() => {
    if (consent !== "granted") return;
    const e = recordVisit();
    if (e && e.visits > 1) track("returning_visitor", { visits: e.visits });
  }, [consent]);

  // Section views, fired once per visitor per section.
  useEffect(() => {
    if (consent !== "granted") return;
    const section = SECTION_BY_PATH[pathname];
    if (!section) return;
    if (recordSection(section)) {
      track("section_first_view", { section });
    }
  }, [consent, pathname]);

  return (
    <>
      {consent === "granted" && <Analytics />}
      {consent === null && (
        <div
          className="slotab-consent"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
        >
          <div className="slotab-consent-inner">
            <p className="slotab-consent-copy">
              <strong>We&apos;d like to use one cookie.</strong> It helps us
              see which parts of the site are actually useful to Tiger
              families — nothing more. No advertising, no third parties, and
              nothing is stored until you say yes.{" "}
              <Link href="/privacy">What we collect →</Link>
            </p>
            <div className="slotab-consent-actions">
              <button
                type="button"
                className="slotab-btn"
                onClick={() => choose("granted")}
              >
                Accept
              </button>
              <button
                type="button"
                className="slotab-btn outline"
                onClick={() => choose("denied")}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Drop this immediately above the sponsor wall on /membership. Fires the
 *  "sponsorship" section event once that part of the page is actually
 *  reached — visiting /membership alone only counts as "membership". */
export function SponsorshipMarker() {
  useEffect(() => {
    if (getConsent() !== "granted") return;
    const el = document.getElementById("sponsorship-marker");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (recordSection("sponsorship")) {
            track("section_first_view", { section: "sponsorship" });
          }
          io.disconnect();
        }
      },
      // threshold 0, not a ratio: the marker is a zero-height div, so its
      // intersectionRatio is always 0 and any ratio-based threshold would
      // never fire. Entering the viewport at all is the signal we want.
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 1px tall, not zero: a zero-area target has an undefined intersection
  // ratio, and some engines never report it as intersecting at all. One
  // pixel costs nothing and makes the observation unambiguous.
  return (
    <div
      id="sponsorship-marker"
      aria-hidden="true"
      style={{ height: 1 }}
    />
  );
}
