import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Tabs, type TabsProps } from "@/components/ui/surfaces/tabs";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

const ITEMS = [
  { id: "details", label: "Detalhes", content: <p>Texto dos detalhes</p> },
  { id: "specs", label: "Especificações", content: <p>Texto das especificações</p> },
  { id: "reviews", label: "Avaliações", count: 12, content: <p>Texto das avaliações</p> },
];

function tab(name: string | RegExp): HTMLElement {
  return screen.getByRole("tab", { name });
}

function panelOf(item: HTMLElement): HTMLElement | null {
  return document.getElementById(item.getAttribute("aria-controls") ?? "");
}

function renderTabs(props: Partial<TabsProps> = {}) {
  return render(<Tabs label="Informação do produto" items={ITEMS} {...props} />);
}

describe("Tabs", () => {
  test("is a named tab list of buttons", () => {
    renderTabs();
    const list = screen.getByRole("tablist", { name: "Informação do produto" });
    const tabs = within(list).getAllByRole("tab");

    expect(tabs.map((item) => item.tagName)).toEqual(["BUTTON", "BUTTON", "BUTTON"]);
    expect(tabs.every((item) => item.getAttribute("type") === "button")).toBe(true);
  });

  test("selects the first tab by default and shows only its panel", () => {
    renderTabs();

    expect(tab("Detalhes").getAttribute("aria-selected")).toBe("true");
    expect(tab("Especificações").getAttribute("aria-selected")).toBe("false");
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.getByRole("tabpanel").textContent).toBe("Texto dos detalhes");
  });

  test("wires each tab to its panel and each panel to its tab", () => {
    renderTabs();

    for (const item of screen.getAllByRole("tab")) {
      expect(panelOf(item)?.getAttribute("role")).toBe("tabpanel");
      expect(panelOf(item)?.getAttribute("aria-labelledby")).toBe(item.id);
    }
    expect(screen.getByRole("tabpanel", { name: "Detalhes" }).tabIndex).toBe(0);
  });

  test("keeps the other panels in the page, hidden", () => {
    renderTabs();
    const other = panelOf(tab("Especificações"));

    expect(other?.hidden).toBe(true);
    expect(other?.textContent).toBe("Texto das especificações");
  });

  test("starts on `defaultValue`", () => {
    renderTabs({ defaultValue: "specs" });

    expect(tab("Especificações").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Texto das especificações");
  });

  test("a click selects the tab and reports its id", async () => {
    const onChange = vi.fn();
    renderTabs({ onChange });

    await userEvent.click(tab("Especificações"));

    expect(tab("Especificações").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Texto das especificações");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("specs");
  });

  test("only the selected tab is in the tab order", async () => {
    renderTabs({ defaultValue: "specs" });

    expect(screen.getAllByRole("tab").map((item) => item.tabIndex)).toEqual([-1, 0, -1]);

    await userEvent.tab();
    expect(document.activeElement).toBe(tab("Especificações"));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"));
  });

  test("Right and Left move the focus and the selection, and wrap", async () => {
    renderTabs();
    tab("Detalhes").focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tab("Especificações"));
    expect(tab("Especificações").getAttribute("aria-selected")).toBe("true");

    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(tab("Detalhes"));

    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tab(/Avaliações/));
    expect(screen.getByRole("tabpanel").textContent).toBe("Texto das avaliações");
  });

  test("Home and End go to the first and the last tab", async () => {
    renderTabs({ defaultValue: "specs" });
    tab("Especificações").focus();

    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(tab(/Avaliações/));

    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(tab("Detalhes"));
    expect(tab("Detalhes").getAttribute("aria-selected")).toBe("true");
  });

  test("Up and Down are left to the page", async () => {
    renderTabs();
    tab("Detalhes").focus();

    await userEvent.keyboard("{ArrowDown}{ArrowUp}");

    expect(tab("Detalhes").getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tab("Detalhes"));
  });

  test("the count is part of the name of the tab", () => {
    renderTabs();

    expect(tab("Avaliações 12")).toBeDefined();
  });

  test("can be controlled", async () => {
    function Controlled() {
      const [value, setValue] = useState("details");
      return <Tabs label="Informação" items={ITEMS} value={value} onChange={setValue} />;
    }
    render(<Controlled />);

    await userEvent.click(tab(/Avaliações/));

    expect(tab(/Avaliações/).getAttribute("aria-selected")).toBe("true");
  });

  test("stays where the parent keeps it", async () => {
    const onChange = vi.fn();
    renderTabs({ value: "details", onChange });

    await userEvent.click(tab("Especificações"));

    expect(onChange).toHaveBeenCalledWith("specs");
    expect(tab("Detalhes").getAttribute("aria-selected")).toBe("true");
  });

  test("the selected tab is marked by more than colour", () => {
    renderTabs();

    expect(tab("Detalhes").querySelector("[data-tab-indicator]")).not.toBeNull();
    expect(tab("Especificações").querySelector("[data-tab-indicator]")).toBeNull();
  });

  test("has a segmented variant, whose selected tab has a boundary", () => {
    renderTabs({ variant: "segmented" });

    expect(screen.getByRole("tablist").className).toContain("bg-surface-sunken");
    expect(tab("Detalhes").className).toContain("ring-border-control");
    expect(tab("Especificações").className).not.toContain("ring-border-control");
    expect(tab("Detalhes").querySelector("[data-tab-indicator]")).toBeNull();
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = renderTabs();

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("requires a name and does not accept `style`", () => {
    expectTypeOf<TabsProps>().toHaveProperty("label").toEqualTypeOf<string>();
    expectTypeOf<TabsProps>().not.toHaveProperty("style");
  });
});
