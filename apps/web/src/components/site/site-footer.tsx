import { LanguageSwitcher } from "@/components/language-switcher";
import {
  SiteNavigation,
  SiteNavigationLink,
  type SiteNavigationItem,
} from "@/components/site/site-navigation";
import { Logo } from "@/components/ui";
import type { Locale } from "@/lib/i18n/config";

// The official platform of the electronic Complaints Book (DL 156/2005, art. 5.º-B).
// See docs/compliance/site-information-and-complaints.md.
const COMPLAINTS_BOOK_URL = "https://www.livroreclamacoes.pt";

const COLUMN_TITLE = "text-2xs leading-tight font-bold tracking-label text-yellow uppercase";

type SiteFooterProps = {
  locale: Locale;
  logoAlt: string;
  tagline: string;
  navigationLabel: string;
  navigationTitle: string;
  navigationItems: SiteNavigationItem[];
  /** Title of the legal column and name of its landmark. */
  legalTitle: string;
  /** The company page and the policy texts. */
  legalItems: SiteNavigationItem[];
  complaintsBookLabel: string;
  languageLabel: string;
  copyright: string;
};

/** The footer of every public page, with the links the law asks for. */
export function SiteFooter({
  locale,
  logoAlt,
  tagline,
  navigationLabel,
  navigationTitle,
  navigationItems,
  legalTitle,
  legalItems,
  complaintsBookLabel,
  languageLabel,
  copyright,
}: SiteFooterProps) {
  return (
    <footer data-surface="inverse" className="bg-surface-inverse text-text-inverse">
      <div className="mx-auto grid max-w-page gap-10 px-gutter py-12 md:grid-cols-[3fr_2fr_2fr]">
        <div className="flex flex-col gap-4">
          <Logo
            variant="lockup"
            tone="light"
            alt={logoAlt}
            sizes="12rem"
            className="h-auto w-48"
          />
          <p className="text-sm leading-body text-text-inverse-muted">{tagline}</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className={COLUMN_TITLE}>{navigationTitle}</p>
          <SiteNavigation label={navigationLabel} items={navigationItems} orientation="column" />
        </div>
        <div className="flex flex-col gap-3">
          <p className={COLUMN_TITLE}>{legalTitle}</p>
          <nav aria-label={legalTitle}>
            <ul className="flex flex-col gap-2">
              {legalItems.map((item) => (
                <li key={item.href}>
                  <SiteNavigationLink item={item} appearance="column" />
                </li>
              ))}
              <li>
                <a
                  href={COMPLAINTS_BOOK_URL}
                  rel="noopener noreferrer"
                  className="text-sm leading-body"
                >
                  {complaintsBookLabel}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-border-inverse">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-gutter py-5 text-xs leading-tight">
          <p className="text-text-inverse-muted">{copyright}</p>
          <LanguageSwitcher label={languageLabel} current={locale} />
        </div>
      </div>
    </footer>
  );
}
