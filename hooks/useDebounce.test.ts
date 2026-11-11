import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderDebounce(initialValue: string, delayMs?: number) {
  return renderHook(({ value }) => useDebounce(value, delayMs), {
    initialProps: { value: initialValue },
  });
}

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderDebounce("a");

    expect(result.current).toBe("a");
  });

  it("updates only after the default 300ms delay", () => {
    const { result, rerender } = renderDebounce("a");

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("ab");
  });

  it("restarts the delay on each change and keeps only the last value", () => {
    const { result, rerender } = renderDebounce("a");

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });

  it("respects a custom delay", () => {
    const { result, rerender } = renderDebounce("a", 1000);

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("ab");
  });
});
