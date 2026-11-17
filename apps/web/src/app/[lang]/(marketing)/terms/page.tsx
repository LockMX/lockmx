import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/site/policy-document-view";
import { Section } from "@/components/site/sections/section";
import { termsPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";
import { getPolicy } from "@/server/site/policies/policies";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { legal } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: termsPath,
    title: legal.terms,
    description: legal.termsDescription,
  });
}

// The terms and conditions (spec 004, T7). Their text lives in
// `server/site/policies/` and is changed there.
export default async function TermsPage() {
  const locale = await getCurrentLocale();
  const { footer, legal } = await getMessages(locale);

  return (
    <Section id="terms-and-conditions" level={1} eyebrow={footer.legalTitle} title={legal.terms}>
      <PolicyDocumentView document={getPolicy("terms", locale)} />
    </Section>
  );
}
