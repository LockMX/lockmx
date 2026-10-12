"use client";

import { SearchBar } from "@/components/ui";

export type HeroSearchLabels = {
  label: string;
  submit: string;
  placeholder: string;
  list: string;
  results: { one: string; other: string };
  noResults: string;
};

type HeroSearchProps = {
  labels: HeroSearchLabels;
  className?: string;
};

/**
 * The search bar of the hero. In place for its look only (spec 005, T4): it
 * has no suggestions and a submission leads nowhere, until the search task
 * (T7) gives it both.
 */
export function HeroSearch({ labels, className }: HeroSearchProps) {
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
