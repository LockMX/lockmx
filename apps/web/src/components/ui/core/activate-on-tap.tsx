"use client";

// Sources (MDN, read 2026-11-26): @media/hover — `none` when the primary input
// cannot hover conveniently, as on a touch screen; Event.preventDefault() — a
// cancelled click on a link does not follow it; HTMLElement.click() — fires a
// click on the element, as a tap would. React (react.dev, "Responding to
// Events"): an `onClickCapture` handler runs before the handlers of the
// children, and `stopPropagation` there keeps the click from reaching them.
// The bundled Next.js guide 01-app/02-guides/preserving-ui-state.md: transient
// state is reset in a `useLayoutEffect` cleanup, which also runs when a kept
// page is hidden.
import { useLayoutEffect, useRef, useState } from "react";

const NO_HOVER = "(hover: none)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// The token the lock-in effect lasts (styles/tokens.css): the wait before the link is followed.
const LOCK_DURATION = "--duration-lock";

export type ActivateOnTapProps = {
  className?: string;
  children: React.ReactNode;
};

/** The duration of the lock-in effect in milliseconds, read from its token. */
function lockDurationMs(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(LOCK_DURATION).trim();
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith("ms") ? amount : amount * 1000;
}

/** A plain tap on a touch screen, by a reader who did not ask for less motion. */
function waitsForTheEffect(event: React.MouseEvent): boolean {
  const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  return (
    !modified &&
    event.button === 0 &&
    window.matchMedia(NO_HOVER).matches &&
    !window.matchMedia(REDUCED_MOTION).matches
  );
}

/**
 * On a device without hover, a tap on the link inside marks it `data-active`,
 * so an effect styled on `locked:` (or `in-data-active:`) plays, and follows
 * the link once the effect has played (`--duration-lock`). On a device with
 * hover, under reduced motion, or with a modifier key, the link is followed at once. The
 * script only sets the attribute and delays the click; the effect is CSS.
 */
export function ActivateOnTap({ className, children }: ActivateOnTapProps) {
  const [active, setActive] = useState(false);
  const following = useRef(false);
  // The pending follow of the link, while the effect plays.
  const timer = useRef<number | undefined>(undefined);

  useLayoutEffect(
    () => () => {
      window.clearTimeout(timer.current);
      timer.current = undefined;
      setActive(false);
    },
    [],
  );

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (following.current) {
      following.current = false;
      return;
    }
    const link = (event.target as Element).closest("a[href]");
    if (!(link instanceof HTMLAnchorElement) || !waitsForTheEffect(event)) return;

    event.preventDefault();
    event.stopPropagation();
    if (timer.current !== undefined) return;

    setActive(true);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      following.current = true;
      link.click();
    }, lockDurationMs());
  }

  return (
    <div data-active={active || undefined} className={className} onClickCapture={handleClickCapture}>
      {children}
    </div>
  );
}
