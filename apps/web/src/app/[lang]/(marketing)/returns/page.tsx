import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/site/policy-document-view";
import { Section } from "@/components/site/sections/section";
import { returnPolicyPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";
import { getPolicy } from "@/server/site/policies/policies";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { legal } = await getMessages(locale);

  return buildPageMetadata({
    locale,
    path: returnPolicyPath,
    title: legal.returns,
    description: legal.returnsDescription,
  });
}

// The return policy (spec 004, T7). Its text lives in
// `server/site/policies/` and is changed there.
export default async function ReturnPolicyPage() {
  const locale = await getCurrentLocale();
  const { footer, legal } = await getMessages(locale);

  return (
    <Section id="return-policy" level={1} eyebrow={footer.legalTitle} title={legal.returns}>
      <PolicyDocumentView document={getPolicy("returns", locale)} />
    </Section>
  );
}
