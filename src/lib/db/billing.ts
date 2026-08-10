import { prisma } from "@/lib/prisma";

export interface UserBilling {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

export async function getUserBilling(userId: string): Promise<UserBilling | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
    },
  });
}

export interface UsageCounts {
  itemCount: number;
  collectionCount: number;
}

export async function getUsageCounts(userId: string): Promise<UsageCounts> {
  const [itemCount, collectionCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  return { itemCount, collectionCount };
}

export async function getUserByStripeCustomerId(customerId: string) {
  return prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
}

export async function setUserSubscription(
  userId: string,
  data: {
    isPro: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    stripeCurrentPeriodEnd?: Date | null;
  },
) {
  return prisma.user.update({ where: { id: userId }, data });
}
