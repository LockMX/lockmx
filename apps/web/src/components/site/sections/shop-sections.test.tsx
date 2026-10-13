import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShopSections } from "@/components/site/sections/shop-sections";
import type { ShopSectionEntry } from "@/lib/shop/product";

const SECTIONS: ShopSectionEntry[] = [
  { key: "racks", title: "Suportes LockMX", href: "/pt/shop/racks" },
  { key: "tyres", title: "Pneus", href: "/pt/shop/tyres" },
];

function renderSection(sections = SECTIONS) {
  return render(<ShopSections id="shop-sections" title="Loja" sections={sections} />);
}

function region() {
  return screen.getByRole("region", { name: "Loja" });
}

describe("ShopSections", () => {
  test("is a region named by an h2, with one card and one h3 per section, in order", () => {
    renderSection();

    expect(region().id).toBe("shop-sections");
    expect(within(region()).getByRole("heading", { level: 2 }).textContent).toBe("Loja");
    expect(within(region()).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(region())
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Suportes LockMX", "Pneus"]);
  });

  test("each card is one link, named by its section, to its listing", () => {
    renderSection();

    const links = within(region()).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Suportes LockMX", "/pt/shop/racks"],
      ["Pneus", "/pt/shop/tyres"],
    ]);
  });

  test("shows no photograph: the image is still to come", () => {
    renderSection();

    expect(within(region()).queryByRole("img")).toBeNull();
  });

  test("can take the focus without being a tab stop", () => {
    renderSection();

    expect(region().getAttribute("tabindex")).toBe("-1");
  });

  test("without sections it is not there", () => {
    const { container } = renderSection([]);

    expect(container.innerHTML).toBe("");
  });
});
