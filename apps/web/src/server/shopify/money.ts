import "server-only";
import type { Money } from "@/lib/shop/product";

// Shopify's `MoneyV2`: a decimal string and an ISO 4217 code.
export type ShopifyMoney = { amount: string; currencyCode: string };

const decimal = /^(\d+)(?:\.(\d+))?$/;

function minorDigits(currencyCode: string): number | null {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currencyCode }).resolvedOptions()
      .maximumFractionDigits ?? null;
  } catch {
    return null;
  }
}

// Whole minor units from the decimal string, by its digits and never through
// a floating-point number (spec 005, product data rule 1). Trailing zeros are
// fine ("100.0"); an amount with more significant decimals than the currency
// has is rejected, not rounded, and so is anything that is not an amount.
export function parseMoney({ amount, currencyCode }: ShopifyMoney): Money | null {
  if (!/^[A-Z]{3}$/.test(currencyCode)) return null;
  const digits = minorDigits(currencyCode);
  const match = decimal.exec(amount);
  if (digits === null || !match) return null;

  const [, whole, fraction = ""] = match;
  const significant = fraction.replace(/0+$/, "");
  if (significant.length > digits) return null;

  const amountCents = Number(whole + significant.padEnd(digits, "0"));
  if (!Number.isSafeInteger(amountCents)) return null;
  return { amountCents, currencyCode };
}
