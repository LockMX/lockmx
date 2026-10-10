import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/site/public-paths";

// The pages the footer links to under "Legal": the identification of the
// company and the policy texts (spec 004, T7). The paths are the same in both
// locales (spec 002).
export const legalPagePaths = {
  company: "/company",
  privacy: "/privacy",
  cookies: "/cookies",
  terms: "/terms",
} as const;

export type LegalPage = keyof typeof legalPagePaths;

// In the order the footer shows them.
export const legalPages = Object.keys(legalPagePaths) as LegalPage[];

export function legalPageHref(locale: Locale, page: LegalPage): string {
  return localizedPath(locale, legalPagePaths[page]);
}
