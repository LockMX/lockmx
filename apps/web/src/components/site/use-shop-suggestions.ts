"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { MIN_SEARCH_LENGTH, SEARCH_PARAM, type ShopSuggestion } from "@/lib/shop/search";

// Asks the server for the suggestions of the shop's search bar (spec 005,
// T17) once the visitor pauses, and drops the answer to a text that is no
// longer in the field. Whatever goes wrong (the firewall's 429, a failed
// request, an answer of the wrong shape) is no suggestion.

export const SUGGESTIONS_ENDPOINT = "/api/search";

// Typing quickly sends one request, after the last key.
export const SUGGESTION_DELAY_MS = 250;

function isSuggestion(value: unknown): value is ShopSuggestion {
  if (typeof value !== "object" || value === null) return false;
  const { kind, label, href } = value as Record<string, unknown>;
  return (
    (kind === "section" || kind === "product") &&
    typeof label === "string" &&
    // Only an address of this site.
    typeof href === "string" &&
    href.startsWith("/") &&
    !href.startsWith("//")
  );
}

async function fetchSuggestions(locale: Locale, text: string, signal: AbortSignal): Promise<ShopSuggestion[]> {
  try {
    const params = new URLSearchParams({ [SEARCH_PARAM]: text, lang: locale });
    const response = await fetch(`${SUGGESTIONS_ENDPOINT}?${params}`, { signal });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    const suggestions = (body as { suggestions?: unknown })?.suggestions;
    return Array.isArray(suggestions) ? suggestions.filter(isSuggestion) : [];
  } catch {
    return [];
  }
}

type Answer = { text: string; suggestions: ShopSuggestion[] };

export function useShopSuggestions(
  locale: Locale,
  value: string,
): { suggestions: ShopSuggestion[]; pending: boolean } {
  const text = value.trim();
  const searchable = [...text].length >= MIN_SEARCH_LENGTH;
  const [answer, setAnswer] = useState<Answer>({ text: "", suggestions: [] });

  useEffect(() => {
    if (!searchable) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const suggestions = await fetchSuggestions(locale, text, controller.signal);
      if (!controller.signal.aborted) setAnswer({ text, suggestions });
    }, SUGGESTION_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [locale, text, searchable]);

  if (!searchable) return { suggestions: [], pending: false };
  // The last answer stays in the list until the next one arrives, so the list
  // does not close and open again at each pause.
  return { suggestions: answer.suggestions, pending: answer.text !== text };
}
