// Compatibility alias for the Square webhook.
//
// WHY THIS PATH EXISTS
// The live Square subscription (`wbhk_f7a4328dae9f45fe862c689a09679839`,
// production, `payment.updated`) is configured with the notification URL
// **https://slotab.org/api/webhook** — one path segment short of the route that
// implements it, `/api/square/webhook`. Every event Square has ever sent has
// therefore 404'd, and the #177 sponsorship handoff has never once fired
// despite all four environment variables being correctly set. Confirmed from
// Square's own delivery log, which shows nothing but
// `404 payment.updated https://slotab.org/api/webhook` with retries queued
// (#191).
//
// WHY FIX IT HERE RATHER THAN ONLY IN THE DASHBOARD
// Square has **pending retries right now**. A deploy lands in a minute; a
// dashboard edit waits on a volunteer, and Square gives up eventually. Adding
// the path Square is already using means those queued events deliver instead of
// expiring. Correcting the dashboard is still worth doing — see the README —
// but this makes the club's data arrive either way.
//
// This is an ALIAS, not a second implementation: one handler, two URLs. There
// is no separate logic here to drift, and the signature check is the same one,
// so an unsigned caller is refused at this path exactly as at the other.
//
// SAFE TO DELETE once the Square subscription points at `/api/square/webhook`
// and `SQUARE_WEBHOOK_URL` matches it — but check Square's delivery log for
// 404s on this path first, because deleting it re-breaks the integration if the
// subscription was never moved.
export { POST } from "../square/webhook/route";

// Declared here rather than re-exported: Next reads route segment config from
// the module it is written in, so a re-export would silently leave this route
// on the defaults.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
