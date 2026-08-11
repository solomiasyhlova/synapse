import { describe, expect, it } from "vitest";

import { appendTag, parseTagsInput } from "./tags";

describe("parseTagsInput", () => {
  it("splits a comma-separated string into trimmed tags", () => {
    expect(parseTagsInput("react, typescript ,  hooks")).toEqual(["react", "typescript", "hooks"]);
  });

  it("drops empty entries from stray commas", () => {
    expect(parseTagsInput("react,, ,typescript")).toEqual(["react", "typescript"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseTagsInput("")).toEqual([]);
    expect(parseTagsInput("   ")).toEqual([]);
  });
});

describe("appendTag", () => {
  it("appends a new tag to existing tags", () => {
    expect(appendTag("react, hooks", "typescript")).toBe("react, hooks, typescript");
  });

  it("appends to an empty tag string", () => {
    expect(appendTag("", "react")).toBe("react");
  });

  it("is a no-op when the tag already exists (case-insensitive)", () => {
    expect(appendTag("react, hooks", "React")).toBe("react, hooks");
    expect(appendTag("react, hooks", "react")).toBe("react, hooks");
  });
});
