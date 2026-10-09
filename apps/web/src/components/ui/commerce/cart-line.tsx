import Image from "next/image";
import { classNames } from "@/components/ui/class-names";
import { Price } from "@/components/ui/commerce/price";
import { Icon } from "@/components/ui/core/icon";
import { QuantityStepper } from "@/components/ui/forms/quantity-stepper";

export type CartLineImage = {
  src: string;
  /** Leave out when the title says it all: the image is then decorative. */
  alt?: string;
};

type FullLineProps = {
  compact?: false;
  quantitySummary?: undefined;
  /** The accessible name of the quantity field. */
  quantityLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
  /** The most the stepper allows. */
  max?: number;
  /** Required: a stepper nobody answers would not move. */
  onQuantityChange: (quantity: number) => void;
} & (
  | { removeLabel?: undefined; onRemove?: undefined }
  | {
      /** The text of the remove button; the title is added to its name. */
      removeLabel: string;
      onRemove: () => void;
    }
);

type CompactLineProps = {
  /** A line to read, not to change: an order summary. */
  compact: true;
  /** The quantity as text; `{count}` is replaced by the number. */
  quantitySummary: string;
  quantityLabel?: undefined;
  decreaseLabel?: undefined;
  increaseLabel?: undefined;
  max?: undefined;
  onQuantityChange?: undefined;
  removeLabel?: undefined;
  onRemove?: undefined;
};

export type CartLineProps = Omit<
  React.ComponentProps<"div">,
  "style" | "children" | "title"
> & {
  title: string;
  /** The variant or other details, under the title. */
  meta?: string;
  image?: CartLineImage;
  quantity: number;
  /** The total of the line in whole cents, as the server computed it. */
  lineTotalCents: number;
  locale: string;
  currency?: string;
} & (FullLineProps | CompactLineProps);

// `next/image` takes the rendered size as numbers of pixels; the box itself is
// sized by `size-22` and `size-14`.
const IMAGE_PIXELS = { full: 88, compact: 56 };

// Keeps the visible label and the hidden title apart in the button's name.
const SPACE = " ";

/**
 * One line of a cart. It shows what it is given and reports what the customer
 * asks for: the quantity and the total are the caller's, never computed here.
 * A full line takes handlers, so its caller is a Client Component; a compact
 * line takes none.
 */
export function CartLine({
  title,
  meta,
  image,
  quantity,
  lineTotalCents,
  locale,
  currency,
  compact,
  quantitySummary,
  quantityLabel,
  decreaseLabel,
  increaseLabel,
  max,
  onQuantityChange,
  removeLabel,
  onRemove,
  className,
  ...divProps
}: CartLineProps) {
  const pixels = compact ? IMAGE_PIXELS.compact : IMAGE_PIXELS.full;

  return (
    <div
      {...divProps}
      className={classNames(
        "flex items-center gap-4 border-b border-border-subtle",
        compact ? "py-3" : "py-4.5",
        className,
      )}
    >
      <div
        data-cart-image
        className={classNames(
          "grid flex-none place-items-center overflow-hidden rounded-sm bg-surface-subtle text-ink-300",
          compact ? "size-14" : "size-22",
        )}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            width={pixels}
            height={pixels}
            className="size-full object-cover"
          />
        ) : (
          <Icon name="image" size="lg" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-md leading-snug font-semibold text-text-strong">{title}</span>
        {meta && <span className="text-sm text-text-muted">{meta}</span>}
        {compact ? (
          <span className="text-sm text-text-muted">
            {quantitySummary.replace("{count}", String(quantity))}
          </span>
        ) : (
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <QuantityStepper
              size="sm"
              label={quantityLabel}
              decreaseLabel={decreaseLabel}
              increaseLabel={increaseLabel}
              value={quantity}
              max={max}
              onChange={onQuantityChange}
            />
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text-strong"
              >
                <Icon name="trash-2" size="sm" />
                {removeLabel}
                {SPACE}
                <span className="sr-only">{title}</span>
              </button>
            )}
          </div>
        )}
      </div>
      <Price
        amountCents={lineTotalCents}
        locale={locale}
        currency={currency}
        size={compact ? "sm" : "md"}
      />
    </div>
  );
}
