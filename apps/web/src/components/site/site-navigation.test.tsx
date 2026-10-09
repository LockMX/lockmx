import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SiteNavigation } from "@/components/site/site-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pt",
}));

const items = [
  { href: "/pt", label: "Início" },
  { href: "/pt/empresa", label: "Empresa" },
];

describe("SiteNavigation", () => {
  test("is a navigation landmark named by the label from props", () => {
    render(<SiteNavigation label="Principal" items={items} />);

    expect(screen.getByRole("navigation", { name: "Principal" })).toBeTruthy();
  });

  test("renders one link per item, with the text and address from props", () => {
    render(<SiteNavigation label="Principal" items={items} />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Início", "Empresa"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/pt", "/pt/empresa"]);
  });

  test("marks only the item of the current page", () => {
    render(<SiteNavigation label="Principal" items={items} />);

    expect(screen.getByRole("link", { name: "Início" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Empresa" }).getAttribute("aria-current")).toBeNull();
  });
});
