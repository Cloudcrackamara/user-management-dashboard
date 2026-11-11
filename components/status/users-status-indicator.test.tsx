import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SIMULATED_LATENCY_MS, USERS_ENDPOINT } from "@/lib/api/users";
import { buildApiUser } from "@/lib/test/fixtures";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { UsersStatusIndicator } from "./users-status-indicator";

/**
 * End to end through the real useUsers and fetchUsers: only the network
 * (global fetch) is mocked. Fake timers stand in for the simulated latency.
 */

function mockFetch() {
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(Response.json([buildApiUser()])),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Passes the simulated latency, then lets the query deliver its result. */
async function settleRequest() {
  await act(() => vi.advanceTimersByTimeAsync(SIMULATED_LATENCY_MS));
  await act(() => vi.advanceTimersByTimeAsync(10));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("UsersStatusIndicator with a mocked fetch", () => {
  it("shows Loading, then Success with a last updated time", async () => {
    const fetchMock = mockFetch();
    renderWithQuery(<UsersStatusIndicator />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(fetchMock).not.toHaveBeenCalled();

    await settleRequest();

    expect(screen.getByRole("status")).toHaveTextContent("Success");
    expect(screen.getByRole("status")).toHaveTextContent("Last updated");
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      USERS_ENDPOINT,
      expect.anything(),
    );
  });

  it("shows Error when the response is not OK", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() =>
        Promise.resolve(Response.json({}, { status: 500 })),
      ),
    );
    renderWithQuery(<UsersStatusIndicator />);

    await settleRequest();

    expect(screen.getByRole("status")).toHaveTextContent("Error");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Failed to load users (HTTP 500).",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  it("shows Error for ?fail=true, and Retry refetches successfully", async () => {
    const fetchMock = mockFetch();
    window.history.replaceState({}, "", "/dashboard?fail=true");
    renderWithQuery(<UsersStatusIndicator />);

    await settleRequest();

    expect(screen.getByRole("status")).toHaveTextContent("Error");
    // The simulated failure throws before the network is reached.
    expect(fetchMock).not.toHaveBeenCalled();

    window.history.replaceState({}, "", "/dashboard");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await act(() => vi.advanceTimersByTimeAsync(10));

    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    await settleRequest();

    expect(screen.getByRole("status")).toHaveTextContent("Success");
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
