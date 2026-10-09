import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteNavigation, type SiteNavigationItem } from "@/components/site/site-navigation";
import { Logo } from "@/components/ui";
import type { Locale } from "@/lib/i18n/config";

type SiteHeaderProps = {
  locale: Locale;
  homeHref: string;
  /** Names the logo link, so it says where the link leads. */
  logoAlt: string;
  navigationLabel: string;
  navigationItems: SiteNavigationItem[];
  languageLabel: string;
};

/** The header of every public page. Stays at the top while the page scrolls. */
export function SiteHeader({
  locale,
  homeHref,
  logoAlt,
  navigationLabel,
  navigationItems,
  languageLabel,
}: SiteHeaderProps) {
  return (
    <header
      data-surface="inverse"
      className="sticky top-0 z-(--z-header) border-b border-border-inverse bg-surface-inverse text-text-inverse"
    >
      <div className="mx-auto flex h-header max-w-page items-center gap-8 px-gutter">
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
        {/* The links do not fit beside the logo on a narrow screen; there they are in the footer. */}
        <div className="hidden md:block">
          <SiteNavigation label={navigationLabel} items={navigationItems} />
        </div>
        <div className="ml-auto text-sm leading-tight">
          <LanguageSwitcher label={languageLabel} current={locale} />
        </div>
      </div>
    </header>
  );
}
