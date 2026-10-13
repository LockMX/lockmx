import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ContactChannels } from "@/components/site/contact-channels";

const channels = [
  { title: "E-mail", icon: "mail" as const, href: "mailto:a@example.com", text: "a@example.com" },
  {
    title: "Redes Sociais",
    icon: "instagram" as const,
    href: "https://www.instagram.com/example",
    text: "@example",
    external: true,
  },
];

describe("ContactChannels", () => {
  test("has one h2 per channel, in order", () => {
    render(<ContactChannels channels={channels} />);

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(["E-mail", "Redes Sociais"]);
  });

  test("each channel is a link named by its text", () => {
    render(<ContactChannels channels={channels} />);

    expect(screen.getByRole("link", { name: "a@example.com" }).getAttribute("href")).toBe(
      "mailto:a@example.com",
    );
    expect(screen.getByRole("link", { name: "@example" }).getAttribute("href")).toBe(
      "https://www.instagram.com/example",
    );
  });

  test("only a link that leaves the site drops the opener", () => {
    render(<ContactChannels channels={channels} />);

    expect(screen.getByRole("link", { name: "a@example.com" }).getAttribute("rel")).toBeNull();
    expect(screen.getByRole("link", { name: "@example" }).getAttribute("rel")).toBe(
      "noopener noreferrer",
    );
  });
});
