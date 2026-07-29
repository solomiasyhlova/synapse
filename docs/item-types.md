# Item Types

Synapse ships seven **system item types**. System types have `isSystem: true` and `userId: null` on `ItemType` — they cannot be edited or deleted by users (custom types are a later, Pro-only feature per the [project overview](../context/project-overview.md)).

Source of truth for the seeded values is `prisma/seed.ts` (`SYSTEM_TYPES` + `COLLECTIONS`), mirrored for the UI mock layer in `src/lib/mock-data.ts` (`itemTypes`). Icons are rendered via `src/components/dashboard/TypeIcon.tsx`, which maps an icon name string to a `lucide-react` component (falling back to `Circle` for unknown names).

## The seven types

| Type | Icon (lucide) | Color | Content kind | Availability |
|------|---------------|-------|--------------|--------------|
| Snippet | `Code` | `#3b82f6` (blue) | TEXT | Free |
| Prompt | `Sparkles` | `#8b5cf6` (purple) | TEXT | Free |
| Command | `Terminal` | `#f97316` (orange) | TEXT | Free |
| Note | `StickyNote` | `#fde047` (yellow) | TEXT | Free |
| Link | `Link` | `#10b981` (emerald) | URL | Free |
| File | `File` | `#6b7280` (gray) | FILE | **Pro** |
| Image | `Image` | `#ec4899` (pink) | FILE | **Pro** |

> Pro gating (File/Image) is defined in the spec (`context/project-overview.md`, §3/§9) but not yet enforced in code — during development all types are accessible to all users ("feature-flag everything" per §9).

### Snippet
- **Purpose**: reusable code — hooks, components, utility functions, config snippets.
- **Content kind**: TEXT (`contentType: "TEXT"`)
- **Key fields used**: `content` (the code), `language` (drives syntax highlighting, e.g. `typescript`, `tsx`, `python`, `dockerfile`)
- **Example seed items**: `useDebounce hook`, `Compound component pattern`, `Pandas groupby cheatsheet`

### Prompt
- **Purpose**: AI prompts / system messages / reusable instructions for LLMs.
- **Content kind**: TEXT
- **Key fields used**: `content` (the prompt text); `language` typically unset
- **Example seed items**: `Code review prompt`, `Documentation generator prompt`, `Refactoring assistant prompt`

### Command
- **Purpose**: shell/terminal one-liners and scripts.
- **Content kind**: TEXT
- **Key fields used**: `content` (the command), `language` (usually `"bash"`)
- **Example seed items**: `Deploy to production`, `Prune merged git branches`, `Find and kill process on port`

### Note
- **Purpose**: markdown notes, write-ups, reading notes.
- **Content kind**: TEXT
- **Key fields used**: `content` (markdown body); `language` unset
- **Example seed items**: `React Patterns reading notes`, `Dotfiles setup notes`, `System design — URL shortener`

### Link
- **Purpose**: bookmarked URLs (docs, articles, tools).
- **Content kind**: URL
- **Key fields used**: `url`; `content`/`language`/`fileUrl` are null
- **Example seed items**: `Docker documentation`, `Tailwind CSS documentation`, `Neon serverless Postgres docs`

### File — *Pro*
- **Purpose**: uploaded reference documents (specs, briefs) stored in Cloudflare R2.
- **Content kind**: FILE
- **Key fields used**: `fileUrl` (R2 URL), `fileName`, `fileSize`; `content`/`url` are null
- **Example seed items**: `Q3 product brief.pdf`, `API spec — payments service.md`

### Image — *Pro*
- **Purpose**: uploaded images (UI inspiration, screenshots) stored in Cloudflare R2.
- **Content kind**: FILE
- **Key fields used**: `fileUrl`, `fileName`, `fileSize`; `content`/`url` are null
- **Example seed items**: `UI inspiration — Linear dashboard`, `Dashboard card layout inspiration`

## Content-kind classification

Every `Item` has one `contentType` enum value (`prisma/schema.prisma`) that governs which fields are populated:

| `contentType` | Types using it | Populated fields | Null fields |
|---|---|---|---|
| `TEXT` | snippet, prompt, command, note | `content`, optionally `language` | `url`, `fileUrl`, `fileName`, `fileSize` |
| `URL` | link | `url` | `content`, `language`, `fileUrl`, `fileName`, `fileSize` |
| `FILE` | file, image | `fileUrl`, `fileName`, `fileSize` | `content`, `url`, `language` |

## Shared properties

All items, regardless of type, share:
- `title`, `description` (optional)
- `isFavorite`, `isPinned` (boolean flags, no per-type cap currently defined — open question in project-overview.md §11.8)
- `itemTypeId` → one `ItemType` (name, icon, color, isSystem)
- `tags` (many-to-many, user-scoped)
- `collections` (many-to-many via `ItemCollection`, tracks `addedAt`)
- `createdAt` / `updatedAt`

## Display differences

- **Icon + color** are per-`ItemType`, not hardcoded per item — `TypeIcon` resolves the icon name at render time and callers apply `type.color` directly as inline style (see `ItemRow.tsx`: left border and icon tinted with `type.color`, icon looked up via `TypeIcon name={type.icon}`).
- **Card border color** on item rows and item cards is the owning type's color (`border-l-2` styled with `style={{ borderLeftColor: type.color }}` in `ItemRow.tsx`).
- **Collection background color**: a collection's dominant/default item type drives its card background (per `project-overview.md` §10 layout notes); `Collection.defaultTypeId` stores this explicitly rather than being computed live.
- **Content preview** differs by content kind (not yet fully implemented in `ItemRow.tsx`, which currently only shows `title`/`description`/date):
  - TEXT types would show a syntax-highlighted snippet of `content` (using `language`)
  - URL types would show the `url` (and likely a favicon/domain)
  - FILE types would show a file-type icon/thumbnail using `fileName`/`fileUrl`
- **Pro badge**: file/image types are the only ones flagged Pro-only; UI should visually mark them as gated once enforcement lands (currently unenforced per §9's "feature-flag everything" directive).
