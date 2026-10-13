"use client";

import { SearchBar } from "@/components/ui";

export type ShopSearchLabels = {
  label: string;
  submit: string;
  placeholder: string;
  list: string;
  results: { one: string; other: string };
  noResults: string;
};

type ShopSearchProps = {
  labels: ShopSearchLabels;
  className?: string;
};

/**
 * The search bar of the shop home. In place for its look only (spec 005,
 * T4 and T10): it has no suggestions and a submission leads nowhere, until
 * the search task (T7) gives it both.
 */
export function ShopSearch({ labels, className }: ShopSearchProps) {
  return (
    <SearchBar
      label={labels.label}
      submitLabel={labels.submit}
      placeholder={labels.placeholder}
      listLabel={labels.list}
      resultsLabel={labels.results}
      noResultsLabel={labels.noResults}
      onSubmit={(_query, event) => event.preventDefault()}
      className={className}
    />
  );
}
