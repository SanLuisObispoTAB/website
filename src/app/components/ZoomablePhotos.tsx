"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Click-to-enlarge for team photos.
//
// WHY
// The grid shows a gallery shot at roughly 360px and a squad portrait at
// about 1000px, while the file itself is 1200px wide. On a portrait holding
// two dozen faces that is the difference between recognising your kid and
// not. This hands back the full stored resolution on demand, without making
// every team page metres long.
//
// WHAT "FULL SIZE" MEANS HERE
// 1200px, and no more. `scripts/photo-intake.mjs` resizes every import to
// TARGET_WIDTH=1200 and the originals stay in the gitignored `photo-inbox/`,
// so 1200px is genuinely all the site holds. Raising that is a change to the
// intake convention and to page weight, not to this component.
//
// Built on <dialog> deliberately: `showModal()` gives focus trapping, the
// Esc key, inertness of the page behind, and the ::backdrop pseudo-element
// for free. Hand-rolling those is where accessible modals usually go wrong.

export type ZoomItem = {
  photo: string;
  /** Gallery caption, shown under the tile and again when enlarged. */
  caption?: string;
  /** Squad label, for the portraits variant. */
  label?: string;
  /** Sentence under the label. */
  note?: string;
  alt: string;
};

type Props = {
  items: ZoomItem[];
  /** Which section's markup and CSS to render. The two differ enough in
   *  layout that sharing one wrapper would mean fighting both stylesheets. */
  variant: "gallery" | "portraits";
};

/** The gallery needs its grid container; the portraits stack directly in the
 *  page container and gain nothing from a wrapper. */
function Wrapper({
  variant,
  children,
}: {
  variant: Props["variant"];
  children: React.ReactNode;
}) {
  return variant === "gallery" ? (
    <div className="slotab-team-gallery">{children}</div>
  ) : (
    <>{children}</>
  );
}

export default function ZoomablePhotos({ items, variant }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  // Clears state directly as well as closing the element. Relying on the
  // `close` event alone left React's state stale — the dialog was shut while
  // `open` was still an index, so the scroll-lock cleanup never ran and the
  // page stayed frozen. `close` does not bubble, which is exactly the kind of
  // event a synthetic system is least reliable about.
  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(null);
  }, []);

  const show = useCallback((i: number) => {
    setOpen(i);
    dialogRef.current?.showModal();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpen((cur) =>
        cur === null ? cur : (cur + delta + items.length) % items.length,
      );
    },
    [items.length],
  );

  // Esc closes the dialog natively, without touching our handler, so listen
  // for it on the element itself rather than through React's `onClose`.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onNativeClose = () => setOpen(null);
    el.addEventListener("close", onNativeClose);
    return () => el.removeEventListener("close", onNativeClose);
  }, []);

  // Arrow keys while enlarged. Esc is handled by <dialog> itself.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape") {
        // <dialog> closes itself on Esc, but the `close` event it is supposed
        // to fire proved unreliable in testing — the element shut while React
        // still held an open index, so the scroll lock was never released and
        // the page stayed frozen. Driving our own close() keeps element and
        // state in step. Calling close() on an already-closed dialog is a
        // no-op, so double-handling costs nothing.
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, close]);

  // `showModal()` blocks scrolling on the dialog itself but not reliably on
  // the page behind it, which shows up as the article scrolling under the
  // overlay on iOS.
  //
  // Keyed on OPEN/CLOSED, not on the photo index. Keying it on `open` meant
  // the effect tore down and re-ran on every arrow press, re-capturing
  // `previous` mid-cycle — and it captured "hidden", so closing the lightbox
  // restored "hidden" and left the page permanently unscrollable. Caught by
  // scrolling the page after closing and finding it frozen. One capture per
  // open/close cycle is the whole fix.
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const current = open === null ? null : items[open];

  return (
    <>
      {/* Portraits stack full-width with no wrapper; the gallery is a grid.
          Both keep the class names their existing CSS already targets. */}
      <Wrapper variant={variant}>
        {items.map((item, i) => (
          <figure
            key={item.photo}
            className={
              variant === "gallery"
                ? "slotab-team-gallery-item"
                : "slotab-team-photo-frame"
            }
          >
            {/* A button, not a div with onClick — this has to be reachable
                and operable from the keyboard like any other control. */}
            <button
              type="button"
              className="slotab-photo-zoom-trigger"
              onClick={() => show(i)}
              aria-label={`View larger: ${item.alt}`}
            >
              <Image
                src={item.photo}
                alt={item.alt}
                width={1200}
                height={800}
                sizes={
                  variant === "gallery"
                    ? "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 360px"
                    : "(max-width: 1024px) 100vw, 1100px"
                }
                loading="lazy"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <span className="slotab-photo-zoom-hint" aria-hidden>
                ⤢
              </span>
            </button>
            {(item.label || item.note || item.caption) && (
              <figcaption
                className={
                  variant === "gallery"
                    ? "slotab-team-gallery-caption"
                    : "slotab-team-photo-caption"
                }
              >
                {item.label}
                {item.caption}
                {item.note && (
                  <span className="slotab-team-photo-note">{item.note}</span>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </Wrapper>

      <dialog
        ref={dialogRef}
        className="slotab-lightbox"
        // Clicking the backdrop closes. The dialog element *is* the backdrop
        // hit area, so a click landing on the dialog itself rather than on
        // its inner panel means the user clicked outside the photo.
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        {current && (
          <div className="slotab-lightbox-panel">
            <button
              type="button"
              className="slotab-lightbox-close"
              onClick={close}
              aria-label="Close"
            >
              ✕
            </button>

            {items.length > 1 && (
              <button
                type="button"
                className="slotab-lightbox-nav prev"
                onClick={() => step(-1)}
                aria-label="Previous photo"
              >
                ‹
              </button>
            )}

            <Image
              src={current.photo}
              alt={current.alt}
              width={1200}
              height={800}
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="slotab-lightbox-img"
              // Eager, and not negotiable. next/image defaults to lazy, which
              // deadlocks here: the CSS box starts at zero, the lazy loader
              // concludes an offscreen/zero-size image needn't load, so it
              // never loads, so the box stays zero. Observed exactly that —
              // dialog open at 1280x800 with a 0x0 image and an empty
              // currentSrc. This image IS the reason the dialog opened.
              loading="eager"
            />

            {items.length > 1 && (
              <button
                type="button"
                className="slotab-lightbox-nav next"
                onClick={() => step(1)}
                aria-label="Next photo"
              >
                ›
              </button>
            )}

            {(current.label || current.note || current.caption) && (
              <p className="slotab-lightbox-caption">
                {/* The separator belongs to the pair, not to the label — a
                    portrait with a label and no note was rendering
                    "Dance Team. " with a dangling full stop. */}
                {current.label && (
                  <strong>
                    {current.label}
                    {current.caption || current.note ? ". " : ""}
                  </strong>
                )}
                {current.caption ?? current.note}
              </p>
            )}
            {items.length > 1 && (
              <p className="slotab-lightbox-count">
                {open! + 1} of {items.length}
              </p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
