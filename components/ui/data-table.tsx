import type { Key, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./card";
import { ArrowDownIcon, ArrowUpIcon } from "./icons";
import { Skeleton } from "./skeleton";

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSort = {
  columnId: string;
  direction: DataTableSortDirection;
};

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Shows a sort control for this column. Needs `onSortChange`. */
  sortable?: boolean;
  /** Marks the cell that identifies the row (rendered as a row header). */
  isRowHeader?: boolean;
};

type DataTableProps<T> = {
  /** Accessible name for the table. Visually hidden. */
  caption: string;
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => Key;
  /** The currently sorted column, if any. */
  sort?: DataTableSort;
  /** Called with the column id when a sort control is activated. */
  onSortChange?: (columnId: string) => void;
  /** Renders skeleton rows instead of `rows`. */
  isLoading?: boolean;
  skeletonRowCount?: number;
  /** Rendered instead of the table when there are no rows. */
  emptyState?: ReactNode;
};

const DIRECTION_LABELS = {
  asc: "ascending",
  desc: "descending",
} as const satisfies Record<DataTableSortDirection, string>;

const SORT_BUTTON_CLASSES =
  "inline-flex items-center gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

type SortIconProps = {
  direction: DataTableSortDirection | undefined;
};

/** Arrow for the active direction; a dimmed arrow when unsorted. */
function SortIcon({ direction }: SortIconProps) {
  if (direction === "desc") {
    return <ArrowDownIcon className="size-3.5" />;
  }

  return <ArrowUpIcon className={cn("size-3.5", !direction && "opacity-40")} />;
}

/**
 * Generic data table. Renders a real <table> from `md` up and a stacked
 * list of cards below it; only one is displayed at a time.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  isLoading = false,
  skeletonRowCount = 5,
  emptyState,
}: DataTableProps<T>) {
  if (!isLoading && rows.length === 0) {
    return emptyState ?? null;
  }

  const skeletonRows = Array.from(
    { length: skeletonRowCount },
    (_, index) => index,
  );
  const sortableColumns = onSortChange
    ? columns.filter((column) => column.sortable)
    : [];
  const directionFor = (columnId: string) =>
    sort?.columnId === columnId ? sort.direction : undefined;

  return (
    <div aria-busy={isLoading || undefined}>
      {isLoading ? <p className="sr-only">Loading {caption}</p> : null}

      {/* Table: md and up */}
      <Card className="hidden overflow-x-auto p-0 md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              {columns.map((column) => {
                const direction = directionFor(column.id);
                const isSortable = column.sortable && onSortChange;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      direction ? DIRECTION_LABELS[direction] : undefined
                    }
                    className="px-4 py-3 font-semibold tracking-wide whitespace-nowrap"
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(column.id)}
                        className={cn(
                          SORT_BUTTON_CLASSES,
                          "uppercase hover:text-zinc-900 dark:hover:text-zinc-100",
                        )}
                      >
                        {column.header}
                        <SortIcon direction={direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading
              ? skeletonRows.map((index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={getRowId(row)}
                    className="text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    {columns.map((column) =>
                      column.isRowHeader ? (
                        <th
                          key={column.id}
                          scope="row"
                          className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50"
                        >
                          {column.cell(row)}
                        </th>
                      ) : (
                        <td key={column.id} className="px-4 py-3">
                          {column.cell(row)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </Card>

      {/* Stacked cards: below md */}
      <div className="flex flex-col gap-3 md:hidden">
        {sortableColumns.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sortableColumns.map((column) => {
              const direction = directionFor(column.id);

              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => onSortChange?.(column.id)}
                  className={cn(
                    SORT_BUTTON_CLASSES,
                    "border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
                  )}
                >
                  Sort by {column.header}
                  <SortIcon direction={direction} />
                  {direction ? (
                    <span className="sr-only">
                      , {DIRECTION_LABELS[direction]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <ul aria-label={caption} className="flex flex-col gap-3">
          {isLoading
            ? skeletonRows.map((index) => (
                <li key={index}>
                  <Card className="flex flex-col gap-3 p-4">
                    {columns.map((column) => (
                      <div key={column.id} className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    ))}
                  </Card>
                </li>
              ))
            : rows.map((row) => (
                <li key={getRowId(row)}>
                  <Card className="p-4">
                    <dl className="flex flex-col gap-2 text-sm">
                      {columns.map((column) => (
                        <div
                          key={column.id}
                          className="flex items-start justify-between gap-4"
                        >
                          <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">
                            {column.header}
                          </dt>
                          <dd
                            className={cn(
                              "min-w-0 text-right break-words text-zinc-700 dark:text-zinc-300",
                              column.isRowHeader &&
                                "font-medium text-zinc-900 dark:text-zinc-50",
                            )}
                          >
                            {column.cell(row)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Card>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}
