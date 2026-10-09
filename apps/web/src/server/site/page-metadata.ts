// Source: 01-app/03-api-reference/04-functions/generate-metadata.md (bundled Next.js docs):
// `alternates.canonical` and `alternates.languages` may be relative; they are
// resolved against the `metadataBase` set in the root layout.
import type { Metadata } from "next";
import { defaultLocale, htmlLang, locales, type Locale } from "@/lib/i18n/config";

type PageMetadataInput = {
  locale: Locale;
  // Path of the page without the locale: "/" for the home page, "/company".
  path: string;
  // Left out on the home page, which shows the site title alone.
  title?: string;
  description: string;
};

function localizedPath(locale: Locale, path: string): string {
  const segments = path.split("/").filter(Boolean);
  return `/${[locale, ...segments].join("/")}`;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: PageMetadataInput): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((each) => [htmlLang[each], localizedPath(each, path)]),
  );
  languages["x-default"] = localizedPath(defaultLocale, path);

  return {
    ...(title === undefined ? {} : { title }),
    description,
    alternates: { canonical: localizedPath(locale, path), languages },
  };
}
