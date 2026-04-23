"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};
type NavItem = {
  label: string;
  href?: string;
  children?: NavLink[];
};

// Primary nav — 6 top-level items + persistent Join CTA.
// See docs/ (migration plan) for the IA rationale.
const NAV: NavItem[] = [
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
      { href: "/merch", label: "Merch" },
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
  {
    label: "Teams",
    children: [
      { href: "/teams", label: "All Teams" },
      { href: "/teams/football", label: "Football" },
      { href: "/teams/girls-volleyball", label: "Girls Volleyball" },
      { href: "/teams/baseball", label: "Baseball" },
      { href: "/teams/track-field", label: "Track & Field" },
    ],
  },
  {
    label: "Watch",
    children: [
      { href: "/watch", label: "Hudl Games" },
      {
        href: "https://www.youtube.com/@TNNSLOHS",
        label: "Tiger News Network",
        external: true,
      },
    ],
  },
  { label: "Hall of Fame", href: "/hall-of-fame" },
];

function DropdownTrigger({
  item,
  isOpen,
  onToggle,
  onClose,
  currentPath,
}: {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  currentPath: string;
}) {
  const containsActive = item.children?.some(
    (c) => !c.external && currentPath.startsWith(c.href),
  );
  return (
    <li className={`slotab-nav-item has-dropdown ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`slotab-nav-trigger ${containsActive ? "active" : ""}`}
      >
        {item.label}
        <span className="slotab-nav-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {item.children && (
        <ul className="slotab-nav-dropdown" role="menu">
          {item.children.map((c) => (
            <li key={c.href} role="none">
              <Link
                href={c.href}
                role="menuitem"
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                onClick={onClose}
              >
                {c.label}
                {c.external && (
                  <span
                    aria-hidden="true"
                    style={{ marginLeft: "0.4rem", opacity: 0.6 }}
                  >
                    ↗
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Header() {
  const pathname = usePathname() || "/";
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close the open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openLabel) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenLabel(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openLabel]);

  // Also close on route change.
  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  return (
    <>
      <header className="slotab-header" ref={navRef}>
        <div className="slotab-header-inner">
          <Link
            href="/"
            className="slotab-brand"
            aria-label="SLOTAB home"
            onClick={() => setOpenLabel(null)}
          >
            <Image
              src="/logos/slotab-booster-club.png"
              alt="SLOTAB — SLO Tiger Athletic Booster Club"
              width={220}
              height={60}
              priority
              style={{ height: "52px", width: "auto" }}
            />
          </Link>

          <ul className="slotab-nav" aria-label="Primary">
            {NAV.map((item) => {
              if (item.children) {
                return (
                  <DropdownTrigger
                    key={item.label}
                    item={item}
                    isOpen={openLabel === item.label}
                    onToggle={() =>
                      setOpenLabel((prev) =>
                        prev === item.label ? null : item.label,
                      )
                    }
                    onClose={() => setOpenLabel(null)}
                    currentPath={pathname}
                  />
                );
              }
              const isActive =
                item.href === "/"
                  ? pathname === "/" ||
                    pathname === "/"
                  : item.href
                    ? pathname.startsWith(item.href)
                    : false;
              return (
                <li key={item.label} className="slotab-nav-item">
                  <Link
                    href={item.href ?? "#"}
                    className={isActive ? "active" : ""}
                    onClick={() => setOpenLabel(null)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/membership"
            className="slotab-join-btn"
            onClick={() => setOpenLabel(null)}
          >
            Join
          </Link>
        </div>
      </header>
    </>
  );
}
