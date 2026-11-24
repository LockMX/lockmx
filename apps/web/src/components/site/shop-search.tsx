"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useShopSuggestions } from "@/components/site/use-shop-suggestions";
import { SearchBar } from "@/components/ui";
import type { Locale } from "@/lib/i18n/config";
import { SEARCH_PARAM, type ShopSuggestion } from "@/lib/shop/search";

export type ShopSearchLabels = {
  label: string;
  submit: string;
  placeholder: string;
  list: string;
  results: { one: string; other: string };
  noResults: string;
  /** Shown beside a suggestion that is a section of the shop. */
  section: string;
};

type ShopSearchProps = {
  locale: Locale;
  /** The listing of the whole shop, where a search is sent. */
  action: string;
  /** The search the listing shows, if any. */
  defaultValue?: string;
  labels: ShopSearchLabels;
  className?: string;
};

/**
 * The search bar of the shop (spec 005, T17). It suggests sections and
 * products while the visitor types; a suggestion leads where it says, and a
 * submission is a plain GET of the listing, so it works without script.
 */
export function ShopSearch({ locale, action, defaultValue = "", labels, className }: ShopSearchProps) {
  const router = useRouter();
  const [text, setText] = useState(defaultValue);
  const [edited, setEdited] = useState(false);
  const { suggestions, pending } = useShopSuggestions(locale, text, edited);

  function change(next: string) {
    setText(next);
    setEdited(true);
  }

  const options = suggestions.map((suggestion: ShopSuggestion) => ({
    ...suggestion,
    icon: suggestion.kind === "section" ? ("store" as const) : ("package" as const),
    meta: suggestion.kind === "section" ? labels.section : undefined,
  }));

  return (
    <SearchBar
      action={action}
      method="get"
      name={SEARCH_PARAM}
      label={labels.label}
      submitLabel={labels.submit}
      placeholder={labels.placeholder}
      listLabel={labels.list}
      resultsLabel={labels.results}
      noResultsLabel={labels.noResults}
      value={text}
      onChange={change}
      suggestions={options}
      filter={false}
      pending={pending}
      onSelect={(option) => router.push(option.href)}
      className={className}
    />
  );
}
