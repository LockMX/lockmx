import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import {
  SearchBar,
  type SearchBarProps,
  type SearchSuggestion,
} from "@/components/ui/forms/search-bar";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

const TEXT = {
  label: "Procurar produtos",
  submitLabel: "Procurar",
  listLabel: "Sugestões",
  resultsLabel: { one: "{count} sugestão", other: "{count} sugestões" },
  noResultsLabel: "Sem sugestões",
};

const SUGGESTIONS: SearchSuggestion[] = [
  { label: "Pneu Enduro 120/90" },
  { label: "Pneu Cross 110/90", meta: "Pneus" },
  { label: "Proteção de mãos", icon: "package" },
  { label: "Suporte de mota" },
];

function field(): HTMLInputElement {
  return screen.getByRole<HTMLInputElement>("combobox", { name: "Procurar produtos" });
}

function options(): string[] {
  return screen.queryAllByRole("option").map((option) => option.textContent ?? "");
}

function activeOption(): HTMLElement | null {
  const id = field().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
}

function status(): string {
  return screen.getByRole("status").textContent ?? "";
}

function renderBar(props: Partial<SearchBarProps> = {}) {
  // jsdom does not navigate: the tests stop the native submission.
  return render(
    <SearchBar
      {...TEXT}
      suggestions={SUGGESTIONS}
      onSubmit={(_query, event) => event.preventDefault()}
      {...props}
    />,
  );
}

describe("SearchBar", () => {
  test("is a search form with a named combobox and a submit button", () => {
    renderBar();

    const form = screen.getByRole("search");
    const button = screen.getByRole("button", { name: "Procurar" });

    expect(form.tagName).toBe("FORM");
    expect(form.contains(field())).toBe(true);
    expect(field().type).toBe("text");
    expect(field().getAttribute("aria-autocomplete")).toBe("list");
    expect(field().getAttribute("spellcheck")).toBe("false");
    expect(button.getAttribute("type")).toBe("submit");
  });

  test("starts closed, pointing at no list", () => {
    renderBar();

    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(field().hasAttribute("aria-controls")).toBe(false);
    expect(field().hasAttribute("aria-activedescendant")).toBe(false);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(status()).toBe("");
  });

  test("typing opens the named list with the suggestions that contain the text", async () => {
    renderBar();

    await userEvent.type(field(), "pneu");

    const list = screen.getByRole("listbox", { name: "Sugestões" });
    expect(field().getAttribute("aria-expanded")).toBe("true");
    expect(field().getAttribute("aria-controls")).toBe(list.id);
    expect(options()).toEqual(["Pneu Enduro 120/90", "Pneu Cross 110/90Pneus"]);
    expect(activeOption()).toBeNull();
  });

  test("matches without regard to case or accents", async () => {
    renderBar();

    await userEvent.type(field(), "PROTECAO");

    expect(options()).toEqual(["Proteção de mãos"]);
  });

  test("shows six suggestions at most", async () => {
    const many = Array.from({ length: 9 }, (_, index) => ({ label: `Pneu ${index}` }));
    renderBar({ suggestions: many });

    await userEvent.type(field(), "pneu");

    expect(options()).toHaveLength(6);
  });

  test("shows suggestions that share a label as separate options", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderBar({
      suggestions: [
        { label: "Pneu Cross", meta: "Dianteiro" },
        { label: "Pneu Cross", meta: "Traseiro" },
      ],
    });

    await userEvent.type(field(), "pneu");

    expect(options()).toEqual(["Pneu CrossDianteiro", "Pneu CrossTraseiro"]);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  test("announces the number of suggestions with the text from props", async () => {
    renderBar();

    await userEvent.type(field(), "p");
    expect(status()).toBe("4 sugestões");

    await userEvent.type(field(), "rot");
    expect(status()).toBe("1 sugestão");
  });

  test("with no match shows no list and announces it", async () => {
    renderBar();

    await userEvent.type(field(), "capacete");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(status()).toBe("Sem sugestões");
  });

  test("Down and Up move the active option and wrap at the ends", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");

    await userEvent.keyboard("{ArrowDown}");
    expect(activeOption()?.textContent).toBe("Pneu Enduro 120/90");
    expect(activeOption()?.getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByRole("option", { selected: true })).toHaveLength(1);

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeOption()?.textContent).toBe("Pneu Enduro 120/90");

    await userEvent.keyboard("{ArrowUp}");
    expect(activeOption()?.textContent).toBe("Pneu Cross 110/90Pneus");
    expect(document.activeElement).toBe(field());
  });

  test("Up with no active option goes to the last one", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");

    await userEvent.keyboard("{ArrowUp}");

    expect(activeOption()?.textContent).toBe("Pneu Cross 110/90Pneus");
  });

  test("typing again clears the active option", async () => {
    renderBar();
    await userEvent.type(field(), "pne");
    await userEvent.keyboard("{ArrowDown}");

    await userEvent.type(field(), "u");

    expect(activeOption()).toBeNull();
  });

  test("Enter on an active option selects it without submitting", async () => {
    const onSelect = vi.fn();
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    renderBar({ onSelect, onSubmit, onChange });
    await userEvent.type(field(), "pneu");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(field().value).toBe("Pneu Cross 110/90");
    expect(onChange).toHaveBeenLastCalledWith("Pneu Cross 110/90");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith({ label: "Pneu Cross 110/90", meta: "Pneus" });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(status()).toBe("");
    expect(document.activeElement).toBe(field());
  });

  test("Enter with no active option submits what was typed and closes the list", async () => {
    const onSubmit = vi.fn((_query: string, event: React.FormEvent) => event.preventDefault());
    const onSelect = vi.fn();
    renderBar({ onSubmit, onSelect });

    await userEvent.type(field(), "pneu{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toBe("pneu");
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  test("the submit button submits the text", async () => {
    const onSubmit = vi.fn((_query: string, event: React.FormEvent) => event.preventDefault());
    renderBar({ onSubmit });
    await userEvent.type(field(), "suporte");

    await userEvent.click(screen.getByRole("button", { name: "Procurar" }));

    expect(onSubmit.mock.calls[0][0]).toBe("suporte");
  });

  test("submits natively under the name `q`, or the name given", () => {
    const { rerender } = render(<SearchBar {...TEXT} defaultValue="pneu" action="/pt/search" />);
    const form = screen.getByRole<HTMLFormElement>("search");

    expect(form.getAttribute("action")).toBe("/pt/search");
    expect(new FormData(form).get("q")).toBe("pneu");

    rerender(<SearchBar {...TEXT} defaultValue="pneu" name="term" />);
    expect(new FormData(form).get("term")).toBe("pneu");
  });

  test("Escape closes the list and keeps the text and the focus", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");
    await userEvent.keyboard("{ArrowDown}");

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(field().hasAttribute("aria-activedescendant")).toBe(false);
    expect(field().value).toBe("pneu");
    expect(document.activeElement).toBe(field());
    expect(status()).toBe("");
  });

  test("Down opens a closed list again on its first option", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");
    await userEvent.keyboard("{Escape}");

    await userEvent.keyboard("{ArrowDown}");

    expect(options()).toHaveLength(2);
    expect(activeOption()?.textContent).toBe("Pneu Enduro 120/90");
  });

  test("leaving the field closes the list", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");

    await userEvent.tab();

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(field().value).toBe("pneu");
  });

  test("clicking an option selects it and the field keeps the focus", async () => {
    const onSelect = vi.fn();
    renderBar({ onSelect });
    await userEvent.type(field(), "pneu");

    await userEvent.click(screen.getByRole("option", { name: /Pneu Cross/ }));

    expect(field().value).toBe("Pneu Cross 110/90");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith({ label: "Pneu Cross 110/90", meta: "Pneus" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(field());
  });

  test("pressing the mouse on an option does not take the focus from the field", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");

    const pressed = fireEvent.mouseDown(screen.getByRole("option", { name: /Pneu Cross/ }));

    // `fireEvent` returns false when the default action was prevented.
    expect(pressed).toBe(false);
  });

  test("the options are not controls of their own", async () => {
    renderBar();
    await userEvent.type(field(), "pneu");

    const list = screen.getByRole("listbox");
    expect(list.querySelector("button, a, input, [tabindex]")).toBeNull();
  });

  test("can be controlled", async () => {
    function Controlled() {
      const [value, setValue] = useState("sup");
      return (
        <SearchBar {...TEXT} suggestions={SUGGESTIONS} value={value} onChange={setValue} />
      );
    }
    render(<Controlled />);

    await userEvent.type(field(), "o");

    expect(field().value).toBe("supo");
    expect(options()).toEqual(["Suporte de mota"]);
  });

  test("ignores a change when controlled by a parent that keeps the value", async () => {
    const onChange = vi.fn();
    renderBar({ value: "pneu", onChange });

    await userEvent.type(field(), "s");

    expect(onChange).toHaveBeenLastCalledWith("pneus");
    expect(field().value).toBe("pneu");
  });

  test("takes its text from props only", async () => {
    render(
      <SearchBar
        label="Search products"
        submitLabel="Search"
        listLabel="Suggestions"
        resultsLabel={{ one: "{count} suggestion", other: "{count} suggestions" }}
        noResultsLabel="No suggestions"
        placeholder="Tyres, racks"
        suggestions={[{ label: "Rack" }]}
      />,
    );
    const input = screen.getByRole<HTMLInputElement>("combobox", { name: "Search products" });

    await userEvent.type(input, "rack");

    expect(input.placeholder).toBe("Tyres, racks");
    expect(screen.getByRole("search").textContent).toBe("SearchRack1 suggestion");
  });

  test("has two sizes and takes a class for layout", () => {
    const { rerender } = renderBar({ className: "max-w-120" });
    const box = () => field().parentElement as HTMLElement;

    expect(screen.getByRole("search").className).toContain("max-w-120");
    expect(box().className).toContain("h-11");

    rerender(<SearchBar {...TEXT} size="lg" />);
    expect(box().className).toContain("h-15");
  });

  test("uses no inline style and no raw colour or pixel value", async () => {
    const { container } = renderBar();
    await userEvent.type(field(), "pneu");

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("requires its text props and does not accept `style`", () => {
    expectTypeOf<SearchBarProps>().toHaveProperty("label").toEqualTypeOf<string>();
    expectTypeOf<SearchBarProps>().toHaveProperty("submitLabel").toEqualTypeOf<string>();
    expectTypeOf<SearchBarProps>().toHaveProperty("listLabel").toEqualTypeOf<string>();
    expectTypeOf<SearchBarProps>().toHaveProperty("noResultsLabel").toEqualTypeOf<string>();
    expectTypeOf<SearchBarProps>().not.toHaveProperty("style");
  });
});
