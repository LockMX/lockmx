import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/site/public-paths";

// The sections of the landing page. The ids are part of the address, so they
// are the same in both locales, like the paths (spec 002).
export const sectionIds = {
  system: "system",
  parts: "parts",
  why: "why",
  buy: "buy",
  complements: "complements",
  contact: "contact",
} as const;

export type SectionId = (typeof sectionIds)[keyof typeof sectionIds];

// The address of a section of the landing page, usable from any page.
export function sectionHref(locale: Locale, id: SectionId): string {
  return `${localizedPath(locale, "/")}#${id}`;
}
