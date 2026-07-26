import "dotenv/config";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { ContentType } from "@/generated/prisma/client";

const SYSTEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "link", icon: "Link", color: "#10b981" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
] as const;

type SeedItem = {
  title: string;
  description?: string;
  contentType: ContentType;
  content?: string;
  url?: string;
  language?: string;
  typeName: (typeof SYSTEM_TYPES)[number]["name"];
};

type SeedCollection = {
  name: string;
  description: string;
  items: SeedItem[];
};

const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        title: "useDebounce hook",
        description: "Delays updating a value until the input stops changing.",
        contentType: "TEXT",
        language: "typescript",
        typeName: "snippet",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}`,
      },
      {
        title: "useLocalStorage hook",
        description: "Syncs component state with localStorage.",
        contentType: "TEXT",
        language: "typescript",
        typeName: "snippet",
        content: `import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
      {
        title: "Compound component pattern",
        description: "Sharing implicit state between related components via context.",
        contentType: "TEXT",
        language: "tsx",
        typeName: "snippet",
        content: `import { createContext, useContext, useState } from "react";

const TabsContext = createContext<{
  active: string;
  setActive: (value: string) => void;
} | null>(null);

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

export function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab must be used within Tabs");
  return (
    <button data-active={ctx.active === value} onClick={() => ctx.setActive(value)}>
      {children}
    </button>
  );
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code review prompt",
        description: "Strict, security-focused code review persona.",
        contentType: "TEXT",
        typeName: "prompt",
        content: `You are a senior engineer performing a thorough code review. For the diff provided:

1. Flag correctness issues, edge cases, and security vulnerabilities first.
2. Note performance concerns (N+1 queries, unnecessary re-renders, unbounded loops).
3. Check that naming, error handling, and patterns match the rest of the codebase.
4. Keep feedback specific — cite file and line — and skip nitpicks that don't change behavior.`,
      },
      {
        title: "Documentation generator prompt",
        description: "Turns a function or module into clear reference docs.",
        contentType: "TEXT",
        typeName: "prompt",
        content: `Given the following code, write concise reference documentation:

- One-sentence summary of what it does.
- Parameters/props with types and whether they're required.
- Return value or emitted events.
- One realistic usage example.

Avoid restating the code line-by-line — focus on intent and constraints a caller needs to know.`,
      },
      {
        title: "Refactoring assistant prompt",
        description: "Suggests a minimal, behavior-preserving refactor.",
        contentType: "TEXT",
        typeName: "prompt",
        content: `Review the following code for refactoring opportunities. Suggest changes that:

- Reduce duplication without adding premature abstraction.
- Improve naming and readability.
- Preserve existing behavior exactly — call out anywhere you're unsure.

Present the refactor as a diff with a one-line reason for each change.`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Multi-stage Dockerfile for Next.js",
        description: "Production image build with dependency caching.",
        contentType: "TEXT",
        language: "dockerfile",
        typeName: "snippet",
        content: `FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        title: "Deploy to production",
        description: "Runs pending migrations, then deploys the app.",
        contentType: "TEXT",
        language: "bash",
        typeName: "command",
        content: `npm run db:deploy && npm run build && pm2 restart app`,
      },
      {
        title: "Docker documentation",
        contentType: "URL",
        typeName: "link",
        url: "https://docs.docker.com/",
      },
      {
        title: "GitHub Actions documentation",
        contentType: "URL",
        typeName: "link",
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Prune merged git branches",
        description: "Removes local branches already merged into main.",
        contentType: "TEXT",
        language: "bash",
        typeName: "command",
        content: `git branch --merged main | grep -v 'main' | xargs -r git branch -d`,
      },
      {
        title: "Remove dangling Docker images",
        description: "Frees disk space from unused build layers.",
        contentType: "TEXT",
        language: "bash",
        typeName: "command",
        content: `docker image prune -f && docker container prune -f`,
      },
      {
        title: "Find and kill process on port",
        description: "Kills whatever process is bound to a given port.",
        contentType: "TEXT",
        language: "bash",
        typeName: "command",
        content: `lsof -ti tcp:3000 | xargs kill -9`,
      },
      {
        title: "List outdated npm packages",
        description: "Shows installed vs. latest version for every dependency.",
        contentType: "TEXT",
        language: "bash",
        typeName: "command",
        content: `npm outdated --long`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS documentation",
        contentType: "URL",
        typeName: "link",
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui component library",
        contentType: "URL",
        typeName: "link",
        url: "https://ui.shadcn.com/",
      },
      {
        title: "Radix UI design system primitives",
        contentType: "URL",
        typeName: "link",
        url: "https://www.radix-ui.com/primitives",
      },
      {
        title: "Lucide icon library",
        contentType: "URL",
        typeName: "link",
        url: "https://lucide.dev/",
      },
    ],
  },
];

async function seedSystemTypes() {
  const typesByName = new Map<string, string>();

  for (const type of SYSTEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { userId: null, name: type.name },
    });

    const record = existing
      ? await prisma.itemType.update({
          where: { id: existing.id },
          data: { icon: type.icon, color: type.color, isSystem: true },
        })
      : await prisma.itemType.create({
          data: { ...type, isSystem: true, userId: null },
        });

    typesByName.set(type.name, record.id);
  }

  console.log(`Seeded ${SYSTEM_TYPES.length} system item types.`);
  return typesByName;
}

async function seedDemoUser() {
  const passwordHash = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded demo user (${user.email}).`);
  return user;
}

async function seedCollections(userId: string, typesByName: Map<string, string>) {
  for (const collection of COLLECTIONS) {
    const defaultTypeId = typesByName.get(collection.items[0].typeName);

    const existingCollection = await prisma.collection.findFirst({
      where: { userId, name: collection.name },
    });

    const collectionRecord = existingCollection
      ? await prisma.collection.update({
          where: { id: existingCollection.id },
          data: { description: collection.description, defaultTypeId },
        })
      : await prisma.collection.create({
          data: {
            userId,
            name: collection.name,
            description: collection.description,
            defaultTypeId,
          },
        });

    for (const item of collection.items) {
      const itemTypeId = typesByName.get(item.typeName);
      if (!itemTypeId) throw new Error(`Unknown item type: ${item.typeName}`);

      const existing = await prisma.item.findFirst({
        where: { userId, title: item.title },
      });

      const itemRecord = existing
        ? await prisma.item.update({
            where: { id: existing.id },
            data: {
              description: item.description,
              contentType: item.contentType,
              content: item.content,
              url: item.url,
              language: item.language,
              itemTypeId,
            },
          })
        : await prisma.item.create({
            data: {
              userId,
              title: item.title,
              description: item.description,
              contentType: item.contentType,
              content: item.content,
              url: item.url,
              language: item.language,
              itemTypeId,
            },
          });

      await prisma.itemCollection.upsert({
        where: {
          itemId_collectionId: { itemId: itemRecord.id, collectionId: collectionRecord.id },
        },
        update: {},
        create: { itemId: itemRecord.id, collectionId: collectionRecord.id },
      });
    }

    console.log(`Seeded collection "${collection.name}" with ${collection.items.length} items.`);
  }
}

async function main() {
  const typesByName = await seedSystemTypes();
  const user = await seedDemoUser();
  await seedCollections(user.id, typesByName);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
