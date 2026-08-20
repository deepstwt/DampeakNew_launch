"use server";

import { subscribe as subscribeToList } from "@oscar/backend";

export type SubscribeState = {
  status: "idle" | "ok" | "error";
  message: string;
};

/**
 * Thin adapter between the form and the backend package: turns FormData into a
 * plain object, and the result into something the UI can render. All validation
 * and persistence rules live in @oscar/backend.
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const result = await subscribeToList({
    email: formData.get("email"),
    company: formData.get("company") ?? "",
    source: "footer",
  });

  return result.ok
    ? { status: "ok", message: "You're on the list." }
    : { status: "error", message: result.message };
}
