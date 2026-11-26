import {
  SiteNavigation,
  SiteNavigationLink,
  type SiteNavigationItem,
} from "@/components/site/site-navigation";
import { IconButton, Logo, type IconName } from "@/components/ui";

// The official platform of the electronic Complaints Book (DL 156/2005, art. 5.º-B).
// See docs/compliance/site-information-and-complaints.md.
const COMPLAINTS_BOOK_URL = "https://www.livroreclamacoes.pt";

const COLUMN_TITLE = "text-2xs leading-tight font-bold tracking-label text-yellow uppercase";

// The site of the developer, credited at the end of the footer (spec 006, decision 7).
const DEVELOPER_URL = "https://www.ricardorato.dev";

// The logo is 40rem wide at most, and the full width of the content below that.
// Source: --container-pad in styles/tokens.css (1rem, 2rem from 40rem up).
const LOGO_SIZES = "(min-width: 44rem) 40rem, (min-width: 40rem) calc(100vw - 4rem), calc(100vw - 2rem)";

const LINK_COLUMN = "flex flex-col items-center gap-3 text-center";

export type SiteFooterContactLink = {
  href: string;
  /** The accessible name of the icon. */
  label: string;
  icon: IconName;
  external?: boolean;
};

export type SiteFooterCredits = {
  /** The words before the developer's name. */
  lead: string;
  name: string;
  /** Read after the name: the link opens a new tab. */
  newTab: string;
};

type SiteFooterProps = {
  logoAlt: string;
  tagline: string;
  /** The email and the social networks, as icons above the copyright. */
  contactLinks: SiteFooterContactLink[];
  navigationLabel: string;
  navigationTitle: string;
  navigationItems: SiteNavigationItem[];
  /** Title of the legal column and name of its landmark. */
  legalTitle: string;
  /** The company page and the policy texts. */
  legalItems: SiteNavigationItem[];
  complaintsBookLabel: string;
  copyright: string;
  credits: SiteFooterCredits;
};

/**
 * The footer of every public page, with the links the law asks for. It leads
 * with the large logo and the brand line; the credits close it.
 */
export function SiteFooter({
  logoAlt,
  tagline,
  contactLinks,
  navigationLabel,
  navigationTitle,
  navigationItems,
  legalTitle,
  legalItems,
  complaintsBookLabel,
  copyright,
  credits,
}: SiteFooterProps) {
  return (
    <footer data-surface="inverse" className="bg-surface-inverse text-text-inverse">
      <div className="mx-auto flex max-w-page flex-col items-center gap-10 px-gutter py-16 md:py-24">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <Logo
            variant="lockup"
            tone="light"
            alt={logoAlt}
            sizes={LOGO_SIZES}
            className="h-auto w-full max-w-160"
          />
          <p className="font-display text-display-sm leading-display font-extrabold tracking-display uppercase italic sm:text-display-md lg:text-display-lg">
            {tagline}
          </p>
        </div>
        <div className="flex w-full flex-col gap-10 border-t border-border-inverse pt-10 sm:flex-row sm:items-start sm:justify-center sm:gap-24">
          <div className={LINK_COLUMN}>
            <p className={COLUMN_TITLE}>{navigationTitle}</p>
            <SiteNavigation label={navigationLabel} items={navigationItems} orientation="column" />
          </div>
          <div className={LINK_COLUMN}>
            <p className={COLUMN_TITLE}>{legalTitle}</p>
            <nav aria-label={legalTitle}>
              <ul className="flex flex-col items-center gap-2">
                {legalItems.map((item) => (
                  <li key={item.href}>
                    <SiteNavigationLink item={item} appearance="column" />
                  </li>
                ))}
                <li>
                  <a
                    href={COMPLAINTS_BOOK_URL}
                    rel="noopener noreferrer"
                    className="link-bar link-bar-hover inline-block pb-1 text-sm leading-body no-underline"
                  >
                    {complaintsBookLabel}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4 border-t border-border-inverse pt-8 text-center text-xs leading-body">
          <ul className="flex gap-2">
            {contactLinks.map((link) => (
              <li key={link.href}>
                <IconButton
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  variant="ghost-inverse"
                  size="xl"
                  rel={link.external ? "noopener noreferrer" : undefined}
                />
              </li>
            ))}
          </ul>
          <p className="text-text-inverse-muted">{copyright}</p>
          <p className="text-text-inverse-muted">
            {credits.lead}{" "}
            <a
              href={DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-bar link-bar-hover inline-block pb-1 no-underline"
            >
              {credits.name} <span className="sr-only">{credits.newTab}</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
