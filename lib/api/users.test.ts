import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApiUser } from "@/lib/test/fixtures";
import {
  fetchUsers,
  shouldSimulateFailure,
  USERS_ENDPOINT,
  UsersApiError,
} from "./users";

function mockFetch(body: unknown, init: ResponseInit = {}) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(Response.json(body, init)),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.history.replaceState({}, "", "/");
});

describe("shouldSimulateFailure", () => {
  it("is true only for fail=true", () => {
    expect(shouldSimulateFailure("?fail=true")).toBe(true);
    expect(shouldSimulateFailure("?page=2&fail=true")).toBe(true);
    expect(shouldSimulateFailure("?fail=false")).toBe(false);
    expect(shouldSimulateFailure("")).toBe(false);
  });
});

describe("fetchUsers", () => {
  it("returns validated users with a derived status", async () => {
    const fetchMock = mockFetch([
      buildApiUser({ id: 1 }),
      buildApiUser({ id: 3 }),
    ]);

    const users = await fetchUsers({ latencyMs: 0 });

    expect(fetchMock).toHaveBeenCalledWith(USERS_ENDPOINT, {
      signal: undefined,
    });
    expect(users.map((user) => user.status)).toEqual(["Active", "Inactive"]);
  });

  it("waits for the simulated latency before resolving", async () => {
    vi.useFakeTimers();
    mockFetch([buildApiUser()]);
    const onSettled = vi.fn();

    const request = fetchUsers().then(onSettled);

    await vi.advanceTimersByTimeAsync(799);
    expect(onSettled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await request;
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("throws without calling the API when the URL has ?fail=true", async () => {
    const fetchMock = mockFetch([buildApiUser()]);
    window.history.replaceState({}, "", "/?fail=true");

    await expect(fetchUsers({ latencyMs: 0 })).rejects.toBeInstanceOf(
      UsersApiError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws on a non-OK response", async () => {
    mockFetch({}, { status: 500 });

    await expect(fetchUsers({ latencyMs: 0 })).rejects.toThrow(
      "Failed to load users (HTTP 500).",
    );
  });

  it("throws when the response does not match the schema", async () => {
    mockFetch([{ id: 1, name: "Incomplete" }]);

    await expect(fetchUsers({ latencyMs: 0 })).rejects.toThrow(
      "Received an unexpected response for users.",
    );
  });

  it("rejects when the request is aborted during the delay", async () => {
    const fetchMock = mockFetch([buildApiUser()]);
    const controller = new AbortController();

    const request = fetchUsers({ signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
