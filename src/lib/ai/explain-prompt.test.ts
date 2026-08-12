import { describe, expect, it } from "vitest";

import { buildExplainPrompt } from "./explain-prompt";

describe("buildExplainPrompt", () => {
  it("includes title, language, and content", () => {
    const prompt = buildExplainPrompt("Quick sort", "def quicksort(arr): ...", "python");

    expect(prompt).toContain("Title: Quick sort");
    expect(prompt).toContain("Language: python");
    expect(prompt).toContain("def quicksort(arr): ...");
  });

  it("omits the language line when language is null", () => {
    const prompt = buildExplainPrompt("Deploy script", "npm run build && npm run deploy", null);

    expect(prompt).not.toContain("Language:");
    expect(prompt).toContain("npm run build && npm run deploy");
  });

  it("truncates content past the max length", () => {
    const longContent = "x".repeat(5000);
    const prompt = buildExplainPrompt("Big file", longContent, null);

    expect(prompt.length).toBeLessThan(longContent.length + 100);
    expect(prompt).toContain("x".repeat(4000));
    expect(prompt).not.toContain("x".repeat(4001));
  });
});
