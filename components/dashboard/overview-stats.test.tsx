import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchUsers } from "@/lib/api/users";
import { toUser, type User } from "@/lib/schemas/user";
import { buildApiUser } from "@/lib/test/fixtures";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { getUserStats } from "@/lib/user-stats";
import { OverviewStats } from "./overview-stats";

vi.mock("@/lib/api/users", () => ({
  fetchUsers: vi.fn(),
}));

const fetchUsersMock = vi.mocked(fetchUsers);

function buildUser(id: number, companyName: string): User {
  const apiUser = buildApiUser({ id });

  return toUser({
    ...apiUser,
    company: { ...apiUser.company, name: companyName },
  });
}

/** Ids 3 and 6 are inactive; three distinct companies. */
const users: User[] = [
  buildUser(1, "Acme"),
  buildUser(2, "Acme"),
  buildUser(3, "Globex"),
  buildUser(4, "Globex"),
  buildUser(5, "Initech"),
  buildUser(6, "Initech"),
];

function getStat(label: string): string | null {
  const term = screen.getByText(label);
  const card = term.closest("div");

  return card ? within(card).getByRole("definition").textContent : null;
}

beforeEach(() => {
  fetchUsersMock.mockReset();
});

describe("getUserStats", () => {
  it("counts totals, statuses, and distinct companies", () => {
    expect(getUserStats(users)).toEqual({
      total: 6,
      active: 4,
      inactive: 2,
      companies: 3,
    });
  });

  it("returns zeros for an empty list", () => {
    expect(getUserStats([])).toEqual({
      total: 0,
      active: 0,
      inactive: 0,
      companies: 0,
    });
  });
});

describe("OverviewStats", () => {
  it("shows skeletons while loading", () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<OverviewStats />);

    expect(screen.getByText("Loading statistics")).toBeInTheDocument();
    expect(screen.queryByText("Total Users")).not.toBeInTheDocument();
  });

  it("shows the four figures computed from the users", async () => {
    fetchUsersMock.mockResolvedValue(users);
    renderWithQuery(<OverviewStats />);

    expect(await screen.findByText("Total Users")).toBeVisible();
    expect(getStat("Total Users")).toBe("6");
    expect(getStat("Active Users")).toBe("4");
    expect(getStat("Inactive Users")).toBe("2");
    expect(getStat("Companies")).toBe("3");
    expect(screen.queryByText("Loading statistics")).not.toBeInTheDocument();
  });

  it("shows an error message, then recovers on retry", async () => {
    fetchUsersMock.mockRejectedValueOnce(new Error("Simulated failure"));
    fetchUsersMock.mockResolvedValueOnce(users);
    renderWithQuery(<OverviewStats />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load statistics");
    expect(alert).toHaveTextContent("Simulated failure");

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Total Users")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
