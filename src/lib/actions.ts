import { ZodError } from "zod";

import { auth } from "@/auth";
import type { ActionResult } from "@/types/actions";

export class ActionAuthError extends Error {
  constructor(message = "Not signed in") {
    super(message);
    this.name = "ActionAuthError";
  }
}

/** Resolves the current session or throws, for use inside a Server Action's try/catch. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new ActionAuthError();
  return session;
}

export function zodErrorMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}

/** Standard catch-block handler for Server Actions: Zod/auth errors get their message, everything else is logged and genericized. */
export function handleActionError(error: unknown, context: string): ActionResult<never> {
  if (error instanceof ZodError) {
    return { success: false, error: zodErrorMessage(error) };
  }
  if (error instanceof ActionAuthError) {
    return { success: false, error: error.message };
  }
  console.error(context, error);
  return { success: false, error: "Something went wrong. Please try again." };
}
