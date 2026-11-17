import type { Locale } from "@/lib/i18n/config";
import type { PolicyDocument } from "@/lib/site/policy-document";
import { privacyPolicyEn } from "@/server/site/policies/privacy-policy.en";
import { privacyPolicyPt } from "@/server/site/policies/privacy-policy.pt";
import { returnPolicyEn } from "@/server/site/policies/return-policy.en";
import { returnPolicyPt } from "@/server/site/policies/return-policy.pt";
import { termsEn } from "@/server/site/policies/terms.en";
import { termsPt } from "@/server/site/policies/terms.pt";

// The policy texts kept in the repository, one file per policy and locale.
export const policies = ["privacy", "terms", "returns"] as const;

export type Policy = (typeof policies)[number];

const documents: Record<Policy, Record<Locale, PolicyDocument>> = {
  privacy: { pt: privacyPolicyPt, en: privacyPolicyEn },
  terms: { pt: termsPt, en: termsEn },
  returns: { pt: returnPolicyPt, en: returnPolicyEn },
};

/** A policy text in a locale. */
export function getPolicy(policy: Policy, locale: Locale): PolicyDocument {
  return documents[policy][locale];
}
