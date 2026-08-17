/**
 * Cookie consent + engagement tracking — shared helpers.
 *
 * Two cookies, and only two:
 *
 *   slotab_consent    "granted" | "denied". Records the visitor's choice.
 *                     Written the moment they click, and *only* then. This
 *                     one is strictly necessary (it's what stops us asking
 *                     again), so it isn't itself gated behind consent.
 *
 *   slotab_engagement Visit count, first-seen date, and which of the four
 *                     tracked sections they've reached. Written ONLY after
 *                     consent is granted, and deleted the moment it's
 *                     withdrawn.
 *
 * No third-party cookies, no ad networks, no cross-site identifiers. The
 * audience here is parents of high-school athletes, so the posture is
 * opt-in: nothing is recorded until someone actively accepts.
 */

export const CONSENT_COOKIE = "slotab_consent";
export const ENGAGEMENT_COOKIE = "slotab_engagement";

/** The four things the board asked to understand. */
export type TrackedSection =
  | "membership"
  | "sponsorship"
  | "donate"
  | "volunteer";

export type Consent = "granted" | "denied" | null;

const YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAge = YEAR_SECONDS) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}` +
    `; Path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getConsent(): Consent {
  const v = readCookie(CONSENT_COOKIE);
  return v === "granted" || v === "denied" ? v : null;
}

/** Fired whenever the choice changes, so the banner and the /privacy
 *  controls stay in step without a page reload. */
export const CONSENT_EVENT = "slotab:consent-change";

export function setConsent(value: Exclude<Consent, null>) {
  writeCookie(CONSENT_COOKIE, value);
  // Withdrawing consent must actually remove what we collected, not just
  // stop adding to it.
  if (value === "denied") deleteCookie(ENGAGEMENT_COOKIE);
  notify();
}

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** `useSyncExternalStore` plumbing. Cookies are an external store, so this
 *  is the primitive React wants here — it also keeps SSR honest, since the
 *  server can't know the answer and must render the "not decided" state. */
export function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

/** Snapshots must be primitives (or referentially stable) or React loops. */
export function consentSnapshot(): Consent {
  return getConsent();
}
export function consentServerSnapshot(): Consent {
  return null;
}
export function engagementSnapshot(): string {
  return readCookie(ENGAGEMENT_COOKIE) ?? "";
}
export function engagementServerSnapshot(): string {
  return "";
}
export function parseEngagement(raw: string): Engagement {
  if (!raw) return { ...EMPTY };
  try {
    const parsed = JSON.parse(raw) as Partial<Engagement>;
    return {
      visits: Number(parsed.visits) || 0,
      first: typeof parsed.first === "string" ? parsed.first : "",
      sections: Array.isArray(parsed.sections)
        ? (parsed.sections as TrackedSection[])
        : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export type Engagement = {
  /** Number of distinct visits (sessions), not page views. */
  visits: number;
  /** ISO date of the first visit we saw. */
  first: string;
  /** Which tracked sections they've reached, ever. */
  sections: TrackedSection[];
};

const EMPTY: Engagement = { visits: 0, first: "", sections: [] };

export function readEngagement(): Engagement {
  const raw = readCookie(ENGAGEMENT_COOKIE);
  if (!raw) return { ...EMPTY };
  try {
    const parsed = JSON.parse(raw) as Partial<Engagement>;
    return {
      visits: Number(parsed.visits) || 0,
      first: typeof parsed.first === "string" ? parsed.first : "",
      sections: Array.isArray(parsed.sections)
        ? (parsed.sections as TrackedSection[])
        : [],
    };
  } catch {
    // A malformed cookie shouldn't wedge the site — start clean.
    return { ...EMPTY };
  }
}

function writeEngagement(e: Engagement) {
  writeCookie(ENGAGEMENT_COOKIE, JSON.stringify(e));
  notify();
}

/** Today's date in the VISITOR's timezone, as YYYY-MM-DD.
 *
 *  Not `toISOString().slice(0, 10)` — that is the UTC date, so for anyone
 *  west of Greenwich an evening visit stamps tomorrow. In California
 *  (UTC-7/-8) every visit from 4-5pm onwards recorded the wrong day, and
 *  that date is shown straight back to the visitor on /privacy as "First
 *  visit" — a page whose entire job is telling people accurately what we
 *  hold about them. */
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Bumps the visit counter once per browser session. Returns the record,
 *  or null when consent hasn't been granted. */
export function recordVisit(): Engagement | null {
  if (getConsent() !== "granted") return null;
  const e = readEngagement();
  const SESSION_KEY = "slotab_session_counted";
  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(SESSION_KEY) === "1";
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Private browsing can throw on sessionStorage; treat as a new visit.
  }
  if (!alreadyCounted) {
    e.visits += 1;
    if (!e.first) e.first = todayLocal();
    writeEngagement(e);
  }
  return e;
}

/** Records that a tracked section was reached. Returns true the first time
 *  ever for that section, so callers can fire a one-shot analytics event. */
export function recordSection(section: TrackedSection): boolean {
  if (getConsent() !== "granted") return false;
  const e = readEngagement();
  if (e.sections.includes(section)) return false;
  e.sections.push(section);
  if (!e.first) e.first = todayLocal();
  writeEngagement(e);
  return true;
}
