// Source: 01-app/03-api-reference/03-file-conventions/route-groups.md (bundled Next.js docs):
// the group gives its pages this layout without changing their address.
import { ErrorMessagesProvider } from "@/components/site/error-messages";
import { SectionFocus } from "@/components/site/section-focus";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";
import { legalPageHref, legalPages } from "@/lib/site/legal-pages";
import { sectionHref, sectionIds } from "@/lib/site/sections";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";

const MAIN_ID = "main";

// The shell of every public page: skip link, header, main content and footer.
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();
  const { navigation, header, footer, legal, languageSwitcher, error } = await getMessages(locale);

  const homeHref = `/${locale}`;
  const navigationItems = [
    { href: homeHref, label: navigation.home },
    { href: sectionHref(locale, sectionIds.system), label: navigation.system },
    { href: sectionHref(locale, sectionIds.parts), label: navigation.parts },
    { href: sectionHref(locale, sectionIds.why), label: navigation.why },
    { href: sectionHref(locale, sectionIds.contact), label: navigation.contact },
  ];
  const legalItems = legalPages.map((page) => ({
    href: legalPageHref(locale, page),
    label: legal[page],
  }));
  const copyright = footer.copyright.replace("{year}", String(new Date().getFullYear()));

  return (
    <>
      <SectionFocus />
      <SkipLink targetId={MAIN_ID} label={header.skipToContent} />
      <SiteHeader
        locale={locale}
        homeHref={homeHref}
        logoAlt={header.logoAlt}
        navigationLabel={navigation.main}
        menuLabel={header.menu}
        navigationItems={navigationItems}
        languageLabel={languageSwitcher.label}
      />
      {/* Focusable only so the skip link can move the focus here; it is not a tab stop. */}
      <main id={MAIN_ID} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <ErrorMessagesProvider messages={{ ...error, homeHref }}>{children}</ErrorMessagesProvider>
      </main>
      <SiteFooter
        locale={locale}
        logoAlt={footer.logoAlt}
        tagline={footer.tagline}
        navigationLabel={navigation.footer}
        navigationTitle={footer.navigationTitle}
        navigationItems={navigationItems}
        legalTitle={footer.legalTitle}
        legalItems={legalItems}
        complaintsBookLabel={footer.complaintsBook}
        languageLabel={languageSwitcher.label}
        copyright={copyright}
      />
    </>
  );
}
