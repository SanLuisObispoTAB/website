import campaign from "./campaign.json";

// The seasonal "Donate to the Tigers" drive. Per board direction (2026-08),
// the prominent Donate CTA is featured only while a drive is running, so it
// doesn't compete with year-round membership + sponsorship recruitment.
// Editable via Decap CMS at /admin/#/collections/campaign.
export type DonateDrive = {
  /**
   * "auto" — active when today falls in [startsOn, endsOn].
   * "on"   — force the drive on regardless of dates.
   * "off"  — force the drive off (Donate stays demoted).
   */
  mode: "auto" | "on" | "off";
  /** Inclusive window bounds, YYYY-MM-DD. Only used in "auto" mode. */
  startsOn: string;
  endsOn: string;
  /** Human label for the drive (e.g. "Fall Donation Drive"). */
  label: string;
};

export const DONATE_DRIVE: DonateDrive = campaign.donateDrive as DonateDrive;

/**
 * Whether the seasonal Donate campaign should be featured prominently.
 *
 * Evaluate this in a server component (build time) and pass the boolean
 * down to client components as a prop — calling it on the client would
 * risk a hydration mismatch near a date boundary. In "auto" mode the flip
 * lands on the next site rebuild after the boundary (deploys + the events
 * cron rebuild regularly); use "on"/"off" for to-the-day control.
 */
export function isDonateDriveActive(now: Date = new Date()): boolean {
  const d = DONATE_DRIVE;
  if (d.mode === "on") return true;
  if (d.mode === "off") return false;
  const today = now.toISOString().slice(0, 10);
  return today >= d.startsOn && today <= d.endsOn;
}
