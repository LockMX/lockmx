import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteHeaderActions } from "@/components/site/site-header-actions";

const navigation = vi.hoisted(() => ({ pathname: "/pt" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const props = {
  shop: { href: "/pt/shop", label: "Loja" },
  cart: { href: "/pt/cart", label: "Carrinho" },
};

describe("SiteHeaderActions", () => {
  test("has the shop link before the cart link, each named", () => {
    navigation.pathname = "/pt";
    render(<SiteHeaderActions {...props} />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/pt/shop", "/pt/cart"]);
    expect(screen.getByRole("link", { name: "Loja" })).toBe(links[0]);
    expect(screen.getByRole("link", { name: "Carrinho" })).toBe(links[1]);
    expect(links.map((link) => link.getAttribute("aria-current"))).toEqual([null, null]);
  });

  test("the name of the shop is always in the link, and shown from lg up", () => {
    render(<SiteHeaderActions {...props} />);

    const name = screen.getByText("Loja");
    expect(name.classList.contains("sr-only")).toBe(true);
    expect(name.classList.contains("lg:not-sr-only")).toBe(true);
  });

  test.each([
    ["/pt/shop", "Loja"],
    ["/pt/cart", "Carrinho"],
  ])("on %s marks %s as the current page", (pathname, name) => {
    navigation.pathname = pathname;
    render(<SiteHeaderActions {...props} />);

    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toEqual([screen.getByRole("link", { name })]);
  });
});
