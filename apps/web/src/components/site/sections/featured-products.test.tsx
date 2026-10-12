import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  FeaturedProducts,
  type FeaturedProductsProps,
} from "@/components/site/sections/featured-products";
import type { ProductSummary } from "@/lib/shop/product";

const PRODUCTS: ProductSummary[] = [
  {
    id: "1",
    handle: "support",
    title: "Suporte",
    productType: "Sistema modular",
    price: { amountCents: 8900, currencyCode: "EUR" },
    priceVaries: false,
    availableForSale: true,
    isExample: true,
  },
  {
    id: "2",
    handle: "tyre",
    title: "Pneu",
    productType: "Pneus",
    price: { amountCents: 8990, currencyCode: "EUR" },
    compareAtPrice: { amountCents: 10990, currencyCode: "EUR" },
    priceVaries: false,
    availableForSale: false,
    isExample: false,
  },
];

const PROPS: Omit<FeaturedProductsProps, "products"> = {
  id: "featured",
  eyebrow: "Produtos",
  title: "Destaques",
  priceLocale: "pt-PT",
  productHref: "/pt#contact",
  labels: {
    carousel: "Produtos em destaque",
    empty: "Sem produtos",
    example: "Exemplo",
    inStock: "Em stock",
    outOfStock: "Esgotado",
    compareAt: "Antes",
    current: "Agora",
  },
  carouselLabels: {
    roleDescription: "carrossel",
    slideRoleDescription: "diapositivo",
    slide: "{index} de {total}",
    pause: "Pausar rotação",
    play: "Retomar rotação",
    previous: "Anterior",
    next: "Seguinte",
  },
};

function renderSection(products = PRODUCTS) {
  return render(<FeaturedProducts {...PROPS} products={products} />);
}

// The cards out of view are hidden from assistive technology by the carousel.
function cards(): HTMLElement[] {
  return screen.getAllByRole("article", { hidden: true });
}

// jsdom has no `matchMedia`, which the carousel asks about reduced motion.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FeaturedProducts", () => {
  test("is a region named by its h2, holding a carousel with its own name", () => {
    renderSection();
    const region = screen.getByRole("region", { name: "Destaques" });

    expect(region.id).toBe("featured");
    expect(within(region).getByRole("heading", { level: 2, name: "Destaques" })).toBeTruthy();
    expect(
      within(region)
        .getByRole("region", { name: "Produtos em destaque" })
        .getAttribute("aria-roledescription"),
    ).toBe("carrossel");
  });

  test("has one card per product, each with an h3 that links where it is told", () => {
    renderSection();

    expect(cards()).toHaveLength(2);
    for (const [index, title] of ["Suporte", "Pneu"].entries()) {
      const heading = within(cards()[index]).getByRole("heading", { level: 3, name: title, hidden: true });
      expect(within(heading).getByRole("link", { hidden: true }).getAttribute("href")).toBe("/pt#contact");
    }
  });

  test("shows the product type and the price written for the locale", () => {
    renderSection();

    expect(within(cards()[0]).getByText("Sistema modular")).toBeTruthy();
    expect(cards()[0].textContent).toContain("89,00 €");
  });

  test("shows a reduced price with the words that say which is which", () => {
    renderSection();

    expect(cards()[1].textContent).toContain("Agora 89,90 €");
    expect(cards()[1].textContent).toContain("Antes 109,90 €");
    expect(cards()[0].textContent).not.toContain("Antes");
  });

  test("says whether each product can be bought", () => {
    renderSection();

    expect(within(cards()[0]).getByText("Em stock")).toBeTruthy();
    expect(within(cards()[1]).getByText("Esgotado")).toBeTruthy();
  });

  test("marks the example products, and only those", () => {
    renderSection();
    const slides = screen.getAllByRole("group", { hidden: true });

    expect(within(slides[0]).getByText("Exemplo")).toBeTruthy();
    expect(within(slides[1]).queryByText("Exemplo")).toBeNull();
  });

  test("renders nothing without products", () => {
    const { container } = renderSection([]);

    expect(container.innerHTML).toBe("");
  });
});
