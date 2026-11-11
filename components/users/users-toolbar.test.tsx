import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchUsers } from "@/lib/api/users";
import { toUser, type User } from "@/lib/schemas/user";
import { buildApiUser } from "@/lib/test/fixtures";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { USERS_PAGE_SIZE, UsersTable } from "./users-table";

vi.mock("@/lib/api/users", () => ({
  fetchUsers: vi.fn(),
}));

const fetchUsersMock = vi.mocked(fetchUsers);

const CITIES = ["Lagos", "Abuja", "Kano"] as const;

/**
 * 24 users named "User 01" … "User 24". Cities cycle Lagos, Abuja, Kano,
 * so every third user (also the inactive ones) lives in Kano.
 */
const users: User[] = Array.from({ length: 24 }, (_, index) => {
  const id = index + 1;
  const apiUser = buildApiUser({
    id,
    name: `User ${String(id).padStart(2, "0")}`,
    email: `person${id}@example.com`,
  });

  return toUser({
    ...apiUser,
    address: { ...apiUser.address, city: CITIES[index % CITIES.length] },
  });
});

function getTableNames(): (string | null)[] {
  const table = screen.queryByRole("table", { name: "Users" });

  return table
    ? within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent)
    : [];
}

/** Fake timers make the 300ms debounce exact, so events use fireEvent. */
async function renderLoadedTable() {
  fetchUsersMock.mockResolvedValue(users);
  renderWithQuery(<UsersTable />);
  await act(() => vi.runAllTimersAsync());
}

function type(value: string) {
  fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
    target: { value },
  });
}

function select(label: string, value: string) {
  fireEvent.change(screen.getByRole("combobox", { name: label }), {
    target: { value },
  });
}

function settleDebounce() {
  act(() => vi.advanceTimersByTime(300));
}

beforeEach(() => {
  vi.useFakeTimers();
  fetchUsersMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UsersTable toolbar", () => {
  it("disables the dropdowns while loading", () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersTable />);

    expect(screen.getByRole("combobox", { name: "Status" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "City" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeDisabled();
  });

  it("derives the city options from the data", async () => {
    await renderLoadedTable();

    const options = within(
      screen.getByRole("combobox", { name: "City" }),
    ).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual([
      "All cities",
      "Abuja",
      "Kano",
      "Lagos",
    ]);
  });

  it("applies the search only after 300ms", async () => {
    await renderLoadedTable();

    type("user 07");
    act(() => vi.advanceTimersByTime(299));
    expect(getTableNames()).toHaveLength(USERS_PAGE_SIZE);

    act(() => vi.advanceTimersByTime(1));
    expect(getTableNames()).toEqual(["User 07"]);
    expect(screen.getByText("Showing 1–1 of 1")).toBeVisible();
  });

  it("searches by email as well as name", async () => {
    await renderLoadedTable();

    type("PERSON12@");
    settleDebounce();

    expect(getTableNames()).toEqual(["User 12"]);
  });

  it("filters by status and by city", async () => {
    await renderLoadedTable();

    select("Status", "Inactive");
    expect(screen.getByText("Showing 1–5 of 8")).toBeVisible();

    select("Status", "");
    select("City", "Abuja");
    expect(getTableNames()).toEqual([
      "User 02",
      "User 05",
      "User 08",
      "User 11",
      "User 14",
    ]);
    expect(screen.getByText("Showing 1–5 of 8")).toBeVisible();
  });

  it("combines search with both filters", async () => {
    await renderLoadedTable();

    select("Status", "Active");
    select("City", "Lagos");
    type("user 1");
    settleDebounce();

    expect(getTableNames()).toEqual([
      "User 10",
      "User 13",
      "User 16",
      "User 19",
    ]);
  });

  it("returns to page 1 when a filter or the search changes", async () => {
    await renderLoadedTable();
    const pageTwo = () => screen.getByRole("button", { name: "Page 2" });
    const pageOne = () => screen.getByRole("button", { name: "Page 1" });

    fireEvent.click(pageTwo());
    expect(pageTwo()).toHaveAttribute("aria-current", "page");

    select("Status", "Active");
    expect(pageOne()).toHaveAttribute("aria-current", "page");

    fireEvent.click(pageTwo());
    type("user");
    settleDebounce();
    expect(pageOne()).toHaveAttribute("aria-current", "page");
  });

  it("shows a filtered empty state that can clear the filters", async () => {
    await renderLoadedTable();

    type("nobody");
    settleDebounce();

    expect(screen.getByText("No users match your filters")).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    const emptyState = screen
      .getByText("No users match your filters")
      .closest("div");
    fireEvent.click(
      within(emptyState as HTMLElement).getByRole("button", {
        name: "Clear filters",
      }),
    );

    expect(getTableNames()).toHaveLength(USERS_PAGE_SIZE);
  });

  it("clears search and filters at once, without waiting for the debounce", async () => {
    await renderLoadedTable();
    const clear = screen.getByRole("button", { name: "Clear filters" });

    expect(clear).toBeDisabled();

    select("Status", "Inactive");
    select("City", "Kano");
    type("user 03");
    settleDebounce();
    expect(getTableNames()).toEqual(["User 03"]);

    fireEvent.click(clear);

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "City" })).toHaveValue("");
    expect(screen.getByText("Showing 1–5 of 24")).toBeVisible();
    expect(clear).toBeDisabled();
  });
});
