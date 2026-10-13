import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ModularSystem } from "@/components/site/sections/modular-system";

const props = {
  id: "modular-system",
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
  test("is a region named by the h1 of its page", () => {
    render(<ModularSystem {...props} />);

    expect(region().id).toBe("modular-system");
    expect(within(region()).getByRole("heading", { level: 1 }).textContent).toBe(
      "Um quartel-general sobre rodas",
    );
    expect(within(region()).getByText("Sistema modular")).toBeTruthy();
  });

  test("shows every paragraph it is given", () => {
    render(<ModularSystem {...props} />);

    expect(within(region()).getByText("O sistema.")).toBeTruthy();
    expect(within(region()).getByText("As peças.")).toBeTruthy();
  });

  test("has one list item per part, named by an h2, with its text", () => {
    render(<ModularSystem {...props} />);

    expect(within(region()).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(region())
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["Capacetes", "Botas"]);
    expect(within(region()).getByText("Suportes para botas.")).toBeTruthy();
  });
});
