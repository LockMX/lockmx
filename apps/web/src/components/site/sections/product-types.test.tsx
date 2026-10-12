import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ProductTypes } from "@/components/site/sections/product-types";
import type { ProductTypeEntry } from "@/lib/shop/product";

const TYPES: ProductTypeEntry[] = [
  { key: "modular-system", title: "Sistema modular", href: "/pt/modular-system" },
  { key: "tyres", title: "Pneus" },
];

function renderSection(types = TYPES) {
  return render(
    <ProductTypes
      id="categories"
      eyebrow="Catálogo"
      title="Categorias"
      soonLabel="Em breve"
      types={types}
    />,
  );
}

function region() {
  return screen.getByRole("region", { name: "Categorias" });
}

describe("ProductTypes", () => {
  test("is a region named by its h2 with one item and one h3 per type, in order", () => {
    renderSection();

    expect(region().id).toBe("categories");
    expect(within(region()).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(region())
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Sistema modular", "Pneus"]);
  });

  test("a type with an address is one link named by its title", () => {
    renderSection();
    const links = within(region()).getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/pt/modular-system");
    expect(within(links[0]).getByRole("heading", { level: 3 }).textContent).toBe("Sistema modular");
  });

  test("a type without an address is not a link and says it comes soon", () => {
    renderSection();
    const [linked, plain] = within(region()).getAllByRole("listitem");

    expect(within(plain).queryByRole("link")).toBeNull();
    expect(within(plain).getByText("Em breve")).toBeTruthy();
    expect(within(linked).queryByText("Em breve")).toBeNull();
  });

  test("renders nothing without types", () => {
    const { container } = renderSection([]);

    expect(container.innerHTML).toBe("");
  });
});
