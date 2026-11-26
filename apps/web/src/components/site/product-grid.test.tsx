import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ProductGrid } from "@/components/site/product-grid";
import type { ProductSummary } from "@/lib/shop/product";

// jsdom has no `matchMedia`, which each card asks whether the device can hover.
// It can, so no card observes its visibility.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const labels = {
  empty: "Nenhum produto.",
  example: "Exemplo",
  inStock: "Em stock",
  outOfStock: "Esgotado",
  compareAt: "Antes",
  current: "Agora",
};

function product(id: string, overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id,
    handle: id,
    title: `Produto ${id}`,
    productType: "Pneus",
    price: { amountCents: 1000, currencyCode: "EUR" },
    priceVaries: false,
    availableForSale: true,
    isExample: true,
    ...overrides,
  };
}

function renderGrid(products: ProductSummary[]) {
  render(
    <ProductGrid
      title="Produtos"
      products={products}
      priceLocale="pt-PT"
      productHref="/pt/contact"
      labels={labels}
    />,
  );
  return screen.getByRole("region", { name: "Produtos" });
}

describe("ProductGrid", () => {
  test("is a region named by an h2, with one card per product under it", () => {
    const grid = renderGrid([product("a"), product("b")]);

    expect(within(grid).getByRole("heading", { level: 2 }).textContent).toBe("Produtos");
    expect(within(grid).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(grid)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Produto a", "Produto b"]);
  });

  test("every card leads where it is told and says its stock", () => {
    const grid = renderGrid([product("a"), product("b", { availableForSale: false })]);

    for (const link of within(grid).getAllByRole("link")) {
      expect(link.getAttribute("href")).toBe("/pt/contact");
    }
    expect(within(grid).getByText("Em stock")).toBeTruthy();
    expect(within(grid).getByText("Esgotado")).toBeTruthy();
  });

  test("an example product says so and a real one does not", () => {
    const grid = renderGrid([product("a"), product("b", { isExample: false })]);

    expect(within(grid).getAllByText("Exemplo")).toHaveLength(1);
  });

  test("without products it says so in a status and shows no list", () => {
    const grid = renderGrid([]);

    expect(within(grid).getByRole("status").textContent).toBe("Nenhum produto.");
    expect(within(grid).queryByRole("list")).toBeNull();
  });

  test("with products the status is there and empty", () => {
    const grid = renderGrid([product("a")]);

    expect(within(grid).getByRole("status").textContent).toBe("");
  });
});
