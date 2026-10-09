import { render, screen, within } from "@testing-library/react";
import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from "@/components/ui/data/data-table";

const RAW_VALUE = /#[0-9a-f]{3,8}\b|\d+px/i;

type Order = { id: string; customer: string; items: number; totalCents: number; placedAt: Date };

const ORDERS: Order[] = [
  { id: "LMX-1001", customer: "Ana Silva", items: 2, totalCents: 69800, placedAt: new Date(0) },
  { id: "LMX-1002", customer: "Rui Costa", items: 1, totalCents: 12900, placedAt: new Date(0) },
];

const COLUMNS: DataTableColumn<Order>[] = [
  { key: "id", label: "Encomenda", mono: true },
  { key: "customer", label: "Cliente" },
  { key: "items", label: "Artigos", align: "right", width: "xs" },
  { key: "total", label: "Total", align: "right", render: (order) => `${order.totalCents / 100} EUR` },
];

const TABLE = {
  caption: "Encomendas",
  columns: COLUMNS,
  rows: ORDERS,
  rowKey: (order: Order) => order.id,
  emptyLabel: "Sem resultados.",
} satisfies DataTableProps<Order>;

function table(): HTMLTableElement {
  return screen.getByRole("table") as HTMLTableElement;
}

function message(): HTMLElement {
  return document.querySelector("[data-table-message]") as HTMLElement;
}

function bodyRows(): HTMLTableRowElement[] {
  return [...table().tBodies[0].rows];
}

describe("DataTable", () => {
  test("is a table named by its caption", () => {
    render(<DataTable {...TABLE} />);

    expect(screen.getByRole("table", { name: "Encomendas" })).toBeDefined();
    expect(table().caption?.textContent).toBe("Encomendas");
  });

  test("can keep its caption for assistive technology only", () => {
    render(<DataTable {...TABLE} captionHidden />);

    expect(table().caption?.className).toContain("sr-only");
    expect(screen.getByRole("table", { name: "Encomendas" })).toBeDefined();
  });

  test("has a column header for each column", () => {
    render(<DataTable {...TABLE} />);
    const headers = screen.getAllByRole("columnheader");

    expect(headers.map((header) => header.textContent)).toEqual([
      "Encomenda",
      "Cliente",
      "Artigos",
      "Total",
    ]);
    for (const header of headers) expect(header.getAttribute("scope")).toBe("col");
  });

  test("shows no message while it has rows", () => {
    render(<DataTable {...TABLE} />);

    expect(message()).toBeNull();
  });

  test("shows a row for each item, with the value under each column key", () => {
    render(<DataTable {...TABLE} />);

    expect(bodyRows()).toHaveLength(2);
    expect([...bodyRows()[0].cells].map((cell) => cell.textContent)).toEqual([
      "LMX-1001",
      "Ana Silva",
      "2",
      "698 EUR",
    ]);
  });

  test("a column with `render` shows what it returns", () => {
    render(<DataTable {...TABLE} />);

    expect(within(bodyRows()[1]).getByText("129 EUR")).toBeDefined();
  });

  test("aligns the header and the cells of a column alike", () => {
    render(<DataTable {...TABLE} />);
    const header = screen.getByRole("columnheader", { name: "Artigos" });

    expect(header.className.split(" ")).toContain("text-right");
    expect(bodyRows()[0].cells[2].className.split(" ")).toContain("text-right");
    expect(bodyRows()[0].cells[1].className.split(" ")).toContain("text-left");
  });

  test("gives a column one of the set widths", () => {
    render(<DataTable {...TABLE} />);

    expect(screen.getByRole("columnheader", { name: "Artigos" }).className.split(" ")).toContain(
      "w-20",
    );
  });

  test("sets a mono column in the mono face", () => {
    render(<DataTable {...TABLE} />);

    expect(bodyRows()[0].cells[0].className.split(" ")).toContain("font-mono");
    expect(bodyRows()[0].cells[1].className.split(" ")).not.toContain("font-mono");
  });

  test("keeps a cell on one line unless its column may wrap", () => {
    render(
      <DataTable
        {...TABLE}
        columns={[
          { key: "id", label: "Encomenda" },
          { key: "customer", label: "Cliente", wrap: true },
        ]}
      />,
    );

    expect(bodyRows()[0].cells[0].className.split(" ")).toContain("whitespace-nowrap");
    expect(bodyRows()[0].cells[1].className.split(" ")).not.toContain("whitespace-nowrap");
  });

  test("the dense table has less padding", () => {
    const { unmount } = render(<DataTable {...TABLE} />);
    expect(bodyRows()[0].cells[0].className.split(" ")).toContain("px-4");
    unmount();

    render(<DataTable {...TABLE} dense />);
    expect(bodyRows()[0].cells[0].className.split(" ")).toContain("px-3");
  });

  test("the cells of the row header column are headers of their rows", () => {
    render(<DataTable {...TABLE} rowHeader="id" />);
    const header = screen.getByRole("rowheader", { name: "LMX-1001" });

    expect(header.tagName).toBe("TH");
    expect(header.getAttribute("scope")).toBe("row");
    expect(screen.getAllByRole("rowheader")).toHaveLength(2);
  });

  test("a row is reached through a link in its header cell, never a click on the row", () => {
    render(
      <DataTable {...TABLE} rowHeader="id" rowHref={(order) => `/admin/encomendas/${order.id}`} />,
    );
    const link = within(screen.getByRole("rowheader", { name: "LMX-1002" })).getByRole("link", {
      name: "LMX-1002",
    });

    expect(link.getAttribute("href")).toBe("/admin/encomendas/LMX-1002");
    expect(screen.getAllByRole("link")).toHaveLength(2);
    for (const row of bodyRows()) {
      expect(row.hasAttribute("tabindex")).toBe(false);
      expect(row.onclick).toBeNull();
    }
  });

  test("tints a row on hover only when it holds a link, in CSS", () => {
    render(<DataTable {...TABLE} />);

    expect(bodyRows()[0].className).toContain("has-[a]:hover:bg-yellow-50");
  });

  test("with no rows it says so, under the header and in the status", () => {
    render(<DataTable {...TABLE} rows={[]} />);

    expect(bodyRows()).toHaveLength(0);
    expect(message().textContent).toBe("Sem resultados.");
    expect(screen.getByRole("status").textContent).toBe("Sem resultados.");
  });

  test("a message is beside the table, not in it, and stays in view when the table scrolls", () => {
    // In a cell it would be centred in the full width of a table that is
    // wider than the screen, and so out of sight.
    render(<DataTable {...TABLE} rows={[]} />);

    expect(table().contains(message())).toBe(false);
    expect(message().parentElement).toBe(table().parentElement);
    expect(message().className.split(" ")).toEqual(expect.arrayContaining(["sticky", "left-0"]));
  });

  test("the status exists before there is anything to say", () => {
    render(<DataTable {...TABLE} />);

    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.getByRole("status").className).toContain("sr-only");
  });

  test("while loading it is busy, says so in the status and shows hidden skeleton rows", () => {
    render(<DataTable {...TABLE} loading loadingLabel="A carregar encomendas" />);

    expect(table().getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("status").textContent).toBe("A carregar encomendas");
    expect(bodyRows()).toHaveLength(5);
    for (const row of bodyRows()) {
      expect(row.getAttribute("aria-hidden")).toBe("true");
      expect(row.cells).toHaveLength(4);
      expect(row.textContent).toBe("");
    }
    expect(screen.queryByText("Ana Silva")).toBeNull();
  });

  test("shows as many skeleton rows as asked", () => {
    render(<DataTable {...TABLE} loading loadingLabel="A carregar" skeletonRows={3} />);

    expect(bodyRows()).toHaveLength(3);
  });

  test("the skeleton pulses only when motion is welcome", () => {
    render(<DataTable {...TABLE} loading loadingLabel="A carregar" />);
    const bar = bodyRows()[0].cells[0].firstElementChild as HTMLElement;

    expect(bar.className).toContain("motion-safe:animate-pulse");
    expect(bar.className.split(" ")).not.toContain("animate-pulse");
  });

  test("is not busy when it is not loading", () => {
    render(<DataTable {...TABLE} />);

    expect(table().hasAttribute("aria-busy")).toBe(false);
  });

  test("an error takes the place of the rows, as an alert under the header", () => {
    render(<DataTable {...TABLE} error={<p>Não foi possível carregar.</p>} />);
    const alert = screen.getByRole("alert");

    expect(alert.textContent).toBe("Não foi possível carregar.");
    expect(message().contains(alert)).toBe(true);
    expect(bodyRows()).toHaveLength(0);
    expect(screen.queryByText("Ana Silva")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  test("an error wins over loading", () => {
    render(<DataTable {...TABLE} loading loadingLabel="A carregar" error={<p>Falhou.</p>} />);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(table().hasAttribute("aria-busy")).toBe(false);
  });

  test("sits in a scroll container that is not a tab stop while it fits", () => {
    render(<DataTable {...TABLE} data-testid="t" />);
    const container = table().parentElement as HTMLElement;

    expect(container.className).toContain("overflow-x-auto");
    expect(container.hasAttribute("tabindex")).toBe(false);
  });

  test("takes its text from props only", () => {
    render(
      <DataTable
        caption="Orders"
        columns={[{ key: "customer", label: "Customer" }]}
        rows={[]}
        rowKey={(order: Order) => order.id}
        emptyLabel="No results."
      />,
    );

    // The status, the table, then the message under it.
    expect(table().parentElement?.textContent).toBe("No results.OrdersCustomerNo results.");
  });

  test("uses no inline style and no raw colour or pixel value", () => {
    const { container } = render(
      <DataTable {...TABLE} rowHeader="id" rowHref={(order) => `/o/${order.id}`} />,
    );

    expect(container.querySelector("[style]")).toBeNull();
    for (const element of container.querySelectorAll("[class]")) {
      expect(element.getAttribute("class")).not.toMatch(RAW_VALUE);
    }
  });

  test("is typed by its rows", () => {
    expectTypeOf<DataTableProps<Order>>().toHaveProperty("caption").toEqualTypeOf<string>();
    expectTypeOf<DataTableProps<Order>>().toHaveProperty("emptyLabel").toEqualTypeOf<string>();
    expectTypeOf<DataTableProps<Order>>().not.toHaveProperty("style");
    // @ts-expect-error a date cannot be shown as it is: the column needs `render`
    const rawDate: DataTableColumn<Order> = { key: "placedAt", label: "Data" };
    // @ts-expect-error a key that is not in the row needs `render`
    const unknownKey: DataTableColumn<Order> = { key: "nothing", label: "Nada" };
    // @ts-expect-error a row link needs the column that holds it
    const linkWithoutHeader: DataTableProps<Order> = { ...TABLE, rowHref: () => "/" };
    // @ts-expect-error a loading table needs its message
    const loadingWithoutLabel: DataTableProps<Order> = { ...TABLE, loading: true };
    expect([rawDate, unknownKey, linkWithoutHeader, loadingWithoutLabel]).toHaveLength(4);
  });
});
