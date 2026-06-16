"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import teamsData from "../../data/teams.json";
import { navSeason } from "../../data/seasons";

type NavLink = {
  href: string;
  label: string;
};
type NavItem = {
  label: string;
  href?: string;
  children?: NavLink[];
};

type TeamEntry = {
  slug: string;
  name: string;
  gender: "Boys" | "Girls" | "Co-ed";
  season: "Fall" | "Winter" | "Spring" | "Year-round";
  hasPage: boolean;
};

// Teams dropdown is built from teams.json so new pages appear automatically.
// Shows only the in-season teams (or the upcoming season during summer break),
// so the menu stays short and timely. "All Teams" always leads.
function teamChildren(): NavLink[] {
  const season = navSeason();
  const teams = (teamsData.teams as TeamEntry[])
    .filter(
      (t) => t.hasPage && (t.season === season || t.season === "Year-round"),
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) || a.gender.localeCompare(b.gender),
    );
  return [
    { href: "/teams", label: "All Teams" },
    ...teams.map((t) => ({
      href: `/teams/${t.slug}`,
      label: t.gender === "Co-ed" ? t.name : `${t.gender} ${t.name}`,
    })),
  ];
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
      { href: "/spring-social", label: "Spring Social" },
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
  return item.children?.some(
    (c) => path === c.href || path.startsWith(c.href + "/"),
  );
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
                  <div className="tiger-nav-dropdown" role="menu">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        role="menuitem"
                        onClick={closeDropdown}
                      >
                        {c.label}
                      </Link>
                    ))}
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
            ? item.children.map((c) => (
                <Link key={c.href} href={c.href} onClick={closeMobile}>
                  {c.label}
                </Link>
              ))
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
