"use client";

import { usePathname } from "next/navigation";

export default function HomeMasthead() {
  const pathname = usePathname();
  // Only show on the SLOTAB preview home page itself, not on any sub-pages
  if (pathname !== "/" && pathname !== "/") {
    return null;
  }
  return (
    <section className="slotab-masthead" aria-label="SLOTAB">
      <div className="slotab-masthead-inner">
        <div className="slotab-wordmark" aria-label="SLOTAB">
          <span className="wm-slo">SLO</span>
          <span className="wm-divider" aria-hidden="true" />
          <span className="wm-tab">TAB</span>
        </div>
        <div className="slotab-masthead-sub">
          <span className="sub-slo">San Luis Obispo</span>
          <span className="sub-dot" aria-hidden="true">●</span>
          <span className="sub-tab">Tiger Athletic Boosters</span>
        </div>
      </div>
    </section>
  );
}
