import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Benefits } from "@/components/site/sections/benefits";
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

  test("has no link unless it is given an action", () => {
    render(<Benefits id="why" {...heading} benefits={benefits} />);

    expect(within(region()).queryByRole("link")).toBeNull();
  });

  test("shows the action it is given after the benefits", () => {
    render(
      <Benefits
        id="why"
        {...heading}
        benefits={benefits}
        action={{ href: "/pt#contact", label: "Contactar" }}
      />,
    );
    const link = within(region()).getByRole("link", { name: "Contactar" });

    expect(link.getAttribute("href")).toBe("/pt#contact");
    expect(
      within(region()).getByRole("list").compareDocumentPosition(link) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
