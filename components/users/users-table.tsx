"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Pagination } from "@/components/ui/pagination";
import { useUsers } from "@/hooks/useUsers";
import { clampPage, getPageCount, paginate } from "@/lib/pagination";
import type { User } from "@/lib/schemas/user";
import {
  sortUsersByName,
  toggleSortDirection,
  type SortDirection,
} from "@/lib/user-sort";
import { UserStatusBadge } from "./user-status-badge";

export const USERS_PAGE_SIZE = 10;

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

/** Users list with name sorting and pagination. */
export function UsersTable() {
  const { data: users, error, isFetching, refetch } = useUsers();
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  if (!users && error && !isFetching) {
    return (
      <ErrorMessage
        title="Could not load users"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  const sortedUsers = users ? sortUsersByName(users, sortDirection) : [];
  // Clamped so the view stays valid if the list shrinks under the saved page.
  const currentPage = clampPage(
    page,
    getPageCount(sortedUsers.length, USERS_PAGE_SIZE),
  );

  function handleSortChange() {
    setSortDirection(toggleSortDirection);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        caption="Users"
        columns={COLUMNS}
        rows={paginate(sortedUsers, currentPage, USERS_PAGE_SIZE)}
        getRowId={(user) => user.id}
        sort={{ columnId: NAME_COLUMN_ID, direction: sortDirection }}
        onSortChange={handleSortChange}
        isLoading={!users}
        skeletonRowCount={USERS_PAGE_SIZE}
        emptyState={
          <EmptyState
            title="No users found"
            description="There are no users to show yet."
          />
        }
      />

      {sortedUsers.length > 0 ? (
        <Pagination
          page={currentPage}
          pageSize={USERS_PAGE_SIZE}
          totalItems={sortedUsers.length}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
