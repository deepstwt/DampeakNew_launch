"use server";

import { revalidatePath } from "next/cache";
import { toggleSaved, listSaved } from "@oscar/backend";
import { getViewer } from "@/lib/session";

export type ToggleSavedResult =
  | { ok: true; saved: boolean }
  | { ok: false; reason: "signed-out" | "failed"; message: string };

/**
 * Saves or unsaves a product for the signed-in user.
 *
 * The user id comes from the session on the server and is never accepted as an
 * argument — a client that could name the user it is saving for could save
 * things into somebody else's account.
 */
export async function toggleSavedAction(
  productSlug: string,
): Promise<ToggleSavedResult> {
  const viewer = await getViewer();

  if (!viewer) {
    return {
      ok: false,
      reason: "signed-out",
      message: "Sign in to save products.",
    };
  }

  const result = await toggleSaved(viewer.id, productSlug);
  if (!result.ok) return { ok: false, reason: "failed", message: result.message };

  // The account page lists these, so its cached copy is now wrong.
  revalidatePath("/account");
  return { ok: true, saved: result.saved };
}

/**
 * Whether the signed-in visitor has saved this product.
 *
 * Exists so a product page does not have to read the session to draw the Save
 * button. Reading it server-side means calling headers(), which makes the route
 * dynamic — and these four product pages are otherwise fully static. Asking from
 * the client costs one small request and keeps the pages prerendered.
 */
export async function isSavedAction(productSlug: string): Promise<boolean> {
  const viewer = await getViewer();
  if (!viewer) return false;
  return (await listSaved(viewer.id)).includes(productSlug);
}
