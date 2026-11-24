import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ShopSearch, type ShopSearchLabels } from "@/components/site/shop-search";
import { SUGGESTION_DELAY_MS } from "@/components/site/use-shop-suggestions";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const LABELS: ShopSearchLabels = {
  label: "Pesquisar produtos",
  submit: "Pesquisar",
  placeholder: "Pneus, suportes",
  list: "Sugestões",
  results: { one: "{count} sugestão", other: "{count} sugestões" },
  noResults: "Sem sugestões",
  section: "Secção",
};

const SUGGESTIONS = [
  { kind: "section", label: "Pneus", href: "/pt/shop/tyres" },
  { kind: "product", label: "Pneu traseiro", href: "/pt/shop?q=Pneu+traseiro" },
];

function answering(body: unknown, init: ResponseInit = {}) {
  const fetchDouble = vi.fn(async () => Response.json(body, init));
  vi.stubGlobal("fetch", fetchDouble);
  return fetchDouble;
}

function renderSearch(defaultValue?: string) {
  return render(
    <ShopSearch locale="pt" action="/pt/shop" defaultValue={defaultValue} labels={LABELS} />,
  );
}

function field(): HTMLInputElement {
  return screen.getByRole<HTMLInputElement>("combobox", { name: "Pesquisar produtos" });
}

function options(): string[] {
  return screen.queryAllByRole("option").map((option) => option.textContent ?? "");
}

beforeEach(() => {
  push.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("ShopSearch", () => {
  test("is a search form sent with GET to the listing of the whole shop, under `q`", () => {
    renderSearch("pneu");

    const form = screen.getByRole("search");
    expect(form.getAttribute("action")).toBe("/pt/shop");
    expect(form.getAttribute("method")).toBe("get");
    expect(field().name).toBe("q");
    expect(field().value).toBe("pneu");
    expect(screen.getByRole("button", { name: "Pesquisar" })).toBeTruthy();
  });

  test("asks the server once the visitor pauses, with the text and the language", async () => {
    vi.useFakeTimers();
    const fetchDouble = answering({ suggestions: SUGGESTIONS });
    renderSearch();

    fireEvent.change(field(), { target: { value: "pn" } });
    fireEvent.change(field(), { target: { value: "pne" } });
    fireEvent.change(field(), { target: { value: "pneu" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SUGGESTION_DELAY_MS);
    });

    expect(fetchDouble).toHaveBeenCalledTimes(1);
    expect(fetchDouble.mock.calls[0]).toEqual([
      "/api/search?q=pneu&lang=pt",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ]);
  });

  test("asks nothing for the text the page was opened with", async () => {
    vi.useFakeTimers();
    const fetchDouble = answering({ suggestions: SUGGESTIONS });
    renderSearch("pneu");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SUGGESTION_DELAY_MS * 2);
    });

    expect(fetchDouble).not.toHaveBeenCalled();
  });

  test("asks nothing for one character", async () => {
    vi.useFakeTimers();
    const fetchDouble = answering({ suggestions: SUGGESTIONS });
    renderSearch();

    fireEvent.change(field(), { target: { value: "p" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SUGGESTION_DELAY_MS * 2);
    });

    expect(fetchDouble).not.toHaveBeenCalled();
  });

  test("shows the suggestions as the server gives them, a section with its mark", async () => {
    answering({ suggestions: SUGGESTIONS });
    renderSearch();

    await userEvent.type(field(), "pnue");

    await waitFor(() => expect(options()).toEqual(["PneusSecção", "Pneu traseiro"]));
    expect(screen.getByRole("status").textContent).toBe("2 sugestões");
  });

  test("a chosen suggestion leads to its address", async () => {
    answering({ suggestions: SUGGESTIONS });
    renderSearch();

    await userEvent.type(field(), "pneu");
    await waitFor(() => expect(options()).toHaveLength(2));
    await userEvent.click(screen.getByRole("option", { name: /Pneus/ }));

    expect(push).toHaveBeenCalledWith("/pt/shop/tyres");
  });

  test.each([
    ["the firewall's limit", () => answering("Too Many Requests", { status: 429 })],
    ["a failed request", () => vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))))],
    ["an answer of another shape", () => answering({ suggestions: "x" })],
    [
      "an address of another site",
      () => answering({ suggestions: [{ kind: "product", label: "X", href: "//evil.example" }] }),
    ],
    [
      "an address of another site, with a backslash",
      () => answering({ suggestions: [{ kind: "product", label: "X", href: "/\\evil.example" }] }),
    ],
  ])("%s gives no suggestion, and says so", async (_case, arrange) => {
    arrange();
    renderSearch();

    await userEvent.type(field(), "pneu");

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Sem sugestões"));
    expect(options()).toEqual([]);
  });

  test("announces nothing while the answer for the text is awaited", async () => {
    vi.useFakeTimers();
    answering({ suggestions: [] });
    renderSearch();

    fireEvent.change(field(), { target: { value: "pneu" } });

    expect(screen.getByRole("status").textContent).toBe("");
  });
});
