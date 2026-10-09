"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/components/ui/class-names";

export type SiteNavigationItem = {
  href: string;
  label: string;
};

type SiteNavigationProps = {
  /** Accessible name of the landmark, without the word "navigation". */
  label: string;
  items: SiteNavigationItem[];
  /** `row` for the header, `column` for the footer. */
  orientation?: "row" | "column";
};

const LINK_STYLES = {
  // The current page is marked by the slant bar, as in the logo.
  row: "relative py-2 text-sm leading-tight font-semibold tracking-label uppercase no-underline after:absolute after:inset-x-0 after:bottom-0 after:hidden after:h-1 after:skew-x-(--slant) after:bg-yellow aria-[current=page]:after:block",
  column: "text-sm leading-body no-underline hover:underline aria-[current=page]:font-semibold",
};

export function SiteNavigation({ label, items, orientation = "row" }: SiteNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className={classNames("flex", orientation === "row" ? "gap-6" : "flex-col gap-2")}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              className={LINK_STYLES[orientation]}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
