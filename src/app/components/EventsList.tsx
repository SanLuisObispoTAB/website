"use client";

import { useMemo, useState } from "react";
import {
  ALL_EVENTS,
  activeCategories,
  type EventCategory,
} from "../data/events";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: DAY[d.getDay()],
    mon: MONTH[d.getMonth()],
    num: d.getDate(),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH[m - 1]} ${y}`;
}

export default function EventsList() {
  const cats = useMemo(() => activeCategories(), []);
  // Start with every category enabled
  const [enabled, setEnabled] = useState<Set<EventCategory>>(
    () => new Set(cats.map((c) => c.key)),
  );

  const toggle = (key: EventCategory) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allOn = () => setEnabled(new Set(cats.map((c) => c.key)));
  const allOff = () => setEnabled(new Set());

  const visible = ALL_EVENTS.filter((e) => enabled.has(e.category));

  // Group by month
  const grouped = new Map<string, typeof visible>();
  for (const e of visible) {
    const k = monthKey(e.date);
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(e);
  }

  return (
    <div className="slotab-events-page">
      <div className="slotab-event-filter">
        <div className="slotab-event-filter-head">
          <span className="slotab-kicker">Filter</span>
          <div className="slotab-event-filter-actions">
            <button type="button" onClick={allOn}>All</button>
            <span>·</span>
            <button type="button" onClick={allOff}>None</button>
          </div>
        </div>
        <div className="slotab-event-chips">
          {cats.map((c) => {
            const on = enabled.has(c.key);
            return (
              <button
                key={c.key}
                type="button"
                className={`slotab-event-chip ${on ? "on" : "off"} ${c.key === "non-sport" ? "accent" : ""}`}
                onClick={() => toggle(c.key)}
                aria-pressed={on}
              >
                <span className="chip-label">{c.label}</span>
                <span className="chip-count">{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="slotab-events-empty">
          No events match the current filter. Turn at least one category on.
        </p>
      )}

      {Array.from(grouped.entries()).map(([mk, events]) => (
        <section key={mk} className="slotab-event-month">
          <h2 className="slotab-event-month-title">{monthLabel(mk)}</h2>
          <ul className="slotab-event-list">
            {events.map((e) => {
              const d = formatDate(e.date);
              return (
                <li
                  key={e.id}
                  className={`slotab-event-row ${e.isSport ? "sport" : "non-sport"}`}
                >
                  <div className="slotab-event-date">
                    <span className="day">{d.day}</span>
                    <span className="num">{d.num}</span>
                    <span className="mon">{d.mon}</span>
                  </div>
                  <div className="slotab-event-body">
                    <div className="slotab-event-title">
                      {e.isSport && e.isHome !== undefined && (
                        <span
                          className={`slotab-event-tag ${e.isHome ? "home" : "away"}`}
                        >
                          {e.isHome ? "HOME" : "AWAY"}
                        </span>
                      )}
                      {e.title}
                    </div>
                    <div className="slotab-event-meta">
                      {d.time}
                      {e.detail && <> · {e.detail}</>}
                      {!e.detail && <> · {e.categoryLabel}</>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
