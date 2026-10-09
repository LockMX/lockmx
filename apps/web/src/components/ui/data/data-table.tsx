import Link from "next/link";
import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import { ScrollRegion } from "@/components/ui/data/scroll-region";

type ColumnAlign = "left" | "center" | "right";
type ColumnWidth = "xs" | "sm" | "md" | "lg";

/** What a cell can show as it is. Anything else needs `render`. */
type CellValue = string | number;

type ValueKey<Row> = {
  [Key in keyof Row & string]: Row[Key] extends CellValue ? Key : never;
}[keyof Row & string];

export type DataTableColumn<Row> = {
  /** The column header. */
  label: string;
  align?: ColumnAlign;
  /** One of the set widths. Without it the browser shares the room. */
  width?: ColumnWidth;
  /** For codes and numbers that should line up: the mono face. */
  mono?: boolean;
  /** Lets long text take more than one line. Cells are one line otherwise. */
  wrap?: boolean;
} & (
  | {
      /** A property of the row that is text or a number, shown as it is. */
      key: ValueKey<Row>;
      render?: (row: Row) => React.ReactNode;
    }
  | {
      /** Any name, unique among the columns, when `render` makes the cell. */
      key: string;
      render: (row: Row) => React.ReactNode;
    }
);

export type DataTableProps<Row> = Omit<
  React.ComponentProps<"table">,
  "style" | "children" | "aria-busy"
> & {
  /** The name of the table. Always there; `captionHidden` hides it from sight. */
  caption: string;
  captionHidden?: boolean;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  dense?: boolean;
  /** Shown, and announced, when there are no rows. */
  emptyLabel: string;
  /** Takes the place of the rows: a message, perhaps with a way to retry. */
  error?: React.ReactNode;
  /** How many skeleton rows a loading table shows. */
  skeletonRows?: number;
} & (
    | { loading?: false; loadingLabel?: string }
    | {
        loading: true;
        /** Announced while the rows are loading. */
        loadingLabel: string;
      }
  ) &
  (
    | { rowHeader?: string; rowHref?: undefined }
    | {
        /** The key of the column whose cells are the headers of their rows. */
        rowHeader: string;
        /** Where a row leads: its header cell becomes the link. */
        rowHref: (row: Row) => string;
      }
  );

const ALIGN_CLASSES: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const WIDTH_CLASSES: Record<ColumnWidth, string> = {
  xs: "w-20",
  sm: "w-32",
  md: "w-48",
  lg: "w-64",
};

const DEFAULT_SKELETON_ROWS = 5;

function cellContent<Row>(column: DataTableColumn<Row>, row: Row): React.ReactNode {
  if (column.render) return column.render(row);
  // The column type allows only keys whose value is text or a number here.
  return (row as Record<string, CellValue>)[column.key];
}

/**
 * A table of rows with typed columns. The states take the place of the rows,
 * in this order: an error, loading, empty; the error and the empty message
 * sit under the header row. A row leads somewhere through a
 * link in its header cell, never a click on the row. It has no state of its
 * own, so a Server Component can give it `render` functions.
 */
export function DataTable<Row>({
  caption,
  captionHidden = false,
  columns,
  rows,
  rowKey,
  dense = false,
  emptyLabel,
  error,
  loading = false,
  loadingLabel,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  rowHeader,
  rowHref,
  className,
  ...tableProps
}: DataTableProps<Row>) {
  const captionId = useId();
  const failed = error !== undefined && error !== null && error !== false;
  const busy = loading && !failed;
  const empty = !failed && !busy && rows.length === 0;
  const cellPadding = dense ? "px-3 py-2" : "px-4 py-3";
  const headerPadding = dense ? "px-3 py-2" : "px-4 py-2.5";

  function status(): string {
    if (busy) return loadingLabel ?? "";
    return empty ? emptyLabel : "";
  }

  function dataCell(column: DataTableColumn<Row>, row: Row) {
    const content = cellContent(column, row);
    const cellClassName = classNames(
      "border-b border-border-subtle align-middle",
      cellPadding,
      ALIGN_CLASSES[column.align ?? "left"],
      column.mono && "font-mono",
      // One line by default: a table that is short of room scrolls sideways
      // rather than breaking every cell into a column of words.
      !column.wrap && "whitespace-nowrap",
    );
    if (column.key !== rowHeader) {
      return (
        <td key={column.key} className={classNames(cellClassName, "text-text-body")}>
          {content}
        </td>
      );
    }
    return (
      <th
        key={column.key}
        scope="row"
        className={classNames(cellClassName, "font-semibold text-text-strong")}
      >
        {rowHref ? (
          <Link href={rowHref(row)} className="underline underline-offset-2">
            {content}
          </Link>
        ) : (
          content
        )}
      </th>
    );
  }

  function body() {
    if (failed || empty) return null;
    if (busy) {
      // Decoration: the status says the table is loading.
      return Array.from({ length: skeletonRows }, (_, index) => (
        <tr key={index} aria-hidden="true">
          {columns.map((column) => (
            <td key={column.key} className={classNames("border-b border-border-subtle", cellPadding)}>
              <span className="block h-4 rounded-xs bg-surface-sunken motion-safe:animate-pulse" />
            </td>
          ))}
        </tr>
      ));
    }
    return rows.map((row) => (
      <tr key={rowKey(row)} className="transition-colors has-[a]:hover:bg-yellow-50">
        {columns.map((column) => dataCell(column, row))}
      </tr>
    ));
  }

  return (
    <ScrollRegion
      labelledBy={captionId}
      className={classNames(
        "rounded-md border border-border-subtle bg-surface-card",
        className,
      )}
    >
      {/* Always rendered: a live region must exist before its content changes. */}
      <span role="status" className="sr-only">
        {status()}
      </span>
      <table
        {...tableProps}
        aria-busy={busy || undefined}
        className="w-full border-collapse text-sm"
      >
        <caption
          id={captionId}
          className={
            captionHidden
              ? "sr-only"
              : "caption-top px-4 py-3 text-left text-md font-semibold text-text-strong"
          }
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={classNames(
                  "border-b border-border-subtle bg-surface-subtle text-2xs font-semibold tracking-label whitespace-nowrap text-text-muted uppercase",
                  headerPadding,
                  ALIGN_CLASSES[column.align ?? "left"],
                  column.width && WIDTH_CLASSES[column.width],
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>*]:border-b-0">{body()}</tbody>
      </table>
      {/* Under the table, not in a cell: a cell is as wide as the table, and
          in a narrow container its centre is out of sight. This block is as
          wide as the container and stays put when the table scrolls. */}
      {(failed || empty) && (
        <div data-table-message className="sticky left-0 p-8 text-center text-text-muted">
          {failed ? <div role="alert">{error}</div> : emptyLabel}
        </div>
      )}
    </ScrollRegion>
  );
}
