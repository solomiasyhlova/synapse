import { describe, expect, it } from "vitest";

import { canCreateCollection, canCreateItem, isProOnlyType } from "./usage-limits";

describe("isProOnlyType", () => {
  it("returns true for file and image", () => {
    expect(isProOnlyType("file")).toBe(true);
    expect(isProOnlyType("image")).toBe(true);
  });

  it("returns false for snippet, prompt, command, note, and link", () => {
    expect(isProOnlyType("snippet")).toBe(false);
    expect(isProOnlyType("prompt")).toBe(false);
    expect(isProOnlyType("command")).toBe(false);
    expect(isProOnlyType("note")).toBe(false);
    expect(isProOnlyType("link")).toBe(false);
  });
});

describe("canCreateItem", () => {
  it("allows a free user under the item limit", () => {
    const result = canCreateItem(false, 49, "snippet");
    expect(result.allowed).toBe(true);
  });

  it("rejects a free user at the item limit with a reason", () => {
    const result = canCreateItem(false, 50, "snippet");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("allows a pro user at or over the item limit", () => {
    expect(canCreateItem(true, 50, "snippet").allowed).toBe(true);
    expect(canCreateItem(true, 200, "snippet").allowed).toBe(true);
  });

  it("rejects a free user under the item limit for a pro-only type, with a reason", () => {
    const result = canCreateItem(false, 0, "file");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("allows a pro user to create a pro-only type item", () => {
    expect(canCreateItem(true, 0, "file").allowed).toBe(true);
    expect(canCreateItem(true, 0, "image").allowed).toBe(true);
  });
});

describe("canCreateCollection", () => {
  it("allows a free user under the collection limit", () => {
    const result = canCreateCollection(false, 2);
    expect(result.allowed).toBe(true);
  });

  it("rejects a free user at the collection limit with a reason", () => {
    const result = canCreateCollection(false, 3);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("allows a pro user at or over the collection limit", () => {
    expect(canCreateCollection(true, 3).allowed).toBe(true);
    expect(canCreateCollection(true, 10).allowed).toBe(true);
  });
});
