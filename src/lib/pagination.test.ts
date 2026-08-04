import { describe, expect, it } from "vitest";

import { paginationSkip, toPaginatedResult } from "./pagination";

describe("paginationSkip", () => {
  it("returns 0 for the first page", () => {
    expect(paginationSkip(1, 21)).toBe(0);
  });

  it("skips a full page's worth of items per page", () => {
    expect(paginationSkip(2, 21)).toBe(21);
    expect(paginationSkip(3, 21)).toBe(42);
  });

  it("clamps pages below 1 to the first page", () => {
    expect(paginationSkip(0, 21)).toBe(0);
    expect(paginationSkip(-5, 21)).toBe(0);
  });
});

describe("toPaginatedResult", () => {
  it("computes totalPages by ceiling-dividing totalCount by perPage", () => {
    const result = toPaginatedResult(["a"], 43, 1, 21);

    expect(result).toEqual({ items: ["a"], page: 1, totalPages: 3, totalCount: 43 });
  });

  it("returns exactly 1 total page when there are no results", () => {
    const result = toPaginatedResult([], 0, 1, 21);

    expect(result.totalPages).toBe(1);
  });

  it("clamps a below-range page to 1", () => {
    const result = toPaginatedResult([], 0, -3, 21);

    expect(result.page).toBe(1);
  });
});
