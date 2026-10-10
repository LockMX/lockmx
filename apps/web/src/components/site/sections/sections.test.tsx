import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Benefits } from "@/components/site/sections/benefits";
import { Buy } from "@/components/site/sections/buy";
import { Complements } from "@/components/site/sections/complements";
import { Contact } from "@/components/site/sections/contact";

const heading = { eyebrow: "Sobrancelha", title: "Título" };

function region() {
  return screen.getByRole("region", { name: "Título" });
}

describe("Benefits", () => {
  const benefits = [
    { title: "Espaço", text: "Maximiza o espaço." },
    { title: "Tempo", text: "Menos tempo a arrumar." },
  ];

  test("is a named region with one item per benefit, each with an h3 and its text", () => {
    render(<Benefits id="why" {...heading} benefits={benefits} />);

    expect(region().id).toBe("why");
    expect(within(region()).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(region())
        .getAllByRole("heading", { level: 3 })
        .map((title) => title.textContent),
    ).toEqual(["Espaço", "Tempo"]);
    expect(within(region()).getByText("Menos tempo a arrumar.")).toBeTruthy();
  });
});

describe("Buy", () => {
  test("is a named region on the inverse surface with its text and one action", () => {
    render(
      <Buy
        id="buy"
        {...heading}
        text="Fala connosco."
        action={{ href: "/pt#contact", label: "Contactar" }}
      />,
    );

    expect(region().id).toBe("buy");
    expect(region().getAttribute("data-surface")).toBe("inverse");
    expect(within(region()).getByText("Fala connosco.")).toBeTruthy();

    const links = within(region()).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toBe("Contactar");
    expect(links[0].getAttribute("href")).toBe("/pt#contact");
  });
});

describe("Complements", () => {
  test("is a named region with the text from props", () => {
    render(<Complements id="complements" {...heading} text="Pneus, peças e acessórios." />);

    expect(region().id).toBe("complements");
    expect(within(region()).getByText("Pneus, peças e acessórios.")).toBeTruthy();
  });
});

describe("Contact", () => {
  const props = { ...heading, text: "Escreve-nos.", emailLabel: "Email", email: "a@example.com" };

  test("is a named region with its text", () => {
    render(<Contact id="contact" {...props} />);

    expect(region().id).toBe("contact");
    expect(within(region()).getByText("Escreve-nos.")).toBeTruthy();
  });

  test("shows the address as a mail link, labelled from props", () => {
    render(<Contact id="contact" {...props} />);

    const link = within(region()).getByRole("link", { name: "a@example.com" });
    expect(link.getAttribute("href")).toBe("mailto:a@example.com");
    expect(within(region()).getByText("Email")).toBeTruthy();
  });
});
