import { shopPath } from "@/lib/site/public-paths";

// The search of the shop (spec 005, T10). The text comes from the browser, so
// the server keeps it only when it is text of a sensible length; anything else
// is no search at all.

// The parameter the search travels under, in the listing's address and in the
// suggestions endpoint.
export const SEARCH_PARAM = "q";

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 100;

// What the search bar offers while the visitor types: a section of the shop
// or a product. The address is built on the server.
export type ShopSuggestion = {
  kind: "section" | "product";
  label: string;
  href: string;
};

// Control characters that are not white space: a tab separates words.
const CONTROL_CHARACTERS = /[^\P{Cc}\s]/gu;

export function parseSearchQuery(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "string") return null;

  const text = first.replace(CONTROL_CHARACTERS, "").replace(/\s+/g, " ").trim();
  const length = [...text].length;
  return length >= MIN_SEARCH_LENGTH && length <= MAX_SEARCH_LENGTH ? text : null;
}

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Used for the example data only: the store searches its own catalogue.
export function matchesSearch(text: string, query: string): boolean {
  const folded = fold(text);
  return fold(query)
    .split(" ")
    .every((word) => folded.includes(word));
}

// The listing of the whole shop, narrowed to a search.
export function shopSearchPath(query: string): string {
  return `${shopPath}?${new URLSearchParams({ [SEARCH_PARAM]: query })}`;
}
