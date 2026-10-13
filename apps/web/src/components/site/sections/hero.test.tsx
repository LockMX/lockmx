import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Hero } from "@/components/site/sections/hero";

const props = {
  eyebrow: "Sistema modular LockMX",
  titleLead: "Lock it,",
  titleAccent: "send it!",
  text: "Um sistema modular.",
  primaryAction: { href: "/pt#contact", label: "Fala connosco" },
  secondaryAction: { href: "/pt#system", label: "Conhece o sistema" },
};

const image = { src: "/brand/mockups/sign-black.jpg", width: 1600, height: 1600, alt: "Placa" };

describe("Hero", () => {
  test("is a region named by the h1, which reads as one sentence", () => {
    render(<Hero {...props} />);

    const hero = screen.getByRole("region", { name: "Lock it, send it!" });
    expect(within(hero).getByRole("heading", { level: 1 }).textContent).toBe("Lock it, send it!");
    expect(hero.getAttribute("data-surface")).toBe("inverse");
  });

  test("shows the eyebrow and the text from props", () => {
    render(<Hero {...props} />);

    expect(screen.getByText("Sistema modular LockMX")).toBeTruthy();
    expect(screen.getByText("Um sistema modular.")).toBeTruthy();
  });

  test("has the two actions as links, the primary one first", () => {
    render(<Hero {...props} />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Fala connosco", "Conhece o sistema"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/pt#contact", "/pt#system"]);
  });

  test("works without an image", () => {
    render(<Hero {...props} />);

    expect(screen.queryByRole("img")).toBeNull();
  });

  test("shows the image with its dimensions and alternative text", () => {
    render(<Hero {...props} image={image} />);

    const picture = screen.getByRole("img", { name: "Placa" });
    expect(picture.getAttribute("width")).toBe("1600");
    expect(picture.getAttribute("height")).toBe("1600");
    expect(picture.getAttribute("loading")).toBe("eager");
  });
});
