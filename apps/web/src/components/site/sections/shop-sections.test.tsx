import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShopSections } from "@/components/site/sections/shop-sections";
import type { ShopSectionEntry } from "@/lib/shop/product";

const SECTIONS: ShopSectionEntry[] = [
  { key: "racks", title: "Suportes LockMX", href: "/pt/shop/racks" },
  { key: "tyres", title: "Pneus", href: "/pt/shop/tyres" },
];

function renderSection(sections = SECTIONS) {
  return render(
    <ShopSections id="shop-sections" eyebrow="Explora por secção" title="Loja" sections={sections} />,
  );
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

  test("shows its title, with the eyebrow above it", () => {
    renderSection();

    const heading = within(region()).getByRole("heading", { level: 2 });
    expect(heading.className).not.toContain("sr-only");
    const eyebrow = within(region()).getByText("Explora por secção");
    expect(eyebrow.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test("each card is one link, named by its section, to its listing", () => {
    renderSection();

    const links = within(region()).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Suportes LockMX", "/pt/shop/racks"],
      ["Pneus", "/pt/shop/tyres"],
    ]);
  });

  test("the corner brackets of each card are decorative and leave its name as it is", () => {
    renderSection();

    const link = within(region()).getByRole("link", { name: "Suportes LockMX" });
    const brackets = link.querySelector(".lock-brackets");
    expect(brackets?.getAttribute("aria-hidden")).toBe("true");
    expect(link.textContent).toBe("Suportes LockMX");
  });

  test("without an image, shows no photograph: the image is still to come", () => {
    renderSection();

    expect(within(region()).queryByRole("img")).toBeNull();
    expect(region().querySelectorAll("img")).toHaveLength(0);
  });

  test("shows the section's image as a decorative photograph, the title still naming the link", () => {
    renderSection([
      { ...SECTIONS[0]!, image: { url: "https://cdn.shopify.com/s/files/1/racks.jpg", width: 800, height: 800 } },
      SECTIONS[1]!,
    ]);

    const images = region().querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]!.getAttribute("alt")).toBe("");
    expect(images[0]!.getAttribute("src")).toContain(encodeURIComponent("https://cdn.shopify.com/s/files/1/racks.jpg"));
    expect(within(region()).getByRole("link", { name: "Suportes LockMX" })).toBeTruthy();
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
