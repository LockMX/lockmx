export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

// Value of the <html lang> attribute for each locale.
export const htmlLang: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en",
};

// Each language is named in its own language, so it is not translated.
export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
};

// What the language switcher shows; the full name goes with it for assistive technology.
export const localeCodes: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
