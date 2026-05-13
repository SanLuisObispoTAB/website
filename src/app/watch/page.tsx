"use client";

import Script from "next/script";
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

// React doesn't know about the <blueframe-app> custom element. Declare
// it so JSX compiles cleanly. (Next.js 16 + React 18 use the React.JSX
// namespace instead of the legacy global JSX.)
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "blueframe-app": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { portalconfig?: string },
        HTMLElement
      >;
    }
  }
}

/**
 * /watch — Hudl BlueFrame portal embed for SLOHS Tigers broadcasts.
 *
 * Hudl Support built this custom web component for us (config keyed to
 * vCloud site 6609). The widget auto-populates live + upcoming +
 * archived broadcasts from the vCloud feed — no editor maintenance on
 * the SLOTAB side. Per-broadcast availability is controlled by SLOHS
 * coaches in vCloud (Available + Archive status), not here.
 *
 * Theme colors in the config (primary #333, secondary slotab gold)
 * are set by Hudl on their end; ping support to change them.
 */
export default function WatchPage() {
  // The CSS link is normally placed in <head>. React 18+ supports
  // hoisting <link> from any component, but to be safe in App Router
  // we inject it client-side once. The CSS is keyed by id so repeat
  // visits to /watch don't pile up duplicates.
  useEffect(() => {
    const id = "blueframe-portal-css";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "//web-app.blueframetech.com/css/app.css";
    document.head.appendChild(link);
  }, []);

  return (
    <>
      <PageHeader kicker="Live & On-Demand" title="Watch the Tigers" />

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center", maxWidth: 720 }}
        >
          <p style={{ fontSize: "1.15rem" }}>
            <strong>SLOTAB pays for Hudl streaming</strong> so every Tigers
            home game from Holt Field and the Big Gym is accessible to alumni,
            grandparents, and out-of-town family. Live broadcasts plus the
            full archive below.
          </p>
        </div>
      </section>

      <section className="slotab-watch-portal-section">
        <div className="slotab-watch-portal-wrap">
          <blueframe-app portalconfig="//apps.blueframetech.com/api/v1/bft/slostream/config.json" />
        </div>
      </section>

      <Script
        src="//web-app.blueframetech.com/js/app.js"
        strategy="afterInteractive"
      />
    </>
  );
}
