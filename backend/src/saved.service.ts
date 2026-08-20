import { z } from "zod";
import { connectToDatabase } from "./db";
import { SavedProductModel } from "./saved.model";

export type SavedResult =
  | { ok: true; saved: boolean }
  | { ok: false; message: string };

/**
 * Slugs are the only thing a caller supplies, so they are validated here rather
 * than trusted. Kept deliberately narrow: lower-case letters, digits and hyphens
 * is the whole shape a slug ever has.
 */
const Slug = z
  .string()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9-]+$/, "That isn't a product slug.");

/** Duplicate key — the compound unique index did its job. */
const isDuplicate = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

/**
 * Saves or unsaves a product, returning the state it ended in.
 *
 * A toggle rather than separate add and remove calls: the button has two states
 * and the client should not have to know which one it is in to press it.
 */
export async function toggleSaved(
  userId: string,
  productSlug: unknown,
): Promise<SavedResult> {
  const parsed = Slug.safeParse(productSlug);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Bad request." };
  }

  try {
    await connectToDatabase();

    const removed = await SavedProductModel.findOneAndDelete({
      userId,
      productSlug: parsed.data,
    });
    if (removed) return { ok: true, saved: false };

    await SavedProductModel.create({ userId, productSlug: parsed.data });
    return { ok: true, saved: true };
  } catch (error) {
    // Two taps landed at once and the index rejected the second. The product is
    // saved either way, which is what the caller asked for.
    if (isDuplicate(error)) return { ok: true, saved: true };

    console.error("[saved] toggle failed:", error);
    return { ok: false, message: "We couldn't save that just now." };
  }
}

/** Every slug this user has saved, newest first. */
export async function listSaved(userId: string): Promise<string[]> {
  try {
    await connectToDatabase();
    const rows = await SavedProductModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("productSlug")
      .lean();
    return rows.map((r) => r.productSlug);
  } catch (error) {
    console.error("[saved] list failed:", error);
    return [];
  }
}
