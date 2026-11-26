import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteHeaderActions } from "@/components/site/site-header-actions";
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
  shop: SiteNavigationItem;
  cart: SiteNavigationItem;
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
  shop,
  cart,
}: SiteHeaderProps) {
  return (
    <header
      data-surface="inverse"
      // Named for view transitions, so it stays still while the page crossfades.
      className="sticky top-0 z-(--z-header) border-b border-border-inverse bg-surface-inverse text-text-inverse [view-transition-name:site-header]"
    >
      <div className="mx-auto flex h-header max-w-page items-center gap-4 px-gutter lg:gap-8">
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
        {/* On a narrow screen the navigation is a menu button at the right end,
            and the language switcher is inside the menu: at 320 px it does not
            fit beside the shop, the cart and the button. */}
        <div className="order-last lg:order-none">
          <SiteHeaderNavigation
            label={navigationLabel}
            menuLabel={menuLabel}
            items={navigationItems}
          >
            <LanguageSwitcher label={languageLabel} current={locale} />
          </SiteHeaderNavigation>
        </div>
        <SiteHeaderActions shop={shop} cart={cart} />
        <div className="hidden text-sm leading-tight lg:block">
          <LanguageSwitcher label={languageLabel} current={locale} />
        </div>
      </div>
    </header>
  );
}
