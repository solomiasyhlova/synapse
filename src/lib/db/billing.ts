import { prisma } from "@/lib/prisma";

export interface UserBilling {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export async function getUserBilling(userId: string): Promise<UserBilling | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
  });
}

export async function getUserByStripeCustomerId(customerId: string) {
  return prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
}

export async function setUserSubscription(
  userId: string,
  data: { isPro: boolean; stripeCustomerId?: string; stripeSubscriptionId?: string | null },
) {
  return prisma.user.update({ where: { id: userId }, data });
}
