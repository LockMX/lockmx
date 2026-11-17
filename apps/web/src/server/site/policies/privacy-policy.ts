import type { Locale } from "@/lib/i18n/config";
import type { PolicyDocument } from "@/lib/site/policy-document";
import { privacyPolicyEn } from "@/server/site/policies/privacy-policy.en";
import { privacyPolicyPt } from "@/server/site/policies/privacy-policy.pt";

const privacyPolicies: Record<Locale, PolicyDocument> = {
  pt: privacyPolicyPt,
  en: privacyPolicyEn,
};

/** The privacy policy in a locale. Its text lives in this folder, one file per locale. */
export function getPrivacyPolicy(locale: Locale): PolicyDocument {
  return privacyPolicies[locale];
}
