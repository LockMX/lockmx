import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getSearchSuggestions } from "@/server/shop/search-suggestions";
import { GET } from "./route";

vi.mock("@/server/shop/search-suggestions", () => ({ getSearchSuggestions: vi.fn() }));

function request(query: string) {
  return new NextRequest(`https://www.lockmx.com/api/search?${query}`);
}

beforeEach(() => {
  vi.mocked(getSearchSuggestions).mockReset();
});

describe("GET /api/search", () => {
  test("answers with the suggestions for the text in the language asked", async () => {
    const suggestions = [{ kind: "section", label: "Pneus", href: "/pt/shop/tyres" }];
    vi.mocked(getSearchSuggestions).mockResolvedValue(suggestions as never);

    const response = await GET(request("q=pneu&lang=pt"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ suggestions });
    expect(getSearchSuggestions).toHaveBeenCalledWith("pt", "pneu");
  });

  test("passes a missing text on, for the use case to refuse", async () => {
    vi.mocked(getSearchSuggestions).mockResolvedValue([]);

    await GET(request("lang=en"));

    expect(getSearchSuggestions).toHaveBeenCalledWith("en", null);
  });

  test.each(["q=pneu", "q=pneu&lang=fr", "q=pneu&lang=PT"])(
    "refuses a language the site does not have: %s",
    async (query) => {
      const response = await GET(request(query));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ suggestions: [] });
      expect(getSearchSuggestions).not.toHaveBeenCalled();
    },
  );
});
