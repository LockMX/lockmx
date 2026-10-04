// Sources:
// https://formatjs.github.io/docs/polyfills/intl-localematcher (match throws RangeError on malformed tags)
// https://github.com/jshttp/negotiator (languages() returns the Accept-Language tags by preference)
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

function isWellFormedTag(tag: string): boolean {
  try {
    Intl.getCanonicalLocales(tag);
    return true;
  } catch {
    return false;
  }
}

export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const requested = new Negotiator({
    headers: { "accept-language": acceptLanguage },
  })
    .languages()
    .filter(isWellFormedTag);

  try {
    return match(requested, locales, defaultLocale) as Locale;
  } catch {
    return defaultLocale;
  }
}
