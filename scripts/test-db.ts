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
}

main()
  .catch((error) => {
    console.error("Database connection test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
