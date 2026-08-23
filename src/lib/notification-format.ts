// Shared rendering for the two emails this site sends a volunteer: the
// sponsorship handoff (`sponsor-fulfilment.ts`) and the donation checklist
// (`donation-notification.ts`).
//
// Its own module rather than one importing the other, because the traffic
// already runs the other way — the donation checklist imports `perkAction`
// from the sponsorship module — and a second edge would make that a cycle.
//
// WHY THESE TWO IN PARTICULAR
// Both were formatted for a machine and read by a person. A timestamp of
// "2026-08-23T16:00:00Z" asks a volunteer in San Luis Obispo to do timezone
// arithmetic to answer "is this the one from this afternoon?", and
// "+18057974638" is not a number anyone dials. They went unnoticed in the
// sponsorship mail because until #186 the phone was ALWAYS "not provided" —
// it was never carried into the transaction, so the format never showed.

/** Square's ISO/UTC timestamps in the timezone the reader lives in, labelled
 *  so it cannot be mistaken for UTC. An unparseable value is passed through
 *  rather than mangled — a raw string beats a confident "Invalid Date". */
export function pacificTimestamp(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " PT"
  );
}

/** `+18055551212` back into `(805) 555-1212`.
 *
 *  Numbers are stored E.164 because that is the only format Square accepts
 *  (see `normalisePhone` in the payment-link route), but the reader of these
 *  emails is about to dial it. Anything that isn't a US/Canada number is
 *  passed through untouched rather than guessed at. */
export function readablePhone(e164?: string): string | undefined {
  if (!e164) return undefined;
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
