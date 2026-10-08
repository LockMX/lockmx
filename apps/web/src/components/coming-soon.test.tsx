import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ComingSoon } from "@/components/coming-soon";

describe("ComingSoon", () => {
  test("shows the main logo as the page heading, named by the text from props", () => {
    render(<ComingSoon logoAlt="LockMX Modular System" message="Em breve" />);

    const heading = screen.getByRole("heading", { level: 1, name: "LockMX Modular System" });
    const logo = screen.getByRole("img", { name: "LockMX Modular System" });

    expect(heading.contains(logo)).toBe(true);
    expect(logo.getAttribute("src")).toContain("lockup-black-yellow.png");
  });

  test("shows the message under the logo", () => {
    render(<ComingSoon logoAlt="LockMX Modular System" message="Em breve" />);

    const heading = screen.getByRole("heading", { level: 1 });
    const message = screen.getByText("Em breve");

    expect(
      heading.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("is the main landmark and holds no text of its own", () => {
    render(<ComingSoon logoAlt="Logo" message="Coming soon" />);

    expect(screen.getByRole("main").textContent).toBe("Coming soon");
  });
});
