# Synapse

> One fast, searchable, AI-enhanced hub for everything a developer keeps scattered: snippets, prompts, notes, commands, links, and files.

**Live demo:** [synapse-gules-six.vercel.app](https://synapse-gules-six.vercel.app)

---

## About

Developers keep their essentials scattered across too many tools — snippets in VS Code or Notion, prompts buried in chat histories, commands in `.txt` files, useful links in browser bookmarks, templates in GitHub Gists. The result is constant context switching and lost knowledge. **Synapse consolidates all of it into a single, fast, searchable hub.**

## Features

### Items & Item Types

Every piece of saved knowledge is an **item** of a given type. Each type resolves to one of three content kinds: **text** (markdown), **URL**, or **file**.

| Type | Content kind | Availability |
|------|--------------|--------------|
| Snippet | text | Free |
| Prompt | text | Free |
| Note | text (markdown) | Free |
| Command | text | Free |
| Link | url | Free |
| File | file | Pro |
| Image | file | Pro |

### Collections

Create collections that hold items of any type. A single item can belong to **multiple collections** at once — e.g. a React snippet living in both *React Patterns* and *Interview Prep*.

### Search

Powerful search across content, tags, titles, and types — implemented as a **Cmd+K / Ctrl+K command palette** available app-wide.

### Authentication

Email/password **or** GitHub sign-in, powered by Auth.js v5.

### Quality of Life

- Favorite items and collections
- Pin items to the top
- Recently used
- Import code from a file
- Markdown editor for text types
- File uploads for file/image types
- Export data in multiple formats
- Dark mode by default

### AI Features *(Pro)*

Powered by **Google Gemini**:

- AI auto-tag suggestions
- AI summaries
- "Explain this code"
- Prompt optimizer

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) · [React 19](https://react.dev) · TypeScript |
| Database & ORM | [Neon](https://neon.tech) (serverless PostgreSQL) · [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| Authentication | [Auth.js v5](https://authjs.dev) (email/password + GitHub OAuth) |
| File Storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible) |
| AI | [Google Gemini](https://ai.google.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Payments | [Stripe](https://stripe.com) (freemium subscriptions) |
| Caching / Rate limiting | [Upstash Redis](https://upstash.com) |
| Testing | [Vitest](https://vitest.dev) |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- Accounts/keys for Cloudflare R2, Google Gemini, and Stripe (for full functionality)

### Installation

```bash
# Clone the repository
git clone https://github.com/solomiasyhlova/synapse.git
cd synapse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# then fill in the values in .env
```

### Database Setup

```bash
# Generate the Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

> **Migration rule:** every schema change goes through a migration (`npm run db:migrate`) — never `prisma db push`. Run in dev first, then production.

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite (Vitest) |
| `npm run db:migrate` | Create and apply a migration (dev) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |

## Architecture

A single repository / single codebase built on Next.js:

- **SSR pages** with Server Components by default
- **Route handlers & server actions** for items, file uploads, and AI calls
- Data lives in **Neon Postgres** via Prisma; files are stored in **Cloudflare R2**

```
Browser (React 19 UI)
        │
   Next.js 16  ──►  Auth.js v5  ──►  Neon Postgres (Prisma 7)
        │                                    ▲
        └──►  Route handlers  ──►  Cloudflare R2 / Gemini / Stripe / Redis
```

## Pricing

| | Free | Pro — $8/mo or $72/yr |
|---|---|---|
| Items | 50 total | Unlimited |
| Collections | 3 | Unlimited |
| File & image uploads | ❌ | ✅ |
| Search | Basic | Full |
| AI features | ❌ | ✅ |
| Export | ❌ | ✅ |

## License

This project was built for learning and portfolio purposes.
