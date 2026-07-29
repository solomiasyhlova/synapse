import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
  });
}

export const rateLimiters = {
  login: createLimiter(5, "15 m", "login"),
  register: createLimiter(3, "1 h", "register"),
  forgotPassword: createLimiter(3, "1 h", "forgot-password"),
  resetPassword: createLimiter(5, "15 m", "reset-password"),
  resendVerification: createLimiter(3, "15 m", "resend-verification"),
};

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Checks a rate limiter and fails open (allows the request) if Upstash isn't
 * configured or the request to it fails, so an outage never locks users out.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, remaining: 0, reset: 0 };
  }

  try {
    const { success, remaining, reset } = await limiter.limit(identifier);
    return { success, remaining, reset };
  } catch (error) {
    console.error("Rate limit check failed, failing open:", error);
    return { success: true, remaining: 0, reset: 0 };
  }
}

export function getClientIp(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return requestHeaders.get("x-real-ip") ?? "unknown";
}

export function rateLimitMessage(reset: number): string {
  const minutes = Math.max(1, Math.ceil((reset - Date.now()) / 60_000));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
