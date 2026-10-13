// Source: 01-app/03-api-reference/04-functions/generate-metadata.md (bundled
// Next.js docs), `robots`: a cart is not a page for search results.
import type { Metadata } from "next";
import { Section } from "@/components/site/sections/section";
import { ButtonLink } from "@/components/ui";
import { cartPath, localizedPath, shopPath } from "@/lib/site/public-paths";
import { getCurrentLocale } from "@/server/i18n/current-locale";
import { getMessages } from "@/server/i18n/messages";
import { buildPageMetadata } from "@/server/site/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { metadata, shop } = await getMessages(locale);

  return {
    ...buildPageMetadata({
      locale,
      path: cartPath,
      title: shop.cart.title,
      description: metadata.description,
    }),
    robots: { index: false },
  };
}

// The cart, empty until the store is connected: its lines, prices and totals
// come from Shopify, never from the browser (spec 005, decision 16).
export default async function Cart() {
  const locale = await getCurrentLocale();
  const { shop } = await getMessages(locale);

  return (
    <Section id="cart" level={1} eyebrow={shop.home.title} title={shop.cart.title}>
      <p className="text-lg leading-body">{shop.cart.empty}</p>
      <div>
        <ButtonLink href={localizedPath(locale, shopPath)} iconRight="arrow-right">
          {shop.cart.action}
        </ButtonLink>
      </div>
    </Section>
  );
}
