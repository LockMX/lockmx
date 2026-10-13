import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShopSearch, type ShopSearchLabels } from "@/components/site/shop-search";

const LABELS: ShopSearchLabels = {
  label: "Pesquisar produtos",
  submit: "Pesquisar",
  placeholder: "Pneus, suportes",
  list: "Sugestões",
  results: { one: "{count} sugestão", other: "{count} sugestões" },
  noResults: "Sem sugestões",
};

describe("ShopSearch", () => {
  test("is a search form with a named field and a submit button", () => {
    render(<ShopSearch labels={LABELS} />);

    expect(screen.getByRole("search")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Pesquisar produtos" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pesquisar" })).toBeTruthy();
  });

  test("a submission leads nowhere until the shop gives it a destination", () => {
    render(<ShopSearch labels={LABELS} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "pneu" } });

    // Not prevented, the event returns true and the browser would navigate.
    expect(fireEvent.submit(screen.getByRole("search"))).toBe(false);
  });
});
