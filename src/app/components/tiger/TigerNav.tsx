"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import teamsData from "../../data/teams.json";
import { orderedSeasons, teamInSeason } from "../../data/seasons";

type NavLink = {
  href: string;
  label: string;
};
/** A season heading inside the Teams dropdown. The dropdown lists every
 *  team with a page, which is too many to scan as one flat column, so the
 *  list is broken up by season rather than run together. */
type NavHeading = { heading: string };
type NavChild = NavLink | NavHeading;

function isHeading(c: NavChild): c is NavHeading {
  return "heading" in c;
}
function isLink(c: NavChild): c is NavLink {
  return !isHeading(c);
}

type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

type TeamEntry = {
  slug: string;
  name: string;
  // Optional: a team with no gender designation (Tiger Cheer) omits it
  // entirely rather than being labelled, so it reads as just its name.
  gender?: "Boys" | "Girls" | "Co-ed";
  season: "Fall" | "Winter" | "Spring" | "Year-round";
  /** Set when a team runs across more than one season — see seasons.ts. */
  seasons?: string[];
  hasPage: boolean;
};

// Teams dropdown is built from teams.json so new pages appear automatically.
//
// Every team with a page is listed, grouped under a season heading, with the
// current (or upcoming, during summer) season leading — previously this showed
// the in-season teams ONLY, which kept the menu short but meant a parent
// looking for, say, Baseball in September could not find it in the nav at all.
// Teams without a page are deliberately still absent: `/teams/<slug>` does not
// exist for them, so a link would 404. "All Teams" leads and covers those.
//
// A team is listed ONCE, under the first season it competes in, so a
// multi-season team (Dance runs Fall and Winter) does not appear twice in a
// single menu. The /teams index does repeat it per season, which is right
// there — that page is browsed a season at a time.
function teamChildren(): NavChild[] {
  const withPage = (teamsData.teams as TeamEntry[]).filter((t) => t.hasPage);
  const claimed = new Set<string>();
  const children: NavChild[] = [{ href: "/teams", label: "All Teams" }];

  for (const season of orderedSeasons()) {
    const teams = withPage
      .filter((t) => !claimed.has(t.slug) && teamInSeason(t, season))
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name) ||
          (a.gender ?? "").localeCompare(b.gender ?? ""),
      );
    if (teams.length === 0) continue;
    children.push({ heading: season });
    for (const t of teams) {
      claimed.add(t.slug);
      children.push({
        href: `/teams/${t.slug}`,
        label:
          !t.gender || t.gender === "Co-ed" ? t.name : `${t.gender} ${t.name}`,
      });
    }
  }
  return children;
}

const BASE_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { href: "/about", label: "About SLOTAB" },
      { href: "/impact", label: "Impact" },
      { href: "/contact", label: "Board & Contact" },
    ],
  },
  {
    label: "Get Involved",
    children: [
      { href: "/membership", label: "Sponsors / Membership" },
      { href: "/season-passes", label: "Season Passes" },
      { href: "/volunteer", label: "Volunteer" },
    ],
  },
  {
    label: "Events",
    children: [
      { href: "/upcoming", label: "Upcoming" },
      { href: "/back-to-school", label: "Back to School Day" },
      { href: "/booster-bash", label: "Booster Bash" },
    ],
  },
  { label: "Teams" }, // children injected per-render (season-dependent) below
  { label: "Watch", href: "/watch" },
  { label: "Shop", href: "/merch" },
  { label: "Hall of Fame", href: "/hall-of-fame" },
];

function isActive(item: NavItem, path: string) {
  if (item.href) {
    return item.href === "/"
      ? path === "/"
      : path === item.href || path.startsWith(item.href + "/");
  }
  // Season headings carry no href — skip them, or "Teams" would never
  // highlight because the first child it tested had nothing to compare.
  return item.children
    ?.filter(isLink)
    .some((c) => path === c.href || path.startsWith(c.href + "/"));
}

export default function TigerNav() {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeMobile = () => setMobileOpen(false);
  const closeDropdown = () => setOpenDropdown(null);

  // Inject the season-aware Teams children; everything else is static.
  const NAV: NavItem[] = BASE_NAV.map((item) =>
    item.label === "Teams" ? { ...item, children: teamChildren() } : item,
  );

  return (
    <header className="tiger-nav">
      <div className="tiger-nav-inner">
        <Link href="/" className="tiger-nav-brand" aria-label="SLOTAB home">
          <Image
            src="/logos/slotab-roundel.png"
            alt=""
            width={42}
            height={42}
            priority
          />
          <span className="tiger-nav-brand-text">
            <span className="tiger-nav-brand-name">SLOTAB</span>
            <span className="tiger-nav-brand-tag">Tiger Athletic Boosters</span>
          </span>
        </Link>

        <nav className="tiger-nav-links" aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(item, pathname);
            if (item.children) {
              const isOpen = openDropdown === item.label;
              return (
                <div
                  key={item.label}
                  className={`tiger-nav-item${isOpen ? " open" : ""}`}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    className={`tiger-nav-link${active ? " active" : ""}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === item.label ? null : item.label,
                      )
                    }
                  >
                    {item.label}
                    <span className="tiger-nav-chev" aria-hidden>
                      ▾
                    </span>
                  </button>
                  <div
                    className={`tiger-nav-dropdown${
                      item.children.some(isHeading) ? " grouped" : ""
                    }`}
                    role="menu"
                  >
                    {item.children.map((c) =>
                      isHeading(c) ? (
                        <div
                          key={`h-${c.heading}`}
                          className="tiger-nav-dropdown-heading"
                          role="presentation"
                        >
                          {c.heading}
                        </div>
                      ) : (
                        <Link
                          key={c.href}
                          href={c.href}
                          role="menuitem"
                          onClick={closeDropdown}
                        >
                          {c.label}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div key={item.label} className="tiger-nav-item">
                <Link
                  href={item.href ?? "#"}
                  className={`tiger-nav-link${active ? " active" : ""}`}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          className="tiger-nav-mobile-toggle"
          aria-expanded={mobileOpen}
          aria-controls="tiger-mobile-panel"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div
        id="tiger-mobile-panel"
        className={`tiger-nav-mobile-panel${mobileOpen ? " open" : ""}`}
      >
        {NAV.flatMap((item) =>
          item.children
            ? item.children.map((c) =>
                isHeading(c) ? (
                  <div
                    key={`h-${c.heading}`}
                    className="tiger-nav-mobile-heading"
                  >
                    {c.heading}
                  </div>
                ) : (
                  <Link key={c.href} href={c.href} onClick={closeMobile}>
                    {c.label}
                  </Link>
                ),
              )
            : item.href
              ? [
                  <Link key={item.href} href={item.href} onClick={closeMobile}>
                    {item.label}
                  </Link>,
                ]
              : [],
        )}
      </div>
    </header>
  );
}
