"use client";

// Source: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ and its
// navigation menu example (read 2026-10-10): a button with `aria-expanded`
// and `aria-controls` inside the navigation landmark; Escape closes the menu
// and puts the focus on the button.
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SiteNavigationLink, type SiteNavigationItem } from "@/components/site/site-navigation";
import { IconButton } from "@/components/ui";
import { classNames } from "@/components/ui/class-names";

// Tailwind's default `md` breakpoint, the one the `md:` classes below use.
// Source: node_modules/tailwindcss/theme.css (`--breakpoint-md: 48rem`).
const DESKTOP_QUERY = "(min-width: 48rem)";

type SiteHeaderNavigationProps = {
  /** Accessible name of the landmark, without the word "navigation". */
  label: string;
  /** Name of the button that opens the links on a narrow screen. */
  menuLabel: string;
  items: SiteNavigationItem[];
};

/**
 * The links of the header. From `md` up they sit in a row; below it a button
 * opens them under the header. The list is hidden with `display` only, so it
 * is never shown without also being exposed to assistive technology.
 */
export function SiteHeaderNavigation({ label, menuLabel, items }: SiteHeaderNavigationProps) {
  const pathname = usePathname();
  const listId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The menu is open only on the page where it was opened: the header stays
  // mounted between pages, so a page change closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  // Asked on every resize: the `change` event of the media query did not
  // fire on the mobile WebKit of Playwright when the width passed the breakpoint.
  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.matchMedia(DESKTOP_QUERY).matches) setOpenAt(null);
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  // The focus goes to the button: it may be on a link that is now hidden.
  function close() {
    if (!open) return;
    setOpenAt(null);
    buttonRef.current?.focus();
  }

  return (
    <nav
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <IconButton
        ref={buttonRef}
        icon={open ? "x" : "menu"}
        label={menuLabel}
        variant="ghost-inverse"
        aria-expanded={open}
        aria-controls={listId}
        className="md:hidden"
        onClick={() => setOpenAt(open ? null : pathname)}
      />
      <ul
        id={listId}
        className={classNames(
          "absolute inset-x-0 top-full flex-col items-start gap-2 border-b border-border-inverse bg-surface-inverse px-gutter py-4",
          "md:static md:flex md:flex-row md:items-center md:gap-6 md:border-b-0 md:p-0",
          open ? "flex" : "hidden",
        )}
      >
        {items.map((item) => (
          <li key={item.href}>
            <SiteNavigationLink item={item} appearance="row" onClick={close} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
