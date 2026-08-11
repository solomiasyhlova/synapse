import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: authMock }));

const generateContent = vi.fn();
vi.mock("@/lib/ai/gemini-client", () => ({
  AI_MODEL: "test-model",
  getGeminiClient: () => ({ models: { generateContent } }),
}));

const checkRateLimit = vi.fn();
const rateLimitMessage = vi.fn((reset: number) => `Rate limited until ${reset}`);
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit,
  rateLimitMessage,
  rateLimiters: { autoTag: {} },
}));

vi.mock("@google/genai", () => {
  class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }
  return { ApiError };
});

const { generateAutoTags } = await import("./ai");

function mockSession(overrides: { id?: string; isPro?: boolean } = {}) {
  authMock.mockResolvedValue({
    user: { id: overrides.id ?? "user-1", isPro: overrides.isPro ?? true },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockResolvedValue({ success: true, remaining: 10, reset: 0 });
});

describe("generateAutoTags", () => {
  it("rejects when not signed in", async () => {
    authMock.mockResolvedValue(null);

    const result = await generateAutoTags({ title: "Test", content: null });

    expect(result).toEqual({ success: false, error: "Not signed in" });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects free users", async () => {
    mockSession({ isPro: false });

    const result = await generateAutoTags({ title: "Test", content: null });

    expect(result).toEqual({ success: false, error: "AI tagging is a Pro feature" });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects invalid input", async () => {
    mockSession();

    const result = await generateAutoTags({ title: "", content: null });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Title is required");
  });

  it("rejects when the per-user rate limit is exceeded", async () => {
    mockSession();
    checkRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: 123 });

    const result = await generateAutoTags({ title: "Test", content: null });

    expect(rateLimitMessage).toHaveBeenCalledWith(123);
    expect(result).toEqual({ success: false, error: "Rate limited until 123" });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("parses a bare JSON array response and normalizes tags", async () => {
    mockSession();
    generateContent.mockResolvedValue({ text: JSON.stringify(["React", " TypeScript "]) });

    const result = await generateAutoTags({ title: "Test", content: "some content" });

    expect(result).toEqual({ success: true, data: ["react", "typescript"] });
  });

  it("parses a { tags: [...] } response shape", async () => {
    mockSession();
    generateContent.mockResolvedValue({ text: JSON.stringify({ tags: ["Node", "API"] }) });

    const result = await generateAutoTags({ title: "Test", content: null });

    expect(result).toEqual({ success: true, data: ["node", "api"] });
  });

  it("returns an error when the model returns no usable tags", async () => {
    mockSession();
    generateContent.mockResolvedValue({ text: "not json" });

    const result = await generateAutoTags({ title: "Test", content: null });

    expect(result).toEqual({ success: false, error: "No tag suggestions returned" });
  });

  it("surfaces a friendly message on a 429 quota error", async () => {
    mockSession();
    const { ApiError } = await import("@google/genai");
    generateContent.mockRejectedValue(new ApiError("quota exceeded", 429));

    const result = await generateAutoTags({ title: "Test", content: null });

    expect(result).toEqual({
      success: false,
      error: "AI is busy right now — try again in a minute.",
    });
  });

  it("truncates content sent to the model to 2000 characters", async () => {
    mockSession();
    generateContent.mockResolvedValue({ text: JSON.stringify(["tag"]) });

    await generateAutoTags({ title: "Test", content: "x".repeat(3000) });

    const call = generateContent.mock.calls[0]![0] as { contents: string };
    expect(call.contents).toContain("x".repeat(2000));
    expect(call.contents).not.toContain("x".repeat(2001));
  });
});
