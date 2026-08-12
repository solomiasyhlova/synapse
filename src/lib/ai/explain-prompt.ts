// Framework-free so it's directly unit-testable without mocking the route
// handler's auth/Gemini/rate-limit imports.
const MAX_CONTENT_LENGTH = 4000;

export function buildExplainPrompt(title: string, content: string, language: string | null): string {
  const languageLine = language ? `Language: ${language}\n` : "";
  const truncatedContent = content.slice(0, MAX_CONTENT_LENGTH);
  return `Title: ${title}\n${languageLine}\nContent:\n${truncatedContent}`;
}
