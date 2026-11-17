import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/site/policy-document-view";
import { Section } from "@/components/site/sections/section";
import { privacyPolicyPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";
import { getPrivacyPolicy } from "@/server/site/policies/privacy-policy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { legal } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: privacyPolicyPath,
    title: legal.privacy,
    description: legal.privacyDescription,
  });
}

// The privacy policy (spec 004, T7). Its text lives in
// `server/site/policies/` and is changed there.
export default async function PrivacyPolicyPage() {
  const locale = await getCurrentLocale();
  const { footer, legal } = await getMessages(locale);

  return (
    <Section id="privacy-policy" level={1} eyebrow={footer.legalTitle} title={legal.privacy}>
      <PolicyDocumentView document={getPrivacyPolicy(locale)} />
    </Section>
  );
}
