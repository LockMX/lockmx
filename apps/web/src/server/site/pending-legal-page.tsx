import "server-only";
import type { Metadata } from "next";
import { PendingPageView } from "@/components/site/pending-page-view";
import { legalPagePaths, type LegalPage } from "@/lib/site/legal-pages";
import { localizedPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";

// The four legal pages are the same placeholder until the client delivers the
// company data and the policy texts (spec 004, T7). Each route then gets its
// own content and stops using this module.

// Source: 01-app/03-api-reference/04-functions/generate-metadata.md (bundled
// Next.js docs), `robots`: a placeholder is kept out of search engines.
export async function pendingLegalPageMetadata(page: LegalPage): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata, legal } = await getMessages(locale);

  return {
    ...buildPageMetadata({
      locale,
      path: legalPagePaths[page],
      title: legal[page],
      description: metadata.description,
    }),
    robots: { index: false },
  };
}

export async function PendingLegalPage({ page }: { page: LegalPage }) {
  const locale = await getCurrentLocale();
  const { legal } = await getMessages(locale);

  return (
    <PendingPageView
      title={legal[page]}
      message={legal.pending}
      homeLabel={legal.home}
      homeHref={localizedPath(locale, "/")}
    />
  );
}
