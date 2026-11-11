import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchUsers } from "@/lib/api/users";
import { createQueryClient } from "@/lib/query-client";
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
  it("maps a settled query to idle, success, or error", () => {
    const settled = { fetchStatus: "idle", hasData: false } as const;

    expect(getRequestStatus({ ...settled, status: "pending" })).toBe("idle");
    expect(
      getRequestStatus({
        status: "pending",
        fetchStatus: "paused",
        hasData: false,
      }),
    ).toBe("idle");
    expect(
      getRequestStatus({ ...settled, status: "success", hasData: true }),
    ).toBe("success");
    expect(getRequestStatus({ ...settled, status: "error" })).toBe("error");
  });

  it("is loading when fetching with no data to show", () => {
    const fetching = { fetchStatus: "fetching", hasData: false } as const;

    // Initial fetch.
    expect(getRequestStatus({ ...fetching, status: "pending" })).toBe(
      "loading",
    );
    // Retry after a failed first fetch.
    expect(getRequestStatus({ ...fetching, status: "error" })).toBe("loading");
  });

  it("is refreshing when fetching with data already available", () => {
    const fetching = { fetchStatus: "fetching", hasData: true } as const;

    expect(getRequestStatus({ ...fetching, status: "success" })).toBe(
      "refreshing",
    );
    // Refetch after a failed background refresh; old data is still shown.
    expect(getRequestStatus({ ...fetching, status: "error" })).toBe(
      "refreshing",
    );
  });
});

describe("StatusIndicator", () => {
  it.each([
    ["idle", "Idle"],
    ["loading", "Loading"],
    ["refreshing", "Refreshing"],
    ["success", "Success"],
    ["error", "Error"],
  ] as const)("shows the %s state", (status, label) => {
    render(<StatusIndicator status={status} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      `API status: ${label}`,
    );
  });

  it("shows the last updated time on success and while refreshing", () => {
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
      <StatusIndicator status="refreshing" lastUpdatedAt={lastUpdatedAt} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Last updated");

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

  it("shows Refreshing, not Loading, during a background refetch", async () => {
    const users = [toUser(buildApiUser())];
    let finishRefetch: (value: typeof users) => void = () => {};
    fetchUsersMock.mockResolvedValueOnce(users);
    fetchUsersMock.mockReturnValueOnce(
      new Promise((resolve) => {
        finishRefetch = resolve;
      }),
    );
    const queryClient = createQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UsersStatusIndicator />
      </QueryClientProvider>,
    );
    await screen.findByText("Success");

    act(() => void queryClient.invalidateQueries());

    expect(await screen.findByText("Refreshing")).toBeVisible();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Last updated");

    act(() => finishRefetch(users));

    expect(await screen.findByText("Success")).toBeVisible();
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
