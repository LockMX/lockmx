import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteHeader } from "@/components/site/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pt",
}));

const props = {
  locale: "pt" as const,
  homeHref: "/pt",
  logoAlt: "LockMX, página inicial",
  navigationLabel: "Principal",
  menuLabel: "Menu",
  navigationItems: [{ href: "/pt", label: "Início" }],
  languageLabel: "Idioma",
};

describe("SiteHeader", () => {
  test("is the banner, on the inverse surface", () => {
    render(<SiteHeader {...props} />);

    const banner = screen.getByRole("banner");
    expect(banner.getAttribute("data-surface")).toBe("inverse");
  });

  test("links the logo to the home of the locale, named by the alternative text", () => {
    render(<SiteHeader {...props} />);

    const home = screen.getByRole("link", { name: "LockMX, página inicial" });
    expect(home.getAttribute("href")).toBe("/pt");
    expect(within(home).getByRole("img").getAttribute("src")).toContain("wordmark-white-yellow.png");
  });

  test("has the main navigation and the language switcher, named from props", () => {
    render(<SiteHeader {...props} />);

    const banner = screen.getByRole("banner");
    const navigation = within(banner).getByRole("navigation", { name: "Principal" });

    expect(within(navigation).getByRole("link", { name: "Início" })).toBeTruthy();
    expect(within(navigation).getByRole("button", { name: "Menu" })).toBeTruthy();
    expect(within(banner).getByRole("navigation", { name: "Idioma" })).toBeTruthy();
  });
});
