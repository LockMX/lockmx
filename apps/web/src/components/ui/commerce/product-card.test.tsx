import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { ProductCard, type ProductCardProps } from "@/components/ui/commerce/product-card";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;
const NBSP = " ";

const PRODUCT = {
  title: "Pneu Enduro 120/90",
  href: "/pt/produtos/pneu-enduro",
  price: { amountCents: 34900, locale: "pt-PT" },
  stockLabel: "Em stock",
} satisfies ProductCardProps;

const IMAGE = { src: "/brand/pneu.jpg", sizes: "(max-width: 768px) 100vw, 33vw" };

function card(): HTMLElement {
  return screen.getByRole("article");
}

describe("ProductCard", () => {
  test("is an article whose title is a level 3 heading with the link to the product", () => {
    render(<ProductCard {...PRODUCT} />);
    const heading = within(card()).getByRole("heading", { level: 3 });
    const link = within(heading).getByRole("link", { name: "Pneu Enduro 120/90" });

    expect(link.getAttribute("href")).toBe("/pt/produtos/pneu-enduro");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  test("the one link covers the card", () => {
    render(<ProductCard {...PRODUCT} />);
    const link = screen.getByRole("link");

    expect(card().className.split(" ")).toContain("relative");
    expect(link.className).toContain("after:absolute");
    expect(link.className).toContain("after:inset-0");
  });

  test("shows the price from whole cents", () => {
    render(<ProductCard {...PRODUCT} />);

    expect(screen.getByText("349,00 €")).toBeDefined();
  });

  test("shows a reduced price with its words", () => {
    render(
      <ProductCard
        {...PRODUCT}
        price={{
          amountCents: 34900,
          compareAtCents: 39900,
          compareAtLabel: "Antes",
          currentLabel: "Agora",
          locale: "pt-PT",
        }}
      />,
    );

    expect(card().querySelector("s")?.textContent).toBe(`Antes 399,00${NBSP}€`);
  });

  test.each([
    [undefined, "text-status-success"],
    ["in", "text-status-success"],
    ["low", "text-status-warning-text"],
    ["out", "text-status-danger"],
  ] as const)("with stock %s the state is text in a badge, toned %s", (stock, tone) => {
    render(<ProductCard {...PRODUCT} stock={stock} stockLabel="Estado do stock" />);

    expect(screen.getByText("Estado do stock").className).toContain(tone);
  });

  test("shows a category and a merchandising badge when given", () => {
    render(<ProductCard {...PRODUCT} category="Pneus" badge="Novo" />);

    expect(screen.getByText("Pneus")).toBeDefined();
    expect(screen.getByText("Novo")).toBeDefined();
  });

  test("has no add button without a handler", () => {
    render(<ProductCard {...PRODUCT} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  test("the add button is named by its label and then the product", async () => {
    const onAdd = vi.fn();
    render(<ProductCard {...PRODUCT} addLabel="Adicionar" onAdd={onAdd} />);
    const button = screen.getByRole("button", { name: "Adicionar Pneu Enduro 120/90" });

    await userEvent.click(button);

    expect(onAdd).toHaveBeenCalledTimes(1);
    // The product name is for assistive technology only.
    expect(within(button).getByText("Pneu Enduro 120/90").className).toContain("sr-only");
  });

  test("the add button is in a positioned box of its own, above the link's cover", () => {
    // A disabled button lets the pointer through: the box is what stops a
    // click on it from reaching the link underneath.
    render(<ProductCard {...PRODUCT} stock="out" addLabel="Adicionar" onAdd={() => {}} />);
    const box = screen.getByRole("button").parentElement as HTMLElement;

    expect(box.tagName).toBe("SPAN");
    expect(box.className.split(" ")).toContain("relative");
    expect(box.contains(screen.getByRole("link"))).toBe(false);
  });

  test("an out-of-stock product cannot be added", async () => {
    const onAdd = vi.fn();
    render(<ProductCard {...PRODUCT} stock="out" addLabel="Adicionar" onAdd={onAdd} />);
    const button = screen.getByRole("button") as HTMLButtonElement;

    await userEvent.click(button);

    expect(button.disabled).toBe(true);
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("a keyboard user reaches the title link, then the add button", async () => {
    render(<ProductCard {...PRODUCT} image={IMAGE} addLabel="Adicionar" onAdd={() => {}} />);

    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("link"));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
  });

  test("shows the image, decorative unless it has an alt, with the given sizes", () => {
    const { unmount } = render(<ProductCard {...PRODUCT} image={IMAGE} />);
    const decorative = card().querySelector("img") as HTMLImageElement;
    expect(decorative.getAttribute("alt")).toBe("");
    expect(decorative.getAttribute("sizes")).toBe(IMAGE.sizes);
    expect(decodeURIComponent(decorative.getAttribute("src") ?? "")).toContain("/brand/pneu.jpg");
    unmount();

    render(<ProductCard {...PRODUCT} image={{ ...IMAGE, alt: "Pneu visto de lado" }} />);
    expect(screen.getByRole("img", { name: "Pneu visto de lado" })).toBeDefined();
  });

  test("greys the image of an out-of-stock product", () => {
    render(<ProductCard {...PRODUCT} image={IMAGE} stock="out" />);

    expect(card().querySelector("img")?.className.split(" ")).toContain("grayscale");
  });

  test("zooms the image on hover only when motion is welcome", () => {
    render(<ProductCard {...PRODUCT} image={IMAGE} />);
    const zoom = (card().querySelector("img")?.className.split(" ") ?? []).filter((name) =>
      name.includes("scale-"),
    );

    expect(zoom.length).toBeGreaterThan(0);
    for (const name of zoom) expect(name.startsWith("motion-safe:")).toBe(true);
  });

  test("shows a placeholder icon when there is no image", () => {
    render(<ProductCard {...PRODUCT} />);

    expect(card().querySelector("img")).toBeNull();
    expect(card().querySelector("[data-product-placeholder] svg")).not.toBeNull();
  });

  test("takes its text from props only", () => {
    render(
      <ProductCard
        title="Enduro tyre"
        href="/en/products/enduro-tyre"
        price={{ amountCents: 34900, locale: "en" }}
        stockLabel="In stock"
        category="Tyres"
        badge="New"
        addLabel="Add"
        onAdd={() => {}}
      />,
    );

    expect(card().textContent).toBe("NewTyresEnduro tyreIn stock€349.00Add Enduro tyre");
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = render(
      <ProductCard {...PRODUCT} category="Pneus" badge="Novo" addLabel="Adicionar" onAdd={() => {}} />,
    );

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("requires its texts, and the add label with the handler", () => {
    expectTypeOf<ProductCardProps>().toHaveProperty("title").toEqualTypeOf<string>();
    expectTypeOf<ProductCardProps>().toHaveProperty("stockLabel").toEqualTypeOf<string>();
    expectTypeOf<ProductCardProps>().not.toHaveProperty("style");
    // @ts-expect-error a handler needs the label of its button
    const withoutLabel: ProductCardProps = { ...PRODUCT, onAdd: () => {} };
    expect(withoutLabel).toBeDefined();
  });
});
