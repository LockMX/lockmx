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

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
