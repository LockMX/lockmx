// Source: 01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md
// (bundled Next.js docs): one entry per address, with `alternates.languages`.
import type { MetadataRoute } from "next";
import { defaultLocale, htmlLang, locales, type Locale } from "@/lib/i18n/config";

// Every public page, without the locale. A page added to the site is added
// here, so it reaches the sitemap. The placeholder is not a public page.
export const publicPaths: readonly string[] = ["/"];

// The address of a page in a locale: "/" gives "/pt", "/company" gives "/pt/company".
export function localizedPath(locale: Locale, path: string): string {
  const segments = path.split("/").filter(Boolean);
  return `/${[locale, ...segments].join("/")}`;
}

// The address of a page in each language, keyed by `hreflang`, with the
// default locale as `x-default`.
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((locale) => [htmlLang[locale], localizedPath(locale, path)]),
  );
  languages["x-default"] = localizedPath(defaultLocale, path);
  return languages;
}

export function buildSitemap(
  origin: URL,
  paths: readonly string[] = publicPaths,
): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, origin).href;

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, each]) => [lang, absolute(each)]),
    );

    return locales.map((locale) => ({
      url: absolute(localizedPath(locale, path)),
      alternates: { languages },
    }));
  });
}
