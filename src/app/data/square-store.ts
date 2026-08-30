// The club's hosted Square Online storefront.
//
// WHY THIS ONE CONSTANT HAS ITS OWN FILE
// Two modules need it and they have opposite lifespans. `square-donate.ts` is
// an interim bridge whose own header says "retire this whole file once the real
// integration lands" — and it very nearly has: since #181 donations mint their
// own checkout and that module is only the 503 fallback. `passes.ts` is the
// opposite: since #213 the storefront is the *permanent* home of pass sales,
// deliberately (see the note there).
//
// So a constant living in the temporary module and imported by the permanent
// one would break on the day someone finally deletes the file they were told to
// delete. Here, that deletion is safe.
export const SQUARE_STORE = "https://slotab-3.square.site";

/** A storefront product URL from its path. Paths are recorded next to the thing
 *  they sell, not here — this only knows where the store is. */
export function squareStoreUrl(path: string): string {
  return `${SQUARE_STORE}${path}`;
}
