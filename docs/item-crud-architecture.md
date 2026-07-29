# Item CRUD Architecture

Design for a unified create/read/update/delete system covering all 7 item types (snippet, prompt, command, note, link, file, image — see [item-types.md](item-types.md)). One code path per concern, type differences pushed to the edges (components + validation), matching the project's existing conventions (`coding-standards.md`: Server Components fetch via Prisma directly, Server Actions for mutations, `{ success, data, error }` result shape).

Nothing here exists yet — `src/app/items/`, `src/actions/items.ts`, and item-specific dialogs are all unbuilt. This is a plan to build against, informed by the patterns already established for auth (`src/actions/auth.ts`) and collections (`src/lib/db/collections.ts`, `src/components/dashboard/NewCollectionDialog.tsx`).

## Guiding principle

**One CRUD path, seven presentations.** All 7 types share one `Item` table, one set of mutations, one dynamic route, and one drawer shell. What differs per type is:
- which fields the create/edit form shows (`content`+`language` vs `url` vs file upload)
- how the content is *rendered* (syntax-highlighted code vs link preview vs file/image thumbnail)
- icon + accent color (already solved — `ItemType.icon`/`ItemType.color`, see `TypeIcon.tsx`)

None of that belongs in the mutation layer. A `createItem` action does not need a `switch (type)` — it validates against `contentType` (TEXT/URL/FILE) and writes generic columns. Type-specific behavior lives entirely in components that render or collect the right fields for the type they're given.

## File structure

```
src/
  actions/
    items.ts                 # createItem, updateItem, deleteItem, toggleFavorite, togglePinned
                              #   (mirrors src/actions/auth.ts / profile.ts: "use server",
                              #    Zod-validated, returns ActionResult)

  lib/
    db/
      items.ts                # EXISTS — extend with getItemById, getItemsByType, searchItems
    validations/
      items.ts                # NEW — Zod schemas per content kind (createSnippetSchema-style
                               #   base + discriminated union on contentType), mirrors
                               #   src/lib/validations/auth.ts

  app/
    items/
      [type]/
        page.tsx               # NEW — list view for one type, e.g. /items/snippets
        [id]/
          page.tsx              # NEW — direct link to a single item (also openable in drawer)

  components/
    dashboard/
      ItemRow.tsx               # EXISTS — generic row, type-agnostic (icon+color from itemType)
      items/
        ItemDrawer.tsx          # NEW — shell: header (title, type badge, favorite/pin, actions),
                                 #   delegates body to a per-content-kind renderer
        ItemContentView.tsx     # NEW — dispatch component: picks renderer by contentType
        TextContentView.tsx     # NEW — syntax-highlighted content + language badge
        UrlContentView.tsx      # NEW — link preview (favicon/domain) + "open" affordance
        FileContentView.tsx     # NEW — file/image thumbnail, filename, size, download link
        ItemForm.tsx             # NEW — dispatch component: picks fields by contentType
        TextItemFields.tsx       # NEW — content textarea/editor + language select
        UrlItemFields.tsx        # NEW — url input
        FileItemFields.tsx       # NEW — file upload input (Pro-gated)
        NewItemDialog.tsx        # NEW — wraps ItemForm, calls createItem action
        EditItemDialog.tsx       # NEW — wraps ItemForm, calls updateItem action
        DeleteItemDialog.tsx     # NEW — confirm + calls deleteItem action

  proxy.ts                      # EXISTS — matcher needs /items/:path* added alongside
                                 #   /dashboard/:path* once routes exist
```

This mirrors the existing split cleanly: `lib/db/*.ts` is read-only and called directly from Server Components (no action wrapper, same as `getPinnedItems`/`getRecentCollections` today); `actions/*.ts` is the only place that mutates, and it's organized by domain (`auth.ts`, `profile.ts`, and now `items.ts`) not by item type — there is no `actions/snippets.ts`, `actions/prompts.ts`, etc.

## Mutations: one action file, not seven

`src/actions/items.ts` exports generic, type-agnostic functions:

```ts
"use server";

interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createItem(input: CreateItemInput): Promise<ActionResult<{ id: string }>>
export async function updateItem(id: string, input: UpdateItemInput): Promise<ActionResult>
export async function deleteItem(id: string): Promise<ActionResult>
export async function toggleFavorite(id: string): Promise<ActionResult>
export async function togglePinned(id: string): Promise<ActionResult>
```

Each function:
1. Confirms `auth()` session, scopes every query by `userId` (ownership check doubles as the authz check — never trust an `id` from the client alone).
2. Validates `input` with a Zod schema from `lib/validations/items.ts`. The schema is a **discriminated union on `contentType`** (`TEXT` requires `content`, `URL` requires `url`, `FILE` requires `fileUrl`/`fileName`/`fileSize`) — this is where "type differences" are encoded structurally, not with conditionals scattered through the action body.
3. Writes through Prisma, `revalidatePath` the relevant `/items/[type]` and `/dashboard` routes.
4. Returns `{ success, data?, error }`, following the pattern in `src/actions/auth.ts`/`profile.ts` — never throws to the caller.

File-type items (file/image) need an upload step before `createItem` can run (R2 doesn't happen inside a Server Action's small payload budget well — per `coding-standards.md`, file uploads with progress belong in an **API route**, not a Server Action). So the real flow for file/image is: client uploads to `/api/upload` (route handler, not yet built) → gets back a `fileUrl`/`fileName`/`fileSize` → calls `createItem` with those already resolved. `createItem` itself never touches R2.

## Data fetching: `lib/db`, called directly

No action wrapper for reads. Server Components import from `lib/db/items.ts` directly, same as `dashboard/page.tsx` presumably does today via `getPinnedItems`/`getRecentItems`/`getSystemItemTypes`. Extend that file with:

```ts
export async function getItemsByType(userId: string, typeName: string): Promise<ItemWithType[]>
export async function getItemById(userId: string, id: string): Promise<ItemWithType | null>
export async function searchItems(userId: string, query: string): Promise<ItemWithType[]>
```

All scoped by `userId` in the `where` clause — there is no separate authorization layer, the query itself is the boundary (consistent with every existing `lib/db/*.ts` function).

## Routing: one dynamic route, not seven

Per the routing map in `project-overview.md` §7:

- **`/items/[type]`** — `type` is the `ItemType.name` (`"snippets"`, `"prompts"`, etc. — plural in the URL per the spec's own example `/items/snippets`). `page.tsx` resolves `type` → looks up the `ItemType` row (404 if unknown/not owned+not system), calls `getItemsByType`, and renders a list of `ItemRow`s — the exact same list component regardless of which type is being viewed. The page doesn't know or care that "snippet" needs a code preview and "link" needs a URL preview; `ItemRow` already renders type-agnostically off `itemType.icon`/`itemType.color`.
- **`/items/[type]/[id]`** — direct/shareable link to one item. Renders the same `ItemDrawer` content that opening an item from anywhere else (dashboard recents, collection view) would open, just as a full page instead of an overlay. This means `ItemDrawer`'s content should be a plain component usable both inside a `Dialog`/`Sheet` (drawer) and inlined into a page — no drawer-only state trapped in it.
- A single `[id]` handler, not one per type, because the dispatch on `contentType` happens *inside* `ItemContentView`, not at the routing layer.

No new route needs to exist per item type — adding an 8th system type (or, later, a Pro custom type) requires zero new routes, only a new branch in the two dispatch components below.

## Where type-specific logic lives: components, only components

Two narrow dispatch points carry all the type-awareness in the system; everything else (actions, db queries, routing) is generic:

1. **`ItemContentView`** (read path) — switches on `item.contentType` (not on `itemType.name` — there are only 3 content kinds, not 7, so `TextContentView` already covers snippet/prompt/command/note without four separate components):
   - `TEXT` → `TextContentView` (syntax highlighting via `language`)
   - `URL` → `UrlContentView` (link preview)
   - `FILE` → `FileContentView` (thumbnail/download) — differentiates image vs. generic file by `itemType.name === "image"` or MIME sniffing on `fileName`, purely a rendering choice
2. **`ItemForm`** (write path) — same dispatch, on `contentType` of the *target* type when creating (the type is chosen first, e.g. via the type picker in `NewItemDialog`, which then fixes `contentType` and swaps in `TextItemFields`/`UrlItemFields`/`FileItemFields`).

This keeps the type-specific surface area at **3 content-kind branches**, not 7 type branches — matching the schema's own `ContentType` enum rather than re-deriving per-type logic that the data model already collapsed. `TypeIcon`, `itemType.color`, and `itemType.name` remain the only truly per-type (not per-content-kind) values, and they're already handled generically by passing `itemType` as a prop wherever an icon/color/label is needed.

## Component responsibilities

| Component | Responsibility | Type-aware? |
|---|---|---|
| `ItemRow` | List-row summary (icon, color, title, description, pin/favorite, date) | No — reads `itemType.icon`/`color` as data |
| `ItemDrawer` | Shell: title, type badge, actions (favorite/pin/edit/delete), hosts content view | No |
| `ItemContentView` | Dispatch on `contentType` to the right renderer | Dispatch only |
| `TextContentView` / `UrlContentView` / `FileContentView` | Render one content kind | Yes (by content kind) |
| `ItemForm` | Dispatch on `contentType` to the right field set, shared title/description/tags fields | Dispatch only |
| `TextItemFields` / `UrlItemFields` / `FileItemFields` | Collect one content kind's fields | Yes (by content kind) |
| `NewItemDialog` / `EditItemDialog` | Wire `ItemForm` to `createItem`/`updateItem`, handle pending/error state | No |
| `DeleteItemDialog` | Confirm + call `deleteItem` | No |
| `/items/[type]/page.tsx` | Resolve type, fetch list, render `ItemRow`s | No (generic over type) |
| `/items/[type]/[id]/page.tsx` | Fetch one item, render `ItemDrawer` content inline | No |
| `actions/items.ts` | Auth check, Zod validate, Prisma write, revalidate | No (validated by schema, not branched) |
| `lib/db/items.ts` | Scoped Prisma reads | No |

## Summary

- **Mutations**: one file (`actions/items.ts`), one `ActionResult`-shaped function per operation, validated by a `contentType`-discriminated Zod union — never a per-type function.
- **Reads**: `lib/db/items.ts`, called directly from Server Components, no action wrapper — matches the existing `getPinnedItems`/`getRecentCollections` pattern.
- **Routing**: one dynamic segment (`/items/[type]`, `/items/[type]/[id]`), type resolved to an `ItemType` row at request time, not baked into the route tree.
- **Type-specific logic**: confined to two dispatch components (`ItemContentView`, `ItemForm`) branching on the 3-value `ContentType` enum, plus their child renderers/field-sets — everything else in the stack (actions, db, routing, list rows, dialogs' plumbing) is generic across all 7 types.
