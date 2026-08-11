"use client";

import { useSyncExternalStore } from "react";
import {
  consentServerSnapshot,
  consentSnapshot,
  engagementServerSnapshot,
  engagementSnapshot,
  parseEngagement,
  recordVisit,
  setConsent,
  subscribe,
} from "./consent";

/** Lets a visitor see exactly what's stored about them and change their
 *  answer. Showing the actual values is the point — it's a short enough
 *  list that "here it is" beats any amount of describing it.
 *
 *  Both values come from the cookie store, so this stays in step with the
 *  banner and with sections being recorded as the visitor browses. */
export default function ConsentControls() {
  const consent = useSyncExternalStore(
    subscribe,
    consentSnapshot,
    consentServerSnapshot,
  );
  const raw = useSyncExternalStore(
    subscribe,
    engagementSnapshot,
    engagementServerSnapshot,
  );
  const engagement = parseEngagement(raw);

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    // Count this visit straight away, otherwise accepting here shows a
    // confusing "Visits: 0" until the next page load.
    if (value === "granted") recordVisit();
  };

  return (
    <div className="slotab-consent-controls">
      <p className="slotab-consent-status">
        {consent === "granted" && "You've accepted. Here's everything stored:"}
        {consent === "denied" &&
          "You've declined. Nothing is being stored about your visits."}
        {consent === null && "You haven't answered yet."}
      </p>

      {consent === "granted" && (
        <ul className="slotab-consent-data">
          <li>
            <span>Visits</span>
            <strong>{engagement.visits}</strong>
          </li>
          <li>
            <span>First visit</span>
            <strong>{engagement.first || "—"}</strong>
          </li>
          <li>
            <span>Sections reached</span>
            <strong>
              {engagement.sections.length
                ? engagement.sections.join(", ")
                : "none yet"}
            </strong>
          </li>
        </ul>
      )}

      <div className="slotab-btn-row" style={{ marginTop: "1rem" }}>
        {consent !== "granted" && (
          <button
            type="button"
            className="slotab-btn"
            onClick={() => choose("granted")}
          >
            Accept cookies
          </button>
        )}
        {consent !== "denied" && (
          <button
            type="button"
            className="slotab-btn outline"
            onClick={() => choose("denied")}
          >
            Decline &amp; delete my record
          </button>
        )}
      </div>
    </div>
  );
}
