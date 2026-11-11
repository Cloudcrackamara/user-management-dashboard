import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchUsers } from "@/lib/api/users";
import { toUser, type User } from "@/lib/schemas/user";
import { buildApiUser } from "@/lib/test/fixtures";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { sortUsersByName } from "@/lib/user-sort";
import { UsersTable } from "./users-table";

vi.mock("@/lib/api/users", () => ({
  fetchUsers: vi.fn(),
}));

const fetchUsersMock = vi.mocked(fetchUsers);

/** "User 01" … "User 25", supplied in reverse so sorting is observable. */
function buildUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    return toUser(
      buildApiUser({
        id,
        name: `User ${String(id).padStart(2, "0")}`,
        email: `user${id}@example.com`,
      }),
    );
  }).reverse();
}

/** Names in the desktop table's body rows, in display order. */
function getTableNames(): (string | null)[] {
  const table = screen.getByRole("table", { name: "Users" });

  return within(table)
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent);
}

async function renderLoadedTable(users: User[]) {
  fetchUsersMock.mockResolvedValue(users);
  renderWithQuery(<UsersTable />);
  await screen.findAllByRole("rowheader");

  return userEvent.setup();
}

beforeEach(() => {
  fetchUsersMock.mockReset();
});

describe("sortUsersByName", () => {
  it("sorts both ways without mutating the input", () => {
    const users = buildUsers(3);
    const original = [...users];

    expect(sortUsersByName(users, "asc").map((user) => user.name)).toEqual([
      "User 01",
      "User 02",
      "User 03",
    ]);
    expect(sortUsersByName(users, "desc").map((user) => user.name)).toEqual([
      "User 03",
      "User 02",
      "User 01",
    ]);
    expect(users).toEqual(original);
  });
});

describe("UsersTable", () => {
  it("shows skeleton rows while loading", () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersTable />);

    expect(screen.getByText("Loading Users")).toBeInTheDocument();
    // Header row plus 10 skeleton rows.
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      11,
    );
    expect(screen.queryByRole("rowheader")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders each column for a user, with a status badge", async () => {
    await renderLoadedTable(buildUsers(3));

    const table = screen.getByRole("table", { name: "Users" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Name", "Email", "Company", "City", "Status"]);

    const row = within(table).getByRole("row", { name: /User 03/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual([
      "user3@example.com",
      "Romaguera-Crona",
      "Gwenborough",
      "Inactive",
    ]);
  });

  it("shows the first 10 users sorted by name ascending", async () => {
    await renderLoadedTable(buildUsers(25));

    expect(getTableNames()).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `User ${String(index + 1).padStart(2, "0")}`,
      ),
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(screen.getByText("Showing 1–10 of 25")).toBeVisible();
  });

  it("toggles the name sort and returns to the first page", async () => {
    const user = await renderLoadedTable(buildUsers(25));
    await user.click(screen.getByRole("button", { name: "Page 2" }));

    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(getTableNames().slice(0, 3)).toEqual([
      "User 25",
      "User 24",
      "User 23",
    ]);
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(getTableNames()[0]).toBe("User 01");
  });

  it("pages through the users with the page controls", async () => {
    const user = await renderLoadedTable(buildUsers(25));
    const previous = screen.getByRole("button", { name: "Previous page" });
    const next = screen.getByRole("button", { name: "Next page" });

    expect(previous).toBeDisabled();

    await user.click(next);
    expect(getTableNames()[0]).toBe("User 11");
    expect(screen.getByText("Showing 11–20 of 25")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(getTableNames()).toEqual([
      "User 21",
      "User 22",
      "User 23",
      "User 24",
      "User 25",
    ]);
    expect(screen.getByText("Showing 21–25 of 25")).toBeVisible();
    expect(next).toBeDisabled();

    await user.click(previous);
    expect(getTableNames()[0]).toBe("User 11");
  });

  it("renders the same rows in the stacked card list", async () => {
    await renderLoadedTable(buildUsers(3));

    const cards = within(
      screen.getByRole("list", { name: "Users" }),
    ).getAllByRole("listitem");

    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent("User 01");
    expect(cards[0]).toHaveTextContent("user1@example.com");
    expect(cards[0]).toHaveTextContent("Active");
  });

  it("sorts from the stacked layout's sort button", async () => {
    const user = await renderLoadedTable(buildUsers(3));

    await user.click(
      screen.getByRole("button", { name: "Sort by Name, ascending" }),
    );

    expect(getTableNames()[0]).toBe("User 03");
    expect(
      screen.getByRole("button", { name: "Sort by Name, descending" }),
    ).toBeVisible();
  });

  it("shows an empty state when there are no users", async () => {
    fetchUsersMock.mockResolvedValue([]);
    renderWithQuery(<UsersTable />);

    expect(await screen.findByText("No users found")).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("shows an error message, then recovers on retry", async () => {
    fetchUsersMock.mockRejectedValueOnce(new Error("Simulated failure"));
    fetchUsersMock.mockResolvedValueOnce(buildUsers(3));
    renderWithQuery(<UsersTable />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load users",
    );

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findAllByRole("rowheader")).toHaveLength(3);
  });
});
