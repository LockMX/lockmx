import Link from "next/link";
import { Icon } from "@/components/ui";
import type { ShopSectionEntry } from "@/lib/shop/product";

type ShopSectionsProps = {
  id: string;
  /** Names the section; read by assistive technology only. */
  title: string;
  sections: ShopSectionEntry[];
};

/**
 * One large card per section of the shop, on the home page (spec 005, decision
 * 17). Each leads to the listing of its section. The dark surface is the place
 * of a photograph, which comes from the client: until then the card shows the
 * mark of an image to come, not a stand-in photograph.
 */
export function ShopSections({ id, title, sections }: ShopSectionsProps) {
  if (sections.length === 0) return null;

  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      tabIndex={-1}
      className="bg-surface-page text-text-body outline-none"
    >
      <div className="mx-auto max-w-page px-gutter py-16 md:py-24">
        <h2 id={headingId} className="sr-only">
          {title}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.key} className="grid">
              <Link
                href={section.href}
                data-surface="inverse"
                className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-md bg-surface-inverse p-6 text-text-inverse no-underline md:min-h-80 md:p-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center text-text-inverse-muted"
                >
                  <Icon name="image" size="lg" />
                </span>
                <span className="relative flex items-end justify-between gap-4">
                  <h3 className="font-display text-display-sm leading-display font-extrabold uppercase italic group-hover:text-yellow md:text-display-md">
                    {section.title}
                  </h3>
                  <Icon name="arrow-right" size="lg" className="text-yellow" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
