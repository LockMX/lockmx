import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteFooter } from "@/components/site/site-footer";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pt",
}));

const props = {
  logoAlt: "LockMX Modular System",
  tagline: "Lock it, send it!",
  contactLinks: [
    { href: "mailto:a@example.com", label: "E-mail", icon: "mail" as const },
    {
      href: "https://www.instagram.com/example",
      label: "Instagram",
      icon: "instagram" as const,
      external: true,
    },
  ],
  navigationLabel: "Rodapé",
  navigationTitle: "Navegação",
  navigationItems: [{ href: "/pt", label: "Início" }],
  legalTitle: "Legal",
  legalItems: [
    { href: "/pt/company", label: "Informação da empresa" },
    { href: "/pt/privacy-policy", label: "Política de privacidade" },
  ],
  complaintsBookLabel: "Livro de Reclamações",
  copyright: "LockMX © 2026. Todos os direitos reservados.",
  credits: {
    lead: "Desenvolvido por",
    name: "Ricardo Rato",
    newTab: "(abre num novo separador)",
  },
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
    expect(screen.getByText("LockMX © 2026. Todos os direitos reservados.")).toBeTruthy();
  });

  test("has the contact links as named icons", () => {
    render(<SiteFooter {...props} />);

    expect(screen.getByRole("link", { name: "E-mail" }).getAttribute("href")).toBe(
      "mailto:a@example.com",
    );
    const instagram = screen.getByRole("link", { name: "Instagram" });
    expect(instagram.getAttribute("href")).toBe("https://www.instagram.com/example");
    expect(instagram.getAttribute("rel")).toBe("noopener noreferrer");
    expect(instagram.querySelector("svg")?.getAttribute("class")?.split(" ")).toContain("size-8");
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

  test("lists the legal pages from props before the Complaints Book", () => {
    render(<SiteFooter {...props} />);

    const legal = screen.getByRole("navigation", { name: "Legal" });
    const links = within(legal).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Informação da empresa",
      "Política de privacidade",
      "Livro de Reclamações",
    ]);
    expect(links[0].getAttribute("href")).toBe("/pt/company");
  });

  test("never links to the discontinued EU dispute platform", () => {
    render(<SiteFooter {...props} />);

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");
    expect(hrefs.some((href) => href.includes("ec.europa.eu"))).toBe(false);
  });

  test("has no language switcher: it is in the header", () => {
    render(<SiteFooter {...props} />);

    expect(screen.queryByRole("navigation", { name: "Idioma" })).toBeNull();
    expect(screen.queryByRole("link", { name: /English/ })).toBeNull();
  });

  test("leads with the logo and the tagline, then the links, the icons, the copyright and the credits", () => {
    render(<SiteFooter {...props} />);

    const parts = [
      screen.getByRole("img", { name: "LockMX Modular System" }),
      screen.getByText("Lock it, send it!"),
      screen.getByRole("navigation", { name: "Rodapé" }),
      screen.getByRole("navigation", { name: "Legal" }),
      screen.getByRole("link", { name: "E-mail" }),
      screen.getByText("LockMX © 2026. Todos os direitos reservados."),
      screen.getByText("Desenvolvido por", { exact: false }),
    ];
    for (let index = 1; index < parts.length; index += 1) {
      expect(
        parts[index - 1]!.compareDocumentPosition(parts[index]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  test("credits the developer with a link that opens a new tab and says so", () => {
    render(<SiteFooter {...props} />);

    const link = screen.getByRole("link", { name: "Ricardo Rato (abre num novo separador)" });
    expect(link.getAttribute("href")).toBe("https://www.ricardorato.dev");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.parentElement?.textContent).toContain("Desenvolvido por");
  });
});
