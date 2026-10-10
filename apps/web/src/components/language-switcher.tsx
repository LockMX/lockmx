"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { htmlLang, localeCodes, localeNames, locales, type Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/switch-locale-path";

type LanguageSwitcherProps = {
  label: string;
  current: Locale;
};

export function LanguageSwitcher({ label, current }: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex gap-4">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={switchLocalePath(pathname, locale)}
              lang={htmlLang[locale]}
              aria-current={locale === current ? "true" : undefined}
              // The underline marks the language in use, as the bar marks the page in the navigation.
              className="no-underline hover:underline aria-[current=true]:font-bold aria-[current=true]:underline"
            >
              {/* The code is what is seen; the name follows it in the accessible name. */}
              {localeCodes[locale]}{" "}
              <span className="sr-only">{localeNames[locale]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
