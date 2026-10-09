import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteFooter } from "@/components/site/site-footer";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pt",
}));

const props = {
  locale: "pt" as const,
  logoAlt: "LockMX Modular System",
  tagline: "Lock it, send it!",
  navigationLabel: "Rodapé",
  navigationTitle: "Navegação",
  navigationItems: [{ href: "/pt", label: "Início" }],
  legalTitle: "Legal",
  complaintsBookLabel: "Livro de Reclamações",
  languageLabel: "Idioma",
  copyright: "© 2026 LockMX",
};

describe("SiteFooter", () => {
  test("is the content information landmark, on the inverse surface", () => {
    render(<SiteFooter {...props} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.getAttribute("data-surface")).toBe("inverse");
  });

  test("shows the logo, the tagline and the copyright line from props", () => {
    render(<SiteFooter {...props} />);

    expect(screen.getByRole("img", { name: "LockMX Modular System" })).toBeTruthy();
    expect(screen.getByText("Lock it, send it!")).toBeTruthy();
    expect(screen.getByText("© 2026 LockMX")).toBeTruthy();
  });

  test("has the footer navigation under its title", () => {
    render(<SiteFooter {...props} />);

    const navigation = screen.getByRole("navigation", { name: "Rodapé" });
    expect(within(navigation).getByRole("link", { name: "Início" }).getAttribute("href")).toBe("/pt");
    expect(screen.getByText("Navegação")).toBeTruthy();
  });

  test("links to the official Complaints Book platform", () => {
    render(<SiteFooter {...props} />);

    const legal = screen.getByRole("navigation", { name: "Legal" });
    const link = within(legal).getByRole("link", { name: "Livro de Reclamações" });
    expect(link.getAttribute("href")).toBe("https://www.livroreclamacoes.pt");
  });

  test("never links to the discontinued EU dispute platform", () => {
    render(<SiteFooter {...props} />);

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");
    expect(hrefs.some((href) => href.includes("ec.europa.eu"))).toBe(false);
  });

  test("has the language switcher", () => {
    render(<SiteFooter {...props} />);

    expect(screen.getByRole("navigation", { name: "Idioma" })).toBeTruthy();
  });
});
