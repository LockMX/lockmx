import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteHeaderNavigation } from "@/components/site/site-header-navigation";
import type { SiteNavigationItem } from "@/components/site/site-navigation";
import { Logo } from "@/components/ui";
import type { Locale } from "@/lib/i18n/config";

type SiteHeaderProps = {
  locale: Locale;
  homeHref: string;
  /** Names the logo link, so it says where the link leads. */
  logoAlt: string;
  navigationLabel: string;
  /** Names the button that opens the links on a narrow screen. */
  menuLabel: string;
  navigationItems: SiteNavigationItem[];
  languageLabel: string;
};

/** The header of every public page. Stays at the top while the page scrolls. */
export function SiteHeader({
  locale,
  homeHref,
  logoAlt,
  navigationLabel,
  menuLabel,
  navigationItems,
  languageLabel,
}: SiteHeaderProps) {
  return (
    <header
      data-surface="inverse"
      className="sticky top-0 z-(--z-header) border-b border-border-inverse bg-surface-inverse text-text-inverse"
    >
      <div className="mx-auto flex h-header max-w-page items-center gap-4 px-gutter md:gap-8">
        <Link href={homeHref} className="shrink-0">
          <Logo
            variant="wordmark"
            tone="light"
            alt={logoAlt}
            sizes="8rem"
            loading="eager"
            className="h-6 w-auto"
          />
        </Link>
        {/* On a narrow screen the navigation is a menu button, beside the language switcher. */}
        <div className="ml-auto md:ml-0">
          <SiteHeaderNavigation
            label={navigationLabel}
            menuLabel={menuLabel}
            items={navigationItems}
          />
        </div>
        <div className="text-sm leading-tight md:ml-auto">
          <LanguageSwitcher label={languageLabel} current={locale} />
        </div>
      </div>
    </header>
  );
}
