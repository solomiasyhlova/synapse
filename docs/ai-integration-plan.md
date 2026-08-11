# AI Integration Plan — Google Gemini

Research for wiring the four Pro-only AI features from [project-overview.md §3F](../context/project-overview.md): auto-tag suggestions, AI summaries, "explain this code," and the prompt optimizer. Nothing AI-related exists in the codebase yet — `grep -r "gemini|genai" src/` returns no hits. `GEMINI_API_KEY` is already stubbed in `.env.example` but unused.

This is a plan to build against, not a build log. File paths under "Proposed files" don't exist yet.

---

## 0. Time-sensitive finding — read this before picking model IDs

The research brief's proposed primary model, **`gemini-2.5-flash-lite`, is scheduled to shut down on the Gemini Developer API on October 16, 2026** — about two months from today. Google's current live lineup (per its Aug 2026 model docs and blog) has two generations:

- **Gemini 3 family (frontier, current-gen):** `gemini-3.1-pro`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`
- **Gemini 2.5 family (previous-gen, cheaper fallback):** `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` — the Flash-Lite member is the one being retired

**Recommendation:** build against `gemini-3.5-flash-lite` (tagging/summaries) and `gemini-3.6-flash` (code explanation/prompt optimizer) instead of the 2.5 IDs named in the brief. Exact spelling and availability drift fast and my sources disagree on details (RPD figures especially) — **confirm both model IDs and their free-tier RPM/TPM/RPD in [Google AI Studio's rate-limit page](https://aistudio.google.com/rate-limit) immediately before writing the model-constants file**, not from this document. Centralize the IDs in one constants file (§5) specifically so a future forced migration is a one-line change.

---

## 1. SDK setup

Package: **`@google/genai`** (npm, `googleapis/js-genai` on GitHub) — this is the current SDK. The brief's warning is correct: `@google/generative-ai` (`GoogleGenerativeAI` / `getGenerativeModel`) is the deprecated predecessor and still shows up constantly in scraped tutorials and even in some web-search summaries — do not let it in.

```bash
npm install @google/genai
```

### Client module — `src/lib/ai/gemini-client.ts`

Follow the exact deferred-construction pattern already used for Stripe (`src/lib/stripe.ts`) — constructing eagerly at module scope would crash `next build` if `GEMINI_API_KEY` is unset in the build environment, since Next evaluates route modules during page-data collection even for routes never called:

```ts
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
  return client;
}
```

Server-only module — never import it from a `"use client"` file. No `NEXT_PUBLIC_` prefix on the key; it already lives correctly in `.env.example`/`.env.local` and needs adding to Vercel's env vars at deploy time.

### Basic call shape

```ts
const ai = getGeminiClient();

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: "...",
});
console.log(response.text);
```

### Streaming

```ts
const stream = await ai.models.generateContentStream({
  model: "gemini-3.6-flash",
  contents: "...",
});
for await (const chunk of stream) {
  // chunk.text — forward to the client as it arrives
}
```

---

## 2. Server action vs. route handler split

`coding-standards.md` already draws this line ("Use API routes when you need... long-running operations"; Server Actions otherwise). Applied to the four features:

| Feature | Model | Call shape | Handler type | Why |
|---|---|---|---|---|
| Auto-tag suggestions | `flash-lite` | `generateContent` (structured JSON, or embeddings — see §3) | Server Action | Single request/response, no incremental UI needed, fits the existing `{ success, data, error }` action pattern (`src/actions/items.ts`) |
| AI summary | `flash-lite` | `generateContent` | Server Action | Same — a summary is rendered whole, not token-by-token |
| Explain this code | `flash` (escalation) | `generateContentStream` | Route handler (`src/app/api/ai/explain-code/route.ts`) | Needs a `ReadableStream` response the client reads incrementally; Server Actions don't give you that in this stack (no Vercel AI SDK / RSC streaming primitives in use here) |
| Prompt optimizer | `flash` (escalation) | `generateContentStream` | Route handler (`src/app/api/ai/optimize-prompt/route.ts`) | Same streaming requirement |

Route handler skeleton (auth-checked the same way `/api/items/[id]/download` is):

```ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isPro) {
    return new Response("Pro required", { status: 403 });
  }
  const { code, language } = await req.json();

  const stream = await getGeminiClient().models.generateContentStream({
    model: AI_MODELS.reasoning,
    contents: buildExplainPrompt(code, language),
  });

  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    }),
  );
}
```

Client side reads it with a plain `fetch` + `response.body.getReader()` loop, appending chunks into local state — no extra library needed for this simple a case.

---

## 3. Auto-tagging: structured JSON vs. embeddings

Two real options, and they're not equivalent in cost or in what they can express:

### Option A — Structured-output LLM call

```ts
import { Type } from "@google/genai";

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: buildTaggingPrompt(item),
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["tags"],
    },
  },
});
const { tags } = JSON.parse(response.text);
```

`response.text` is guaranteed to validate against the schema — no markdown-fence stripping or `JSON.parse` guesswork. This is one full LLM call per item (or per batch, see §6), counted against RPM/TPM/RPD like any other call.

- **Pros:** works for free-form/dynamic tags (a user's own vocabulary, not a fixed list), no separate infra.
- **Cons:** burns a full generation call against the tightest quota tier (flash-lite), non-trivial latency (hundreds of ms–low seconds) even for something as small as tag suggestion.

### Option B — Embeddings + cosine similarity against a fixed tag set

```ts
const response = await ai.models.embedContent({
  model: "gemini-embedding-001", // supersedes the older text-embedding-004
  contents: [itemContentText],
  config: { outputDimensionality: 768 }, // Matryoshka truncation — cheaper storage, still strong quality
});
const vector = response.embeddings[0].values;
// cosine-similarity against precomputed vectors for each candidate tag, take top-N above a threshold
```

- **Pros:** far cheaper — embedding calls are smaller/cheaper than generation calls and typically sit under a separate, more generous quota; tag vectors for a fixed set can be precomputed once and cached in Postgres (or even hardcoded), so tagging an item at save-time can be a single embed call + in-process cosine math, no second network round trip per candidate tag.
- **Cons:** only works well against a **predefined, closed tag vocabulary**. `Tag` in this schema (`prisma/schema.prisma`) is fully free-form and user-scoped (`@@unique([userId, name])`) — there's no fixed set today. Embeddings could still work against *the user's own existing tags* (embed each of the user's current tags once, cache the vectors, compare new items against that per-user set) but can't suggest a brand-new tag the user has never used, which Option A can.

**Recommendation:** ship Option A (structured JSON) first since it matches the actual data model (open tag vocabulary) with zero new infrastructure, and it's explicitly the cheap model (`flash-lite`) doing a small, bounded-output task. Revisit Option B only if per-item tagging calls become the dominant share of quota usage once usage data exists — at that point, embedding against each user's *existing* tag set (not a global fixed one) is the natural migration, run only when a user already has enough tags for it to be worth it.

---

## 4. Fixed-set vs. open questions this doesn't resolve

Confirm before implementing: should auto-tag suggestions be shown as **accept/reject chips** the user approves before they're written (see §8), or written straight to the item? Given `Tag` is user-owned free text, auto-writing unreviewed AI tags risks polluting a user's tag vocabulary with near-duplicates (`"react"` vs `"React"` vs `"reactjs"`) — recommend accept/reject, not auto-write. This also naturally rate-limits how often the model actually gets called, since suggestions can be computed once and cached until the user acts.

---

## 5. Model routing — `src/lib/ai/models.ts`

```ts
export const AI_MODELS = {
  fast: "gemini-3.5-flash-lite",   // auto-tagging, summaries
  reasoning: "gemini-3.6-flash",   // code explanation, prompt optimizer
  embedding: "gemini-embedding-001",
} as const;
```

One file, one place to update when Google forces the next migration (see §0). Every call site imports from here — never hardcode a model string at a call site.

---

## 6. Rate limiting, queueing, and error handling

**The binding constraint on free tier is RPM/RPD, not dollars** — and critically, **that quota is per Google Cloud project, i.e. shared across every user of this app**, not per-user. A single popular free-tier user session doing rapid-fire tagging can exhaust the whole app's daily quota for everyone. This is a materially different rate-limiting problem than the existing `src/lib/rate-limit.ts`, which limits one *user* against one *action* (login attempts, password resets).

Needed: a second, app-wide limiter keyed by **model**, not by user, reusing the same Upstash Redis + `@upstash/ratelimit` infrastructure already configured (fails open if Upstash is unconfigured, matching the existing convention):

```ts
// src/lib/ai/rate-limit.ts
const fastLimiter = new Ratelimit({
  redis, // same Upstash client as src/lib/rate-limit.ts
  limiter: Ratelimit.slidingWindow(15, "60 s"), // match flash-lite's confirmed RPM
});
```

Behavior when a call would exceed the shared budget:
- **Tagging/summaries (deferred-tolerant):** queue in-process or reject with a "try again shortly" result the UI can silently retry — these aren't interactive, so a short delay is invisible.
- **Code explanation/prompt optimizer (interactive):** surface immediately — a toast saying the AI is at capacity, rather than hanging the streaming UI.

There's no discounted Batch API on the free tier (confirmed: the official rate-limits page's Batch API section only lists Tier 1+, nothing for Free) — "queueing" here means the app holding requests back to stay under RPM, not a cheaper batch endpoint.

**429 `RESOURCE_EXHAUSTED` handling:** the official SDKs retry transient 429s/5xx automatically, but a project-wide shared quota means a 429 is a real, expected outcome under load, not just a transient blip — don't just retry blindly. Recommended shape:

```ts
async function callWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxRetries || !isResourceExhausted(err)) throw err;
      const delay = 2 ** attempt * 500 + Math.random() * 250; // exponential + jitter
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
```

Respect a `Retry-After` header if the SDK surfaces one; fall back to exponential+jitter when it doesn't.

---

## 7. Cost/quota optimization

- **Batch multiple items per call where possible.** A `generateContent` call that tags 5 items at once (array-in, array-out via `responseSchema`) costs one RPM slot instead of five. Worth doing for any bulk-tagging entry point (e.g. a future "tag all untagged items" action); not worth the complexity for the single-item create/edit flow.
- **Route aggressively by task weight** — `flash-lite` for tagging/summaries, `flash` only for code explanation and prompt optimization where reasoning quality is the point. Never let a call site default to the heavier model "just in case."
- **Implicit context caching is free and automatic** for Gemini 2.5+ models (and presumably 3.x) on any tier, including free — no code required, it activates when repeated calls share a long static prefix (e.g. a fixed system-prompt/tag-schema preamble). The one thing that matters here is *keeping that preamble byte-for-byte identical across calls* so it actually hits the cache. **Explicit caching** (manually pinned, guaranteed-discount caching) requires a paid billing account for its storage cost — not relevant until this moves off the free tier.
- **Dedupe:** don't re-summarize/re-tag an item whose content hasn't changed since the last AI call — cache the result (a summary/tags-suggested-at column, or just compare content hashes) rather than recomputing on every drawer open.

---

## 8. Pro gating

Follows the existing `src/lib/usage-limits.ts` pattern exactly — a framework-free, unit-testable check with no DB/session imports:

```ts
// addition to src/lib/usage-limits.ts, or a sibling src/lib/ai/gating.ts
export function canUseAiFeature(isPro: boolean): UsageLimitResult {
  if (!isPro) {
    return { allowed: false, reason: "AI features are a Pro feature." };
  }
  return { allowed: true };
}
```

Enforce at **both** layers, same as the file/image type gate:
- **Server Action / route handler:** check `session.user.isPro` before calling Gemini at all — this is the real gate, since actions/routes are callable directly regardless of UI state (`billing.ts`'s `if (!session?.user)` check is the template).
- **UI:** hide/disable the AI trigger buttons for free users rather than letting them hit a rejection after clicking (matches the Files/Images `/upgrade` redirect pattern from the most recent feature, rather than an inline lock icon).

---

## 9. Fallback provider strategy

A provider-agnostic interface isolates every call site from which vendor actually served the request:

```ts
// src/lib/ai/provider.ts
export interface AiProvider {
  generateText(prompt: string, model: "fast" | "reasoning"): Promise<string>;
  generateJSON<T>(prompt: string, schema: unknown, model: "fast" | "reasoning"): Promise<T>;
}
```

`GeminiProvider` implements it against `@google/genai`; a `GroqProvider` implements it against Groq's OpenAI-compatible API as the fallback when Gemini's daily quota is exhausted (Groq's free tier: roughly 30 RPM / 6,000 TPM / 1,000 RPD on most models, no card required — confirm current figures before relying on them, same caveat as §0). A thin `getAiProvider()` picks Gemini first, catches a confirmed quota-exhaustion error, and falls through to Groq.

Scope this as a **later** enhancement, not part of the initial build — the four features should ship and prove out real usage patterns against Gemini alone first; adding a second vendor before there's quota-exhaustion data to justify it is premature.

---

## 10. UI patterns

- **Loading state:** a small inline spinner/skeleton in the drawer next to the triggering button (matches the existing `ItemDrawerActions` action-bar layout) rather than a full-drawer loading overlay — the rest of the item stays interactive.
- **Accept/reject suggestions (tags):** render suggested tags as togglable chips using the same visual pattern `CollectionSelect` already established for the collection picker — click to accept into the real tag list, dismiss to discard. Never auto-commit AI output without this step (§4).
- **Summaries:** render as plain text/markdown under a clearly-labeled "AI summary" section, with a manual re-generate action (respecting §7's dedupe-on-unchanged-content rule — re-generate should be an explicit override, not automatic).
- **Streaming (explain code / optimize prompt):** append chunks into a `MarkdownEditor`-style read-only panel as they arrive, matching the fluid-height/copy-button chrome already established by `CodeEditor`/`MarkdownEditor`. Show a stop/cancel control that aborts the `fetch` (`AbortController`) — a runaway stream shouldn't be left to finish once the user navigates away or closes the drawer.
- **Errors:** toast, matching every other action in the app (`{ success, data, error }` → toast on failure). A quota-exhausted rejection should read as "AI is busy right now, try again in a minute" — not a generic failure message — since it's an expected, recoverable state under this app's shared-quota model, not a bug.

---

## 11. Security & data privacy

- **API key:** server-only (`src/lib/ai/gemini-client.ts`), never `NEXT_PUBLIC_`, already correctly placed in `.env.example`/`.env.local`; add to Vercel env vars at deploy time. Never log full prompts/responses in a way that could leak into shared logs if they contain user content.
- **Input sanitization:** the traditional injection surfaces (SQL/XSS) don't directly apply to a text-in/text-out LLM call, but two things do matter:
  - **Prompt injection via item content:** a snippet/note's content is attacker-controllable if it's ever shared/imported from an untrusted source. Low real risk here since the model's output only ever populates tags/summaries/explanations shown back to the *same* user who owns the content — there's no cross-user or privileged-action surface an injected prompt could reach. Still, never feed raw item content into a prompt that also contains instructions capable of taking an action (e.g. don't combine "summarize this" with any prompt that could also trigger a tool-call/function-call side effect).
  - **Rendering AI output:** summaries/explanations should render through the same Markdown pipeline already in use (`react-markdown` + `remark-gfm` in `MarkdownEditor.tsx`), which already handles escaping — don't `dangerouslySetInnerHTML` raw model output.
  - **Size caps:** truncate item content before sending (e.g. cap snippet/note length fed into a prompt) — both to avoid TPM blowouts on a single call and because a pathologically large paste is more a cost/quota risk than a feature request.
- **Data privacy (free tier):** on Gemini's free tier, inputs and outputs **may be used by Google to improve its models** — this flips to opt-out only once billing is enabled on the project. This directly matters for this app's content model:
  - **Notes and Prompts** are exactly the item types most likely to contain private, sensitive, or proprietary content a user would not expect to leave their control — auto-tagging/summarizing these on the free tier means that content is sent to Google under those terms.
  - **Files** (Pro-gated, arbitrary user uploads) could contain anything, including third-party/employer code or documents the user doesn't have rights to send to a third party at all.
  - **Recommendation:** surface this plainly wherever an AI action is user-triggered (e.g. a one-line note near the first use of an AI feature, or in `/settings`), and treat AI actions as strictly **opt-in per click** — never run tagging/summarization automatically in the background on save, only when the user explicitly asks. This is already the natural consequence of the accept/reject UI in §10, not an extra mechanism. If/when the project moves to a paid Gemini tier, revisit — that removes the training-data concern entirely per Google's terms.

---

## Proposed files

```
src/lib/ai/gemini-client.ts     — deferred-construction singleton (§1)
src/lib/ai/models.ts            — AI_MODELS constants (§5)
src/lib/ai/provider.ts          — provider-agnostic interface + Gemini impl (§9, Groq deferred)
src/lib/ai/rate-limit.ts        — app-wide, model-keyed Upstash limiter (§6)
src/lib/ai/gating.ts            — canUseAiFeature (§8) — or fold into usage-limits.ts
src/actions/ai.ts               — suggestTags, summarizeItem (Server Actions)
src/app/api/ai/explain-code/route.ts     — streaming route handler
src/app/api/ai/optimize-prompt/route.ts  — streaming route handler
src/types/ai.ts                 — shared request/response types
```

## Sources

- [Google Gen AI JS SDK docs (js-genai)](https://github.com/googleapis/js-genai) — via Context7
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) — exact free-tier numbers require checking [AI Studio's live dashboard](https://aistudio.google.com/rate-limit), not published on this page
- [Gemini API structured output docs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini API embeddings docs](https://ai.google.dev/gemini-api/docs/embeddings)
- [Gemini API troubleshooting guide](https://ai.google.dev/gemini-api/docs/troubleshooting) (429 handling)
- [Gemini API context caching docs](https://ai.google.dev/gemini-api/docs/generate-content/caching)
- [Gemini model release notes / latest models](https://ai.google.dev/gemini-api/docs/changelog)
- Third-party 2026 rate-limit/pricing aggregators (aifreeapi.com, tokenmix.ai, aipromptshub.co) — cross-referenced for the 2.5-flash-lite retirement date and current-gen model names since Google's own pages don't publish free-tier numbers directly; **treat as directional, verify in AI Studio**
- `src/actions/billing.ts`, `src/lib/stripe.ts` — server action and deferred-client patterns followed above
- `src/lib/usage-limits.ts` — Pro-gating pattern followed in §8
- `src/lib/rate-limit.ts` — existing Upstash rate-limit infrastructure extended in §6
- `context/coding-standards.md` — Server Action vs. route handler split (§2)
