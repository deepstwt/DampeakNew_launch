import { z } from "zod";
import { connectToDatabase, MissingDatabaseUrl } from "./db";
import { SubscriberModel } from "./subscriber.model";

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unavailable" | "failed"; message: string };

const SubscribeInput = z.object({
  email: z.email("That email doesn't look right.").max(254),
  // Honeypot: bots fill hidden fields, people don't.
  company: z.string().max(0, "No thanks."),
  source: z.string().max(40).default("footer"),
});

export type SubscribeInput = z.input<typeof SubscribeInput>;

/** Duplicate key — the unique index on `email` did its job. */
const isDuplicate = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

/**
 * Adds an address to the email list.
 *
 * Validation lives here rather than in the UI layer so any future caller — an
 * HTTP route, a CLI import, a second front end — gets the same rules.
 */
export async function subscribe(input: unknown): Promise<SubscribeResult> {
  const parsed = SubscribeInput.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      message: parsed.error.issues[0]?.message ?? "Something went wrong.",
    };
  }

  try {
    await connectToDatabase();
    await SubscriberModel.create({
      email: parsed.data.email,
      source: parsed.data.source,
    });
    return { ok: true };
  } catch (error) {
    // Already subscribed. Report success — telling a stranger which addresses
    // are on the list is an enumeration leak.
    if (isDuplicate(error)) return { ok: true };

    if (error instanceof MissingDatabaseUrl) {
      console.error("[subscribe] MONGODB_URI is not set — signup not stored.");
      return {
        ok: false,
        reason: "unavailable",
        message: "Sign-up isn't connected yet. Try again shortly.",
      };
    }

    console.error("[subscribe] failed to store signup:", error);
    return {
      ok: false,
      reason: "failed",
      message: "We couldn't save that just now. Please try again.",
    };
  }
}
