import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchUsers } from "@/lib/api/users";
import { getRequestStatus } from "@/lib/request-status";
import { buildApiUser } from "@/lib/test/fixtures";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { toUser } from "@/lib/schemas/user";
import { StatusIndicator } from "./status-indicator";
import { UsersStatusIndicator } from "./users-status-indicator";

vi.mock("@/lib/api/users", () => ({
  fetchUsers: vi.fn(),
}));

const fetchUsersMock = vi.mocked(fetchUsers);

beforeEach(() => {
  fetchUsersMock.mockReset();
});

describe("getRequestStatus", () => {
  it("maps query state to a single status", () => {
    expect(
      getRequestStatus({ status: "pending", fetchStatus: "fetching" }),
    ).toBe("loading");
    expect(getRequestStatus({ status: "pending", fetchStatus: "idle" })).toBe(
      "idle",
    );
    expect(getRequestStatus({ status: "pending", fetchStatus: "paused" })).toBe(
      "idle",
    );
    expect(getRequestStatus({ status: "success", fetchStatus: "idle" })).toBe(
      "success",
    );
    expect(getRequestStatus({ status: "error", fetchStatus: "idle" })).toBe(
      "error",
    );
  });

  it("treats a retry or refetch as loading", () => {
    expect(getRequestStatus({ status: "error", fetchStatus: "fetching" })).toBe(
      "loading",
    );
    expect(
      getRequestStatus({ status: "success", fetchStatus: "fetching" }),
    ).toBe("loading");
  });
});

describe("StatusIndicator", () => {
  it.each([
    ["idle", "Idle"],
    ["loading", "Loading"],
    ["success", "Success"],
    ["error", "Error"],
  ] as const)("shows the %s state", (status, label) => {
    render(<StatusIndicator status={status} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      `API status: ${label}`,
    );
  });

  it("shows the last updated time only on success", () => {
    const lastUpdatedAt = new Date("2026-01-15T10:30:00Z").getTime();
    const { rerender } = render(
      <StatusIndicator status="success" lastUpdatedAt={lastUpdatedAt} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Last updated");
    expect(screen.getByRole("time")).toHaveAttribute(
      "datetime",
      "2026-01-15T10:30:00.000Z",
    );

    rerender(
      <StatusIndicator status="loading" lastUpdatedAt={lastUpdatedAt} />,
    );
    expect(screen.getByRole("status")).not.toHaveTextContent("Last updated");
  });

  it("shows a Retry button only on error", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <StatusIndicator status="success" onRetry={onRetry} />,
    );
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();

    rerender(
      <StatusIndicator
        status="error"
        errorMessage="Failed to load users."
        onRetry={onRetry}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Failed to load users.",
    );
  });
});

describe("UsersStatusIndicator", () => {
  it("goes from loading to success with a last updated time", async () => {
    fetchUsersMock.mockResolvedValue([toUser(buildApiUser())]);
    renderWithQuery(<UsersStatusIndicator />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    expect(await screen.findByText("Success")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Last updated");
  });

  it("shows an error, then recovers when Retry succeeds", async () => {
    fetchUsersMock.mockRejectedValueOnce(new Error("Simulated failure"));
    fetchUsersMock.mockResolvedValueOnce([toUser(buildApiUser())]);
    renderWithQuery(<UsersStatusIndicator />);

    expect(await screen.findByText("Error")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Simulated failure");

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Success")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
    expect(fetchUsersMock).toHaveBeenCalledTimes(2);
  });
});
