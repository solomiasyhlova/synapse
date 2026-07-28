import "dotenv/config";

import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demoUser) {
    console.error(`No user found with email ${DEMO_EMAIL} — aborting to avoid wiping everyone.`);
    process.exitCode = 1;
    return;
  }

  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: {
      id: true,
      email: true,
      _count: { select: { items: true, collections: true, tags: true } },
    },
  });

  if (usersToDelete.length === 0) {
    console.log("No non-demo users to delete.");
    return;
  }

  console.log(`About to delete ${usersToDelete.length} user(s) and all their content:`);
  for (const user of usersToDelete) {
    console.log(
      `  - ${user.email}: ${user._count.items} item(s), ${user._count.collections} collection(s), ${user._count.tags} tag(s)`
    );
  }

  const confirmed = process.argv.includes("--confirm");
  if (!confirmed) {
    console.log("\nDry run only — re-run with --confirm to actually delete.");
    return;
  }

  const { count } = await prisma.user.deleteMany({
    where: { email: { not: DEMO_EMAIL } },
  });

  console.log(`\nDeleted ${count} user(s). Cascade removed their items, collections, tags, and custom types.`);
}

main()
  .catch((error) => {
    console.error("Failed to delete users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
