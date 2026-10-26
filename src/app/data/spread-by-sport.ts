// House rule (Erik, 2026-10-26): no carousel shows the same sport in two
// consecutive slots. Every carousel that shows sports runs its list through
// this, so a slide or team added later is spaced out automatically instead of
// depending on someone hand-ordering the list.
//
// It keeps the original order wherever it can: at each step it takes the
// earliest remaining item whose sport differs from the previous one, as long
// as that choice still leaves a valid arrangement for the rest. Carousels
// loop, so the wrap from the last slot back to the first counts too.
//
// When a valid order is impossible (say, three football photos out of four),
// it does the best it can and never drops anything.

function feasible(counts: Map<string, number>, n: number, prev: string) {
  for (const [sport, c] of counts) {
    if (c === 0) continue;
    // With n slots left and the previous slot taken by `prev`, a sport can
    // fill at most every other slot.
    const max = sport === prev ? Math.floor(n / 2) : Math.ceil(n / 2);
    if (c > max) return false;
  }
  return true;
}

export function spreadBySport<T>(items: T[], sportOf: (item: T) => string): T[] {
  const remaining = [...items];
  const counts = new Map<string, number>();
  for (const it of items) {
    const s = sportOf(it);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const out: T[] = [];
  let prev = "";
  while (remaining.length > 0) {
    let pick = remaining.findIndex((it) => {
      const s = sportOf(it);
      if (s === prev) return false;
      counts.set(s, counts.get(s)! - 1);
      const ok = feasible(counts, remaining.length - 1, s);
      counts.set(s, counts.get(s)! + 1);
      return ok;
    });
    if (pick === -1) pick = remaining.findIndex((it) => sportOf(it) !== prev);
    if (pick === -1) pick = 0; // only one sport left; nothing to be done
    const [it] = remaining.splice(pick, 1);
    prev = sportOf(it);
    counts.set(prev, counts.get(prev)! - 1);
    out.push(it);
  }

  // The loop: if the last slot matches the first, move the last item to the
  // first gap where neither neighbour shares its sport.
  const n = out.length;
  if (n > 2 && sportOf(out[0]) === sportOf(out[n - 1])) {
    const last = out[n - 1];
    const s = sportOf(last);
    const body = out.slice(0, n - 1);
    for (let i = 1; i < body.length; i++) {
      if (sportOf(body[i - 1]) !== s && sportOf(body[i]) !== s) {
        // Removing it from the end makes body's last and first neighbours.
        if (sportOf(body[body.length - 1]) === sportOf(body[0])) continue;
        return [...body.slice(0, i), last, ...body.slice(i)];
      }
    }
  }
  return out;
}
