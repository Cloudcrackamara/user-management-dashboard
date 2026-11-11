import { Button } from "@/components/ui/button";
import { SelectField, type SelectOption } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { USER_STATUSES } from "@/lib/schemas/user";
import {
  ALL,
  hasActiveFilters,
  parseStatusFilter,
  type UserFilters,
} from "@/lib/user-filters";

type UsersToolbarProps = {
  filters: UserFilters;
  /** Cities to offer in the City filter. */
  cityOptions: readonly string[];
  onFiltersChange: (changes: Partial<UserFilters>) => void;
  onClear: () => void;
  /** Disables the dropdowns, e.g. while their options are loading. */
  isLoading?: boolean;
};

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: ALL, label: "All statuses" },
  ...USER_STATUSES.map((status) => ({ value: status, label: status })),
];

/** Search box, Status and City filters, and a Clear filters button. */
export function UsersToolbar({
  filters,
  cityOptions,
  onFiltersChange,
  onClear,
  isLoading = false,
}: UsersToolbarProps) {
  const cityFilterOptions: SelectOption[] = [
    { value: ALL, label: "All cities" },
    ...cityOptions.map((city) => ({ value: city, label: city })),
  ];

  return (
    <div
      role="search"
      aria-label="Filter users"
      className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_auto]"
    >
      <TextField
        label="Search"
        type="search"
        name="search"
        placeholder="Search by name or email"
        autoComplete="off"
        value={filters.search}
        onChange={(event) => onFiltersChange({ search: event.target.value })}
      />
      <SelectField
        label="Status"
        name="status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(event) =>
          onFiltersChange({ status: parseStatusFilter(event.target.value) })
        }
        disabled={isLoading}
      />
      <SelectField
        label="City"
        name="city"
        options={cityFilterOptions}
        value={filters.city}
        onChange={(event) => onFiltersChange({ city: event.target.value })}
        disabled={isLoading}
      />
      <Button
        variant="secondary"
        onClick={onClear}
        disabled={!hasActiveFilters(filters)}
      >
        Clear filters
      </Button>
    </div>
  );
}
