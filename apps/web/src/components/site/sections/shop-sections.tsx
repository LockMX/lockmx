import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/site/sections/section";
import { ActivateOnTap, Icon } from "@/components/ui";
import type { ShopSectionEntry } from "@/lib/shop/product";

type ShopSectionsProps = {
  id: string;
  eyebrow: string;
  title: string;
  sections: ShopSectionEntry[];
};

/**
 * One large card per section of the shop, on the home page (spec 005, decision
 * 1). Each leads to the listing of its section. The photograph is the image
 * of the section's collection in the store, under a backdrop that keeps the
 * title readable; without one, the card shows the mark of an image to come.
 * The photograph is decorative: the title names the link. Hovered, focused or,
 * on a device without hover, tapped, the card locks: corner brackets close
 * onto it, the photograph zooms and the arrow moves forward (spec 006, T6).
 */
export function ShopSections({ id, eyebrow, title, sections }: ShopSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <Section id={id} eyebrow={eyebrow} title={title}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.key} className="grid">
            <ActivateOnTap className="grid">
              <Link
                href={section.href}
                data-surface="inverse"
                className="group/lock relative flex min-h-56 flex-col justify-end overflow-hidden rounded-md bg-surface-inverse p-6 text-text-inverse no-underline md:min-h-80 md:p-8"
              >
                {section.image ? (
                  <>
                    <Image
                      src={section.image.url}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-(--duration-slow) motion-safe:locked:scale-103"
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-surface-backdrop" />
                  </>
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center text-text-inverse-muted"
                  >
                    <Icon name="image" size="lg" />
                  </span>
                )}
                <span aria-hidden="true" className="lock-brackets locked:lock-brackets-on" />
                <span className="relative flex items-end justify-between gap-4">
                  <h3 className="font-display text-display-sm leading-display font-extrabold uppercase italic transition-colors duration-(--duration-fade) locked:text-yellow md:text-display-md">
                    {section.title}
                  </h3>
                  <Icon
                    name="arrow-right"
                    size="lg"
                    className="text-yellow transition-transform duration-(--duration-lock) ease-(--ease-lock) locked:translate-x-2"
                  />
                </span>
              </Link>
            </ActivateOnTap>
          </li>
        ))}
      </ul>
    </Section>
  );
}
