import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SkipLink } from "@/components/site/skip-link";

describe("SkipLink", () => {
  test("is a link to the target, named by the text from props", () => {
    render(<SkipLink targetId="main" label="Saltar para o conteúdo" />);

    const link = screen.getByRole("link", { name: "Saltar para o conteúdo" });
    expect(link.getAttribute("href")).toBe("#main");
  });
});
