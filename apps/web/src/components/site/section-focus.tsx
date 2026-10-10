"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { findSectionTarget } from "@/lib/site/section-target";

/**
 * Moves the focus to the section a link of the page leads to. `next/link`
 * scrolls to the fragment but leaves the focus on the link, so the next Tab
 * would go on from the link and not from the section (WCAG 2.4.3).
 * The same is done for the fragment a page opens with, also when the page was
 * reached from another one, and for one reached with the back button.
 * Renders nothing; the marketing layout mounts it once for every link.
 */
function focusFragment() {
  findSectionTarget(window.location.href, window.location)?.focus({ preventScroll: true });
}

export function SectionFocus() {
  const pathname = usePathname();

  // Runs when the page opens and again when the visitor moves to another page:
  // the layout stays mounted, and by then the new page is in the document.
  useLayoutEffect(focusFragment, [pathname]);

  // A layout effect: the links answer a click as soon as the page is hydrated,
  // and with a passive effect a click in the moment before it ran was missed
  // (seen on WebKit in the end-to-end tests).
  useLayoutEffect(() => {
    const focusSection = (event: MouseEvent) => {
      const opensElsewhere = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (opensElsewhere || !(link instanceof HTMLAnchorElement)) return;

      // The scroll is left to the navigation, which stops below the sticky header.
      findSectionTarget(link.href, window.location)?.focus({ preventScroll: true });
    };

    document.addEventListener("click", focusSection);
    window.addEventListener("hashchange", focusFragment);
    return () => {
      document.removeEventListener("click", focusSection);
      window.removeEventListener("hashchange", focusFragment);
    };
  }, []);

  return null;
}
