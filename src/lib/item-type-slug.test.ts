import { describe, expect, it } from "vitest";

import { slugToTypeName, typeNameToSlug } from "./item-type-slug";

describe("typeNameToSlug", () => {
  it("pluralizes a singular type name", () => {
    expect(typeNameToSlug("snippet")).toBe("snippets");
  });

  it("leaves an already-plural name unchanged", () => {
    expect(typeNameToSlug("snippets")).toBe("snippets");
  });
});

describe("slugToTypeName", () => {
  it("singularizes a plural slug", () => {
    expect(slugToTypeName("snippets")).toBe("snippet");
  });

  it("leaves an already-singular slug unchanged", () => {
    expect(slugToTypeName("snippet")).toBe("snippet");
  });
});
