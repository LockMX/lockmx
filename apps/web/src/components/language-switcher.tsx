"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { htmlLang, localeNames, locales, type Locale } from "@/lib/i18n/config";
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
            >
              {localeNames[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
