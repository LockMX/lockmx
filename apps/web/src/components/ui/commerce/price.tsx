import { classNames } from "@/components/ui/class-names";

type PriceSize = "sm" | "md" | "lg" | "xl";
type PriceTone = "default" | "inverse";

/** What a price is, as plain data a Server Component can pass on. */
export type PriceAmount = {
  /** Whole cents: 34900 is 349,00 €. Never a decimal amount. */
  amountCents: number;
  /** The locale the amount is written in, for example `pt-PT` or `en`. */
  locale: string;
  currency?: string;
} & (
  | { compareAtCents?: undefined; compareAtLabel?: undefined; currentLabel?: undefined }
  | {
      /** The price before the reduction, in whole cents, shown struck through. */
      compareAtCents: number;
      /** Read before the old price, for example "Before". */
      compareAtLabel: string;
      /** Read before the current price, for example "Now". */
      currentLabel: string;
    }
);

export type PriceProps = Omit<React.ComponentProps<"span">, "style" | "children"> &
  PriceAmount & {
    size?: PriceSize;
    /** `inverse` is for a dark surface. */
    tone?: PriceTone;
    /** Short text under the price, for example "VAT included". */
    note?: string;
  };

const AMOUNT_SIZE_CLASSES: Record<PriceSize, string> = {
  sm: "text-heading-sm",
  md: "text-heading-md",
  lg: "text-display-sm",
  xl: "text-display-md",
};

const COMPARE_SIZE_CLASSES: Record<PriceSize, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-heading-md",
};

// A price that is not whole cents is a bug in the caller, and showing a
// rounded guess of it would be worse than not rendering.
function format(cents: number, locale: string, currency: string): string {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new RangeError(`A price must be a whole, non-negative number of cents: ${cents}`);
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

// A word read before an amount, with the space that keeps the two apart.
function spoken(label: string): string {
  return `${label} `;
}

/**
 * An amount of money, written by `Intl` for the locale. It formats and never
 * computes: a total comes from the server already added up.
 */
export function Price({
  amountCents,
  compareAtCents,
  compareAtLabel,
  currentLabel,
  locale,
  currency = "EUR",
  size = "md",
  tone = "default",
  note,
  className,
  ...spanProps
}: PriceProps) {
  const reduced = compareAtCents !== undefined;
  const inverse = tone === "inverse";

  return (
    <span {...spanProps} className={classNames("inline-flex flex-col gap-0.5", className)}>
      <span className="inline-flex flex-wrap items-baseline gap-2">
        <span
          className={classNames(
            "font-display leading-none font-extrabold italic",
            AMOUNT_SIZE_CLASSES[size],
            inverse && "text-text-inverse",
            !inverse && (reduced ? "text-status-danger" : "text-text-strong"),
          )}
        >
          {/* The line through the old price is not read out, so words say it. */}
          {reduced && <span className="sr-only">{spoken(currentLabel)}</span>}
          {format(amountCents, locale, currency)}
        </span>
        {reduced && (
          <s
            className={classNames(
              COMPARE_SIZE_CLASSES[size],
              inverse ? "text-text-inverse-muted" : "text-text-subtle",
            )}
          >
            <span className="sr-only">{spoken(compareAtLabel)}</span>
            {format(compareAtCents, locale, currency)}
          </s>
        )}
      </span>
      {note && (
        <span
          className={classNames(
            "text-xs",
            inverse ? "text-text-inverse-muted" : "text-text-muted",
          )}
        >
          {note}
        </span>
      )}
    </span>
  );
}
