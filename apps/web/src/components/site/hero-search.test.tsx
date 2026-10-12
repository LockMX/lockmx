import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { HeroSearch, type HeroSearchLabels } from "@/components/site/hero-search";

const LABELS: HeroSearchLabels = {
  label: "Pesquisar produtos",
  submit: "Pesquisar",
  placeholder: "Pneus, suportes",
  list: "Sugestões",
  results: { one: "{count} sugestão", other: "{count} sugestões" },
  noResults: "Sem sugestões",
};

describe("HeroSearch", () => {
  test("is a search form with a named field and a submit button", () => {
    render(<HeroSearch labels={LABELS} />);

    expect(screen.getByRole("search")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Pesquisar produtos" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pesquisar" })).toBeTruthy();
  });

  test("a submission leads nowhere until the shop gives it a destination", () => {
    render(<HeroSearch labels={LABELS} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "pneu" } });

    // Not prevented, the event returns true and the browser would navigate.
    expect(fireEvent.submit(screen.getByRole("search"))).toBe(false);
  });
});
