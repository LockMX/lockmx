import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteHeader } from "@/components/site/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pt",
}));

const props = {
  locale: "pt" as const,
  homeHref: "/pt",
  logoAlt: "LockMX, página inicial",
  navigationLabel: "Principal",
  menuLabel: "Menu",
  navigationItems: [{ href: "/pt", label: "Início" }],
  languageLabel: "Idioma",
  shop: { href: "/pt/shop", label: "Loja" },
  cart: { href: "/pt/cart", label: "Carrinho" },
};

describe("SiteHeader", () => {
  test("is the banner, on the inverse surface", () => {
    render(<SiteHeader {...props} />);

    const banner = screen.getByRole("banner");
    expect(banner.getAttribute("data-surface")).toBe("inverse");
  });

  test("links the logo to the home of the locale, named by the alternative text", () => {
    render(<SiteHeader {...props} />);

    const home = screen.getByRole("link", { name: "LockMX, página inicial" });
    expect(home.getAttribute("href")).toBe("/pt");
    expect(within(home).getByRole("img").getAttribute("src")).toContain("wordmark-white-yellow.png");
  });

  test("has the main navigation and the language switcher, named from props", () => {
    render(<SiteHeader {...props} />);

    const banner = screen.getByRole("banner");
    const navigation = within(banner).getByRole("navigation", { name: "Principal" });

    expect(within(navigation).getByRole("link", { name: "Início" })).toBeTruthy();
    expect(within(navigation).getByRole("button", { name: "Menu" })).toBeTruthy();
    // Once in the bar, for wide screens, and once in the menu, for narrow ones.
    const switchers = within(banner).getAllByRole("navigation", { name: "Idioma" });
    expect(switchers).toHaveLength(2);
    expect(navigation.contains(switchers[0])).toBe(true);
    expect(navigation.contains(switchers[1])).toBe(false);
  });

  test("links to the shop and to the cart, outside the main navigation", () => {
    render(<SiteHeader {...props} />);

    const banner = screen.getByRole("banner");
    const navigation = within(banner).getByRole("navigation", { name: "Principal" });
    const shop = within(banner).getByRole("link", { name: "Loja" });
    const cart = within(banner).getByRole("link", { name: "Carrinho" });

    expect(shop.getAttribute("href")).toBe("/pt/shop");
    expect(cart.getAttribute("href")).toBe("/pt/cart");
    expect(navigation.contains(shop)).toBe(false);
    expect(navigation.contains(cart)).toBe(false);
  });
});
