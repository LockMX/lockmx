import { availabilities, type Availability, type ProductSummary } from "@/lib/shop/product";

// The filters of a shop listing travel in the address, so the server reads
// them and decides what is shown (spec 005, T6). Anything it does not know
// is ignored.
export const AVAILABILITY_PARAM = "availability";

export function parseAvailability(value: string | string[] | undefined): Availability[] {
  const given = value === undefined ? [] : Array.isArray(value) ? value : [value];
  return availabilities.filter((each) => given.includes(each));
}

// No choice is the same as every choice.
export function matchesAvailability(
  product: Pick<ProductSummary, "availableForSale">,
  selected: readonly Availability[],
): boolean {
  if (selected.length === 0) return true;
  return selected.includes(product.availableForSale ? "in" : "out");
}
