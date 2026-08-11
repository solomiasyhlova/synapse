// Curated language list for the snippet/command language dropdown. Values are
// Monaco language ids (see CodeEditor.tsx's toMonacoLanguage) so selecting one
// drives syntax highlighting directly with no extra mapping step.
export const LANGUAGE_OPTIONS = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "shell", label: "Shell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
] as const;

export const DEFAULT_LANGUAGE = "plaintext";

// Capitalized display label for a language value — looks up the curated list first
// (for correct casing like "JavaScript" or "C#"), falling back to capitalizing
// free-text values that predate the dropdown.
export function getLanguageLabel(language?: string | null) {
  if (!language) return "";
  const normalized = language.trim().toLowerCase();
  const known = LANGUAGE_OPTIONS.find((option) => option.value === normalized);
  if (known) return known.label;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
