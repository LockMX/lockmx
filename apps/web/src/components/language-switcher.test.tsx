import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { LanguageSwitcher } from "@/components/language-switcher";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pt/a/b",
}));

describe("LanguageSwitcher", () => {
  test("links to the same path in each locale, in each language's own name", () => {
    render(<LanguageSwitcher label="Idioma" current="pt" />);

    expect(screen.getByRole("link", { name: "PT Português" }).getAttribute("href")).toBe("/pt/a/b");
    expect(screen.getByRole("link", { name: "EN English" }).getAttribute("href")).toBe("/en/a/b");
  });

  test("marks the current locale and sets the lang of each link", () => {
    render(<LanguageSwitcher label="Idioma" current="pt" />);

    const portuguese = screen.getByRole("link", { name: "PT Português" });
    const english = screen.getByRole("link", { name: "EN English" });

    expect(portuguese.getAttribute("aria-current")).toBe("true");
    expect(english.getAttribute("aria-current")).toBeNull();
    expect(portuguese.getAttribute("lang")).toBe("pt-PT");
    expect(english.getAttribute("lang")).toBe("en");
  });

  test("shows the code of each language and keeps its name for assistive technology", () => {
    render(<LanguageSwitcher label="Idioma" current="pt" />);

    expect(screen.getByRole("link", { name: "PT Português" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "EN English" })).toBeTruthy();
    expect(screen.getByText("Português").className).toContain("sr-only");
    expect(screen.getByText("English").className).toContain("sr-only");
  });

  test("is a labelled navigation landmark", () => {
    render(<LanguageSwitcher label="Idioma" current="en" />);

    expect(screen.getByRole("navigation", { name: "Idioma" })).toBeTruthy();
  });
});
