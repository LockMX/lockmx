import Image from "next/image";
import Link from "next/link";
import { classNames } from "@/components/ui/class-names";
import { Price, type PriceAmount } from "@/components/ui/commerce/price";
import { Badge, type BadgeProps } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { Icon } from "@/components/ui/core/icon";

type ProductStock = "in" | "low" | "out";

export type ProductImage = {
  src: string;
  /** Leave out when the title says it all: the image is then decorative. */
  alt?: string;
  /** How wide the card is at each breakpoint; only the page's grid knows. */
  sizes: string;
};

export type ProductCardProps = Omit<
  React.ComponentProps<"article">,
  "style" | "children" | "title"
> & {
  title: string;
  /** The product page. The title is the link, and it covers the card. */
  href: string;
  price: PriceAmount;
  image?: ProductImage;
  category?: string;
  /** A merchandising flag over the image, for example "New". */
  badge?: string;
  stock?: ProductStock;
  /** The stock state in words, for example "In stock". */
  stockLabel: string;
} & (
    | { addLabel?: undefined; onAdd?: undefined }
    | {
        /** The text of the add button; the title is added to its name. */
        addLabel: string;
        onAdd: () => void;
      }
  );

// Keeps the visible label and the hidden title apart in the button's name.
const SPACE = " ";

const STOCK_TONES: Record<ProductStock, BadgeProps["tone"]> = {
  in: "success",
  low: "warning",
  out: "danger",
};

/**
 * A product in a grid. One link, on the title, covers the whole card; the add
 * button sits above it. It holds no cart logic: `onAdd` is the caller's, so a
 * page that passes it is a Client Component.
 */
export function ProductCard({
  title,
  href,
  price,
  image,
  category,
  badge,
  stock = "in",
  stockLabel,
  addLabel,
  onAdd,
  className,
  ...articleProps
}: ProductCardProps) {
  const out = stock === "out";

  return (
    <article
      {...articleProps}
      className={classNames(
        "group relative flex flex-col overflow-hidden rounded-md border border-border-subtle bg-surface-card transition-colors hover:border-border-strong",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-subtle">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            sizes={image.sizes}
            className={classNames(
              "object-cover transition-transform duration-(--duration-slow) motion-safe:group-hover:scale-103",
              out && "grayscale",
            )}
          />
        ) : (
          <div
            data-product-placeholder
            className="absolute inset-0 grid place-items-center text-ink-300"
          >
            <Icon name="image" size="lg" />
          </div>
        )}
        {badge && (
          <Badge tone="accent" variant="solid" shape="slant" className="absolute top-3 left-3">
            {badge}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {category && (
          <span className="text-2xs font-bold tracking-label text-text-muted uppercase">
            {category}
          </span>
        )}
        <h3 className="text-md leading-snug font-semibold text-pretty text-text-strong">
          <Link href={href} className="no-underline after:absolute after:inset-0">
            {title}
          </Link>
        </h3>
        <Badge tone={STOCK_TONES[stock]} dot className="self-start">
          {stockLabel}
        </Badge>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <Price {...price} size="md" />
          {onAdd && (
            // Positioned, and after the link in the document: above its cover.
            // The box, not the button, because a disabled button lets the
            // pointer through and the click would land on the link.
            <span className="relative inline-flex">
              <Button
                variant="secondary"
                size="sm"
                iconLeft="shopping-cart"
                disabled={out}
                onClick={onAdd}
              >
                {addLabel}
                {SPACE}
                <span className="sr-only">{title}</span>
              </Button>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
