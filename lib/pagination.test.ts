import { describe, expect, it } from "vitest";
import { clampPage, getPageCount, getPageItems, paginate } from "./pagination";

describe("getPageCount", () => {
  it("rounds up and never returns less than 1", () => {
    expect(getPageCount(0, 10)).toBe(1);
    expect(getPageCount(10, 10)).toBe(1);
    expect(getPageCount(11, 10)).toBe(2);
    expect(getPageCount(25, 10)).toBe(3);
  });
});

describe("clampPage", () => {
  it("keeps the page within 1 and the page count", () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(9, 3)).toBe(3);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it("returns the items on a 1-based page", () => {
    expect(paginate(items, 1, 10)).toEqual(items.slice(0, 10));
    expect(paginate(items, 3, 10)).toEqual([21, 22, 23, 24, 25]);
  });

  it("returns an empty list past the last page", () => {
    expect(paginate(items, 4, 10)).toEqual([]);
  });
});

describe("getPageItems", () => {
  it("lists every page for short ranges", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(2, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("truncates long ranges around the current page", () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, "ellipsis-end", 20]);
    expect(getPageItems(10, 20)).toEqual([
      1,
      "ellipsis-start",
      9,
      10,
      11,
      "ellipsis-end",
      20,
    ]);
    expect(getPageItems(20, 20)).toEqual([1, "ellipsis-start", 19, 20]);
  });
});
