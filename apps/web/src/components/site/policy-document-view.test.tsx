import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PolicyDocumentView } from "@/components/site/policy-document-view";
import type { PolicyDocument } from "@/lib/site/policy-document";

const policy: PolicyDocument = {
  blocks: [
    { kind: "heading", level: 2, id: "toc", text: ["Contents"] },
    {
      kind: "paragraph",
      text: [{ text: "In Short:", strong: true, em: true }, " we keep ", { text: "little", em: true }, "."],
    },
    { kind: "heading", level: 3, id: "contact", text: ["Contact"] },
    {
      kind: "paragraph",
      id: "write",
      text: ["Write to ", { text: "privacy@example.com", href: "mailto:privacy@example.com" }],
    },
    {
      kind: "list",
      items: [["names"], ["Back to the ", { text: "contents", href: "#toc" }]],
    },
    {
      kind: "table",
      head: [[{ text: "Category", strong: true }], [{ text: "Collected", strong: true }]],
      rows: [
        [["A. Identifiers"], ["NO"]],
        [["B. Other"], []],
      ],
    },
  ],
};

describe("PolicyDocumentView", () => {
  test("renders the headings at their level, with their ids", () => {
    render(<PolicyDocumentView document={policy} />);

    expect(screen.getByRole("heading", { level: 2, name: "Contents" }).id).toBe("toc");
    expect(screen.getByRole("heading", { level: 3, name: "Contact" }).id).toBe("contact");
  });

  test("keeps bold and italic text", () => {
    const { container } = render(<PolicyDocumentView document={policy} />);

    const strong = container.querySelector("strong");
    expect(strong?.textContent).toBe("In Short:");
    expect(strong?.querySelector("em")?.textContent).toBe("In Short:");
    expect(container.querySelectorAll("em")).toHaveLength(2);
  });

  test("renders the paragraphs with their ids and their links", () => {
    render(<PolicyDocumentView document={policy} />);

    const link = screen.getByRole("link", { name: "privacy@example.com" });
    expect(link.getAttribute("href")).toBe("mailto:privacy@example.com");
    expect(link.closest("p")?.id).toBe("write");
  });

  test("renders the lists", () => {
    render(<PolicyDocumentView document={policy} />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["names", "Back to the contents"]);
    expect(within(items[1]).getByRole("link").getAttribute("href")).toBe("#toc");
  });

  test("renders the table with column headers", () => {
    render(<PolicyDocumentView document={policy} />);

    const table = screen.getByRole("table");
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual(["Category", "Collected"]);
    expect(headers[0].getAttribute("scope")).toBe("col");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getByRole("cell", { name: "NO" })).toBeTruthy();
  });

  test("opens a link to another site in a new tab, safely", () => {
    render(
      <PolicyDocumentView
        document={{
          blocks: [
            {
              kind: "paragraph",
              text: [{ text: "authority", href: "https://example.com/authorities" }],
            },
          ],
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "authority" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
