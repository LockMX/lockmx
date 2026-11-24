import Link from "next/link";
import { Button, Checkbox } from "@/components/ui";
import { classNames } from "@/components/ui/class-names";
import { AVAILABILITY_PARAM } from "@/lib/shop/listing-filters";
import { SEARCH_PARAM } from "@/lib/shop/search";
import type { Availability, ShopSection, ShopSectionEntry } from "@/lib/shop/product";

type ShopFiltersProps = {
  /** The address of this listing: where the form is sent and what clears it. */
  action: string;
  /** The listing of the whole shop. */
  allHref: string;
  sections: ShopSectionEntry[];
  /** Left out on the listing of the whole shop. */
  current?: ShopSection;
  /** The search the listing shows: applying the filters keeps it. */
  query?: string;
  availability: readonly Availability[];
  labels: {
    filters: string;
    sections: string;
    all: string;
    availability: string;
    inStock: string;
    outOfStock: string;
    apply: string;
    clear: string;
  };
};

const GROUP_TITLE = "text-2xs leading-tight font-bold tracking-label text-text-muted uppercase";

const SECTION_LINK =
  "text-md leading-snug no-underline hover:underline aria-[current=page]:font-bold aria-[current=page]:text-text-strong";

const HEADING_ID = "shop-filters-heading";

/**
 * The filters of a shop listing (spec 005, T13): the sections of the shop as
 * links, and the availability as a form sent with GET. The choice is in the
 * address, so it works without script and the server does the filtering.
 */
export function ShopFilters({
  action,
  allHref,
  sections,
  current,
  query,
  availability,
  labels,
}: ShopFiltersProps) {
  const options: { value: Availability; label: string }[] = [
    { value: "in", label: labels.inStock },
    { value: "out", label: labels.outOfStock },
  ];

  return (
    <aside aria-labelledby={HEADING_ID} className="flex flex-col gap-6">
      <h2
        id={HEADING_ID}
        className="font-display text-heading-md leading-tight font-extrabold text-text-strong uppercase italic"
      >
        {labels.filters}
      </h2>
      <nav aria-label={labels.sections} className="flex flex-col gap-3">
        <p className={GROUP_TITLE}>{labels.sections}</p>
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href={allHref}
              aria-current={current === undefined ? "page" : undefined}
              className={SECTION_LINK}
            >
              {labels.all}
            </Link>
          </li>
          {sections.map((section) => (
            <li key={section.key}>
              <Link
                href={section.href}
                aria-current={section.key === current ? "page" : undefined}
                className={SECTION_LINK}
              >
                {section.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form action={action} method="get" className="flex flex-col gap-4">
        {query && <input type="hidden" name={SEARCH_PARAM} value={query} />}
        <fieldset>
          {/* A legend takes no part in a flex layout, so the gap is its own. */}
          <legend className={classNames(GROUP_TITLE, "mb-3")}>{labels.availability}</legend>
          <div className="flex flex-col gap-3">
            {options.map((option) => (
              <Checkbox
                key={option.value}
                name={AVAILABILITY_PARAM}
                value={option.value}
                defaultChecked={availability.includes(option.value)}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" variant="secondary" size="sm">
            {labels.apply}
          </Button>
          <Link href={action} className="text-sm leading-tight">
            {labels.clear}
          </Link>
        </div>
      </form>
    </aside>
  );
}
