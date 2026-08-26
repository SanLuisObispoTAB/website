import donorsJson from "./donors.json";

// The SLOTAB Donor Wall — the individuals who gave and said we could say so.
//
// WHY THIS FILE EXISTS AT ALL
// It didn't, until #197, and that was the bug. Since the donate form shipped it
// has told every donor "we'll use this to add you to the donor wall" and
// offered a checkbox reading "Display my name on the SLOTAB Donor Wall" — while
// no wall, no page and no data file existed anywhere in the repo. People ticked
// a box believing their name went somewhere. `sponsors.json` is the *business*
// wall and was never this.
//
// WHAT IS DELIBERATELY NOT STORED HERE, AND WHY
// The giving level. Square knows it, the Treasurer's report groups by it, and
// the May research doc proposed tier groupings on this page — but the consent
// the donor actually gave reads, in full: "Display my name on the SLOTAB Donor
// Wall." That covers a name. It does not cover publishing a band that says
// roughly what they gave, and this repo is PUBLIC, so anything written here is
// in git history permanently. Names only until the board either decides
// otherwise or the checkbox copy is changed to ask for it. Adding a field is
// easy; un-publishing someone's giving level is not.

export type Donor = {
  /** As the donor typed it on the form — their name, spelled their way. */
  name: string;
};

export type DonorWall = {
  /** Cleared and rebuilt each season, same convention as the sponsor wall. */
  season: string;
  donors: Donor[];
};

/** Comparison key for "is this person already on the wall?".
 *
 *  Reduces a name to its letters and digits alone: case, accents, punctuation
 *  and **spacing** all removed. So "Mary-Anne O'Brien", "Mary Anne OBrien" and
 *  "maryanne obrien" are one person, and "José" matches "Jose".
 *
 *  Spacing has to go, and that was learned the hard way: an earlier version
 *  deleted the hyphen without replacing it, turning "Mary-Anne" into
 *  "maryanne" while "Mary Anne" stayed "mary anne" — so the same donor was
 *  offered for the wall twice, which is precisely the duplicate this key
 *  exists to prevent.
 *
 *  It still does NOT try to be clever about nicknames or middle names: "Bob
 *  Smith" and "Robert Smith" stay distinct. Merging those wrongly would publish
 *  one person's recognition under another person's name; the cost of a missed
 *  merge is a board member deleting a duplicate line. Those are not comparable
 *  errors, so the key only ever merges names that are the same letters. */
export function donorKey(name: string): string {
  return name
    .normalize("NFD")
    // Strip combining accent marks, so "José" and "Jose" are one person.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

// Editable via Decap CMS at /admin/#/collections/donors
export const DONOR_WALL: DonorWall = donorsJson as DonorWall;

/** Names on the wall, sorted for display.
 *
 *  Alphabetical by last word of the name — the closest thing to "by surname"
 *  that works without asking donors to split their name into fields, and it
 *  degrades sensibly for mononyms and for names that don't put the family name
 *  last. Deliberately not sorted by amount: see the note above. */
export function sortedDonors(donors: Donor[] = DONOR_WALL.donors): Donor[] {
  const surname = (n: string) => {
    const parts = n.trim().split(/\s+/);
    return (parts[parts.length - 1] ?? n).toLowerCase();
  };
  return [...donors].sort(
    (a, b) => surname(a.name).localeCompare(surname(b.name)) || a.name.localeCompare(b.name),
  );
}

/** Is this person already listed? Used by the staging page so a donor who
 *  gives twice is offered once, and a confirmed donor stops reappearing. */
export function isOnWall(name: string, wall: DonorWall = DONOR_WALL): boolean {
  const key = donorKey(name);
  return wall.donors.some((d) => donorKey(d.name) === key);
}
