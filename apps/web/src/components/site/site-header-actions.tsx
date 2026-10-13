"use client";

import { usePathname } from "next/navigation";
import type { SiteNavigationItem } from "@/components/site/site-navigation";
import { ButtonLink, IconButton } from "@/components/ui";

type SiteHeaderActionsProps = {
  shop: SiteNavigationItem;
  cart: SiteNavigationItem;
};

/**
 * The way into the shop and the cart, at the right of the header. Below `lg`
 * the shop link shows only its icon, so the header fits; its name stays in the link.
 */
export function SiteHeaderActions({ shop, cart }: SiteHeaderActionsProps) {
  const pathname = usePathname();
  const current = (href: string) => (href === pathname ? "page" : undefined);

  return (
    <div className="ml-auto flex items-center gap-2 lg:gap-4">
      <ButtonLink href={shop.href} size="sm" iconLeft="store" aria-current={current(shop.href)}>
        <span className="sr-only lg:not-sr-only">{shop.label}</span>
      </ButtonLink>
      <IconButton
        href={cart.href}
        icon="shopping-cart"
        label={cart.label}
        variant="ghost-inverse"
        aria-current={current(cart.href)}
      />
    </div>
  );
}
