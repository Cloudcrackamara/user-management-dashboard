import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getInitials } from "@/components/ui/avatar";
import { fetchUsers } from "@/lib/api/users";
import { AUTH_EMAIL_KEY, AUTH_TOKEN_KEY } from "@/lib/auth";
import { getDisplayName, getGreeting } from "@/lib/greeting";
import { toUser, type User } from "@/lib/schemas/user";
import { buildApiUser } from "@/lib/test/fixtures";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { getCityCounts, getPercentage, getRecentUsers } from "@/lib/user-stats";
import { DashboardGreeting } from "./dashboard-greeting";
import { RecentUsers } from "./recent-users";
import { UsersByCity } from "./users-by-city";

vi.mock("@/lib/api/users", () => ({
  fetchUsers: vi.fn(),
}));

const fetchUsersMock = vi.mocked(fetchUsers);

function buildUser(id: number, name: string, city: string): User {
  const apiUser = buildApiUser({
    id,
    name,
    email: `user${id}@example.com`,
  });

  return toUser({ ...apiUser, address: { ...apiUser.address, city } });
}

/** Ids 3 and 6 are inactive. Lagos has 3 users, Abuja 2, Kano 1, Jos 1. */
const users: User[] = [
  buildUser(1, "Ada Obi", "Lagos"),
  buildUser(2, "Bola Ade", "Abuja"),
  buildUser(3, "Chidi Eze", "Lagos"),
  buildUser(4, "Dayo Cole", "Kano"),
  buildUser(5, "Efe Udo", "Lagos"),
  buildUser(6, "Femi Bello", "Abuja"),
  buildUser(7, "Gbenga Musa", "Jos"),
];

beforeEach(() => {
  fetchUsersMock.mockReset();
});

afterEach(() => {
  window.localStorage.clear();
  vi.useRealTimers();
});

describe("greeting helpers", () => {
  it("picks the greeting from the hour", () => {
    const at = (hour: number) => getGreeting(new Date(2026, 0, 15, hour));

    expect(at(0)).toBe("Good morning");
    expect(at(11)).toBe("Good morning");
    expect(at(12)).toBe("Good afternoon");
    expect(at(17)).toBe("Good afternoon");
    expect(at(18)).toBe("Good evening");
    expect(at(23)).toBe("Good evening");
  });

  it("derives a display name from the email", () => {
    expect(getDisplayName("jane@example.com")).toBe("Jane");
    expect(getDisplayName("jane.doe@example.com")).toBe("Jane Doe");
    expect(getDisplayName("jane_van-doe+work@example.com")).toBe(
      "Jane Van Doe Work",
    );
    expect(getDisplayName("@example.com")).toBeNull();
    expect(getDisplayName(null)).toBeNull();
  });
});

describe("stat helpers", () => {
  it("rounds percentages and handles an empty total", () => {
    expect(getPercentage(7, 10)).toBe(70);
    expect(getPercentage(1, 3)).toBe(33);
    expect(getPercentage(0, 0)).toBe(0);
  });

  it("counts users per city, largest first, ties alphabetical", () => {
    expect(getCityCounts(users)).toEqual([
      { city: "Lagos", count: 3 },
      { city: "Abuja", count: 2 },
      { city: "Jos", count: 1 },
      { city: "Kano", count: 1 },
    ]);
  });

  it("returns the highest ids first as recent users", () => {
    expect(getRecentUsers(users, 3).map((user) => user.id)).toEqual([7, 6, 5]);
    expect(getRecentUsers(users, 20)).toHaveLength(7);
  });

  it("builds initials from the first and last words", () => {
    expect(getInitials("Leanne Graham")).toBe("LG");
    expect(getInitials("Mrs. Dennis Schulist")).toBe("MS");
    expect(getInitials("cher")).toBe("C");
    expect(getInitials("  ")).toBe("");
  });
});

describe("DashboardGreeting", () => {
  function renderGreetingAt(date: Date) {
    vi.useFakeTimers();
    vi.setSystemTime(date);
    renderWithQuery(<DashboardGreeting headingId="greeting" />);
  }

  it("greets the signed-in user by name with today's date", () => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, "mock-token-test");
    window.localStorage.setItem(AUTH_EMAIL_KEY, "amara.jane@example.com");

    renderGreetingAt(new Date(2026, 0, 15, 9, 30));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Good morning, Amara Jane",
    );
    expect(screen.getByRole("time")).toHaveTextContent("2026");
    expect(screen.getByRole("time")).toHaveTextContent("15");
  });

  it("greets without a name when the email is unknown", () => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, "mock-token-test");

    renderGreetingAt(new Date(2026, 0, 15, 20));

    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Good evening",
    );
  });
});

describe("UsersByCity", () => {
  it("shows a skeleton while loading", () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersByCity />);

    expect(
      screen.getByRole("heading", { name: "Users by City" }),
    ).toBeVisible();
    expect(screen.getByText("Loading users by city")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists each city with its count, largest first", async () => {
    fetchUsersMock.mockResolvedValue(users);
    renderWithQuery(<UsersByCity />);

    const [cityList] = await screen.findAllByRole("list");
    expect(
      within(cityList)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Lagos3 users", "Abuja2 users", "Jos1 user", "Kano1 user"]);
  });

  it("scales bars against the largest city", async () => {
    fetchUsersMock.mockResolvedValue(users);
    renderWithQuery(<UsersByCity />);

    const [cityList] = await screen.findAllByRole("list");
    const widths = within(cityList)
      .getAllByRole("listitem")
      .map((item) => item.querySelector<HTMLElement>("[style]")?.style.width);

    expect(widths).toEqual(["100%", "67%", "33%", "33%"]);
  });

  it("shows the Active vs Inactive split with a legend", async () => {
    fetchUsersMock.mockResolvedValue(users);
    renderWithQuery(<UsersByCity />);

    expect(
      await screen.findByRole("img", { name: "Active 71%, Inactive 29%" }),
    ).toBeVisible();

    const legend = screen.getAllByRole("list")[1];
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Active71%(5)", "Inactive29%(2)"]);
  });

  it("shows an error message, then recovers on retry", async () => {
    fetchUsersMock.mockRejectedValueOnce(new Error("Simulated failure"));
    fetchUsersMock.mockResolvedValueOnce(users);
    renderWithQuery(<UsersByCity />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load users by city");
    expect(alert).toHaveTextContent("Simulated failure");

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Lagos")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("RecentUsers", () => {
  it("shows a skeleton while loading, with the View all link", () => {
    fetchUsersMock.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<RecentUsers />);

    expect(screen.getByText("Loading recent users")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View all users" }),
    ).toHaveAttribute("href", "/dashboard/users");
  });

  it("lists the 5 most recent users with email and status", async () => {
    fetchUsersMock.mockResolvedValue(users);
    renderWithQuery(<RecentUsers />);

    const items = within(await screen.findByRole("list")).getAllByRole(
      "listitem",
    );

    expect(items.map((item) => item.textContent)).toEqual([
      "GMGbenga Musauser7@example.comActive",
      "FBFemi Bellouser6@example.comInactive",
      "EUEfe Udouser5@example.comActive",
      "DCDayo Coleuser4@example.comActive",
      "CEChidi Ezeuser3@example.comInactive",
    ]);
  });

  it("shows an error message, then recovers on retry", async () => {
    fetchUsersMock.mockRejectedValueOnce(new Error("Simulated failure"));
    fetchUsersMock.mockResolvedValueOnce(users);
    renderWithQuery(<RecentUsers />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load recent users",
    );

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Gbenga Musa")).toBeVisible();
  });
});
