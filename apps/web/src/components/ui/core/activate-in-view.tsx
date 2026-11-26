"use client";

// Sources (MDN, read 2026-11-26): IntersectionObserver() — the callback runs
// when the visible share of the target crosses a threshold, in either
// direction; IntersectionObserverEntry.intersectionRatio — the visible share,
// 0 to 1; @media/hover — `none` when the primary input cannot hover
// conveniently, as on a touch screen.
import { useEffect, useRef, useState } from "react";

const NO_HOVER = "(hover: none)";

// "Most of it": the share of the element that must be in view.
const IN_VIEW_RATIO = 0.6;

export type ActivateInViewProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * On a device without hover, marks itself `data-active` while most of it is
 * in view, and unmarks itself when it leaves, so an effect styled on
 * `in-data-active:` replays on every entry. On a device with hover it does
 * nothing: the effect follows the pointer there. The script only sets the
 * attribute; the effect is CSS.
 */
export function ActivateInView({ className, children }: ActivateInViewProps) {
  const element = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const target = element.current;
    if (!target || !window.matchMedia(NO_HOVER).matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setActive(entry.intersectionRatio >= IN_VIEW_RATIO);
      },
      { threshold: IN_VIEW_RATIO },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={element} data-active={active || undefined} className={className}>
      {children}
    </div>
  );
}
