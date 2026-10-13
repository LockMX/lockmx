import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ModularSystem } from "@/components/site/sections/modular-system";

const props = {
  id: "system",
  eyebrow: "Sistema modular",
  title: "Um quartel-general sobre rodas",
  paragraphs: ["O sistema.", "As peças."],
  parts: [
    { icon: "hard-hat" as const, title: "Capacetes", text: "Suportes para capacetes." },
    { icon: "footprints" as const, title: "Botas", text: "Suportes para botas." },
  ],
};

function region() {
  return screen.getByRole("region", { name: "Um quartel-general sobre rodas" });
}

describe("ModularSystem", () => {
  test("on its own page it is named by the h1 and the parts are h2", () => {
    render(<ModularSystem {...props} level={1} />);

    expect(within(region()).getByRole("heading", { level: 1 }).textContent).toBe(
      "Um quartel-general sobre rodas",
    );
    expect(within(region()).getAllByRole("heading", { level: 2 })).toHaveLength(2);
    expect(within(region()).queryByRole("heading", { level: 3 })).toBeNull();
  });

  test("is a region named by its h2", () => {
    render(<ModularSystem {...props} />);

    expect(region().id).toBe("system");
    expect(within(region()).getByRole("heading", { level: 2 }).textContent).toBe(
      "Um quartel-general sobre rodas",
    );
    expect(within(region()).getByText("Sistema modular")).toBeTruthy();
  });

  test("shows every paragraph from props", () => {
    render(<ModularSystem {...props} />);

    expect(within(region()).getByText("O sistema.")).toBeTruthy();
    expect(within(region()).getByText("As peças.")).toBeTruthy();
  });

  test("has one list item per part, named by an h3, with its text", () => {
    render(<ModularSystem {...props} />);

    expect(within(region()).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(region())
        .getAllByRole("heading", { level: 3 })
        .map((title) => title.textContent),
    ).toEqual(["Capacetes", "Botas"]);
    expect(within(region()).getByText("Suportes para botas.")).toBeTruthy();
  });

  test("keeps the icons decorative", () => {
    const { container } = render(<ModularSystem {...props} />);

    const icons = [...container.querySelectorAll("svg")];
    expect(icons).toHaveLength(2);
    expect(icons.every((icon) => icon.getAttribute("aria-hidden") === "true")).toBe(true);
  });
});
