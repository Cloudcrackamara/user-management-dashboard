"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Pagination } from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUsers";
import { clampPage, getPageCount, paginate } from "@/lib/pagination";
import type { User } from "@/lib/schemas/user";
import {
  DEFAULT_USER_FILTERS,
  filterUsers,
  getCityOptions,
  hasActiveFilters,
  type UserFilters,
} from "@/lib/user-filters";
import {
  sortUsersByName,
  toggleSortDirection,
  type SortDirection,
} from "@/lib/user-sort";
import { UserStatusBadge } from "./user-status-badge";
import { UsersToolbar } from "./users-toolbar";

/** Rows per page. Change this one value to resize every page. */
export const USERS_PAGE_SIZE = 5;

const SEARCH_DEBOUNCE_MS = 300;

const NAME_COLUMN_ID = "name";

const COLUMNS: readonly DataTableColumn<User>[] = [
  {
    id: NAME_COLUMN_ID,
    header: "Name",
    cell: (user) => user.name,
    sortable: true,
    isRowHeader: true,
  },
  { id: "email", header: "Email", cell: (user) => user.email },
  { id: "company", header: "Company", cell: (user) => user.company.name },
  { id: "city", header: "City", cell: (user) => user.address.city },
  {
    id: "status",
    header: "Status",
    cell: (user) => <UserStatusBadge status={user.status} />,
  },
];

/** Users list with search, filters, name sorting, and pagination. */
export function UsersTable() {
  const { data: users, error, isFetching, refetch } = useUsers();
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, SEARCH_DEBOUNCE_MS);

  if (!users && error && !isFetching) {
    return (
      <ErrorMessage
        title="Could not load users"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  // The search box updates on every keystroke; filtering waits for the
  // debounce. An emptied box applies at once so clearing feels instant.
  const appliedFilters: UserFilters = {
    ...filters,
    search: filters.search === "" ? "" : debouncedSearch,
  };
  const visibleUsers = sortUsersByName(
    users ? filterUsers(users, appliedFilters) : [],
    sortDirection,
  );
  // Clamped so the view stays valid if the list shrinks under the saved page.
  const currentPage = clampPage(
    page,
    getPageCount(visibleUsers.length, USERS_PAGE_SIZE),
  );

  function handleFiltersChange(changes: Partial<UserFilters>) {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  }

  function handleClearFilters() {
    setFilters(DEFAULT_USER_FILTERS);
    setPage(1);
  }

  function handleSortChange() {
    setSortDirection(toggleSortDirection);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <UsersToolbar
        filters={filters}
        cityOptions={users ? getCityOptions(users) : []}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
        isLoading={!users}
      />

      <DataTable
        caption="Users"
        columns={COLUMNS}
        rows={paginate(visibleUsers, currentPage, USERS_PAGE_SIZE)}
        getRowId={(user) => user.id}
        sort={{ columnId: NAME_COLUMN_ID, direction: sortDirection }}
        onSortChange={handleSortChange}
        isLoading={!users}
        skeletonRowCount={USERS_PAGE_SIZE}
        emptyState={
          hasActiveFilters(appliedFilters) ? (
            <EmptyState
              title="No users match your filters"
              description="Try a different search, or clear the filters to see everyone."
              action={
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No users found"
              description="There are no users to show yet."
            />
          )
        }
      />

      {visibleUsers.length > 0 ? (
        <Pagination
          page={currentPage}
          pageSize={USERS_PAGE_SIZE}
          totalItems={visibleUsers.length}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
