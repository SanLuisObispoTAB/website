// Which notification URLs this deployment will accept a Square signature for.
//
// Its own module because two surfaces need the same answer and must not be able
// to disagree: the webhook route, which verifies against them, and the `/board`
// panel, which shows the board what is accepted. A second copy of this list is
// how you get a green tick beside a broken integration.
//
// See decision #191 for why this is a list at all.

/** The notification URLs this deployment will accept a signature for.
 *
 *  `SQUARE_WEBHOOK_URL` may hold one URL or a comma-separated list. The alias
 *  path is added automatically for whatever is configured, because the two
 *  paths are the exact pair that caused #191 and a club volunteer should not
 *  have to know that the sibling URL is the thing to try. */
export function notificationUrls(): string[] {
  const configured = (process.env.SQUARE_WEBHOOK_URL ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const withSiblings = new Set(configured);
  for (const url of configured) {
    // Derived, not invented: these swap ONLY between the canonical route and
    // the compatibility alias that serves the same handler. Nothing else is
    // guessed at, and an unrelated URL gains no siblings.
    if (url.endsWith("/api/square/webhook")) {
      withSiblings.add(url.replace(/\/api\/square\/webhook$/, "/api/webhook"));
    } else if (url.endsWith("/api/webhook")) {
      withSiblings.add(url.replace(/\/api\/webhook$/, "/api/square/webhook"));
    }
  }
  return [...withSiblings];
}
