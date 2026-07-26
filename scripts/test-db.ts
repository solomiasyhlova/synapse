import "dotenv/config";

import { prisma } from "@/lib/prisma";

async function main() {
  const [userCount, itemTypeCount, collectionCount, itemCount, tagCount] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.collection.count(),
    prisma.item.count(),
    prisma.tag.count(),
  ]);

  console.log("Connected to database successfully.");
  console.log({ userCount, itemTypeCount, collectionCount, itemCount, tagCount });

  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    include: {
      collections: {
        orderBy: { createdAt: "asc" },
        include: {
          items: {
            include: {
              item: { include: { itemType: true } },
            },
          },
        },
      },
    },
  });

  if (!demoUser) {
    console.log("\nNo demo user found — run `npm run db:seed` first.");
    return;
  }

  console.log(`\nDemo user: ${demoUser.name} <${demoUser.email}> (isPro: ${demoUser.isPro})`);

  for (const collection of demoUser.collections) {
    console.log(`\n${collection.name} — ${collection.description ?? "no description"}`);
    for (const { item } of collection.items) {
      console.log(`  [${item.itemType.name}] ${item.title}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Database connection test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
