import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PendingPageView } from "@/components/site/pending-page-view";

describe("PendingPageView", () => {
  test("shows the name of the page as its heading, the message and a link home, from props", () => {
    render(
      <PendingPageView
        title="Política de privacidade"
        message="Em implementação"
        homeLabel="Voltar ao início"
        homeHref="/pt"
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Política de privacidade" })).toBeTruthy();
    expect(screen.getByText("Em implementação")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Voltar ao início" }).getAttribute("href")).toBe("/pt");
  });
});
