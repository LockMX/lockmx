"use client";

// Sources: the bundled Next.js guide 01-app/02-guides/view-transitions.md
// (navigations are transitions, so a ViewTransition animates on navigation;
// "Crossfade content within the same route": a changed `key` makes the old and
// new content an exit and an enter), and https://react.dev/reference/react/ViewTransition
// (read 2026-11-26: `enter` and `exit` activate when a boundary is inserted or
// deleted in a Transition; `default="none"` turns every other trigger off; a
// class name is added as `view-transition-class`).
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Crossfades the content of the page when the page changes. Keyed by the
 * path, so a change of the query only (a filter) is an update of the same
 * boundary, which does not animate, and keeps the focus where it was. The
 * look of the crossfade is in globals.css (`page`).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition key={pathname} enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}
