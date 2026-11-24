import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShopFilters } from "@/components/site/shop-filters";

const props = {
  action: "/pt/shop/tyres",
  allHref: "/pt/shop",
  sections: [
    { key: "racks" as const, title: "Suportes LockMX", href: "/pt/shop/racks" },
    { key: "tyres" as const, title: "Pneus", href: "/pt/shop/tyres" },
  ],
  current: "tyres" as const,
  availability: ["in" as const],
  labels: {
    filters: "Filtros",
    sections: "Secções",
    all: "Todos",
    availability: "Disponibilidade",
    inStock: "Em stock",
    outOfStock: "Esgotado",
    apply: "Aplicar",
    clear: "Limpar filtros",
  },
};

describe("ShopFilters", () => {
  test("is a complementary landmark named by its h2", () => {
    render(<ShopFilters {...props} />);

    const filters = screen.getByRole("complementary", { name: "Filtros" });
    expect(within(filters).getByRole("heading", { level: 2 }).textContent).toBe("Filtros");
  });

  test("links to the whole shop and to each section, marking the current one", () => {
    render(<ShopFilters {...props} />);

    const links = within(screen.getByRole("navigation", { name: "Secções" })).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Todos", "/pt/shop"],
      ["Suportes LockMX", "/pt/shop/racks"],
      ["Pneus", "/pt/shop/tyres"],
    ]);
    expect(links.map((link) => link.getAttribute("aria-current"))).toEqual([null, null, "page"]);
  });

  test("on the whole shop it marks the first link", () => {
    render(<ShopFilters {...props} current={undefined} action="/pt/shop" />);

    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("aria-current")).toBe("page");
  });

  test("the availability is a group of checkboxes that shows the choice in the address", () => {
    render(<ShopFilters {...props} />);

    const group = screen.getByRole("group", { name: "Disponibilidade" });
    const inStock = within(group).getByRole("checkbox", { name: "Em stock" }) as HTMLInputElement;
    const soldOut = within(group).getByRole("checkbox", { name: "Esgotado" }) as HTMLInputElement;

    expect([inStock.name, inStock.value, inStock.checked]).toEqual(["availability", "in", true]);
    expect([soldOut.name, soldOut.value, soldOut.checked]).toEqual(["availability", "out", false]);
  });

  test("the form is sent with GET to the listing, and the clear link is the listing", () => {
    const { container } = render(<ShopFilters {...props} />);

    const form = container.querySelector("form");
    expect(form?.getAttribute("method")).toBe("get");
    expect(form?.getAttribute("action")).toBe("/pt/shop/tyres");
    expect(screen.getByRole("button", { name: "Aplicar" }).getAttribute("type")).toBe("submit");
    expect(screen.getByRole("link", { name: "Limpar filtros" }).getAttribute("href")).toBe(
      "/pt/shop/tyres",
    );
  });

  test("keeps the search of the listing when the filters are applied", () => {
    const { container } = render(<ShopFilters {...props} current={undefined} query="pneu" />);

    const hidden = container.querySelector<HTMLInputElement>('form input[type="hidden"]');
    expect([hidden?.name, hidden?.value]).toEqual(["q", "pneu"]);
  });

  test("sends no search when the listing has none", () => {
    const { container } = render(<ShopFilters {...props} />);

    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});
