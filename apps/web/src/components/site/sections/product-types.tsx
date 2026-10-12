import { Section } from "@/components/site/sections/section";
import { Card, Icon } from "@/components/ui";
import type { ProductTypeEntry } from "@/lib/shop/product";

type ProductTypesProps = {
  id: string;
  eyebrow: string;
  title: string;
  /** Said on a type that has no page to lead to yet. */
  soonLabel: string;
  types: ProductTypeEntry[];
};

const CARD_CLASSES = "flex items-center justify-between gap-4";

const TITLE_CLASSES =
  "font-display text-heading-md leading-tight font-extrabold text-text-strong uppercase italic";

/**
 * One card per product type of the shop (spec 005, T4). A type with an
 * address is a link; one without is a plain card that says it comes soon.
 */
export function ProductTypes({ id, eyebrow, title, soonLabel, types }: ProductTypesProps) {
  if (types.length === 0) return null;

  return (
    <Section id={id} surface="subtle" eyebrow={eyebrow} title={title}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {types.map((type) =>
          type.href ? (
            <li key={type.key} className="grid">
              <Card href={type.href} className={CARD_CLASSES}>
                <h3 className={TITLE_CLASSES}>{type.title}</h3>
                <Icon name="arrow-right" size="lg" />
              </Card>
            </li>
          ) : (
            <Card as="li" key={type.key} className={CARD_CLASSES}>
              <h3 className={TITLE_CLASSES}>{type.title}</h3>
              <span className="text-sm leading-tight text-text-muted">{soonLabel}</span>
            </Card>
          ),
        )}
      </ul>
    </Section>
  );
}
