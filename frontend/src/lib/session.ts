import { headers } from "next/headers";
import { getAuth, isAuthConfigured, isAdminEmail } from "@oscar/backend";

export type Viewer = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
};

/**
 * The signed-in user, or null.
 *
 * Reads the session on the server on every call — deliberately. Passing a user
 * object down from a layout would cache it into the static shell, and a page
 * rendered for one visitor would be served to the next.
 *
 * Returns null rather than throwing when auth is unconfigured, so every caller is
 * one `if` away from working in a fresh checkout.
 */
export async function getViewer(): Promise<Viewer | null> {
  if (!isAuthConfigured) return null;

  // headers() is read OUTSIDE the try on purpose. During static generation it
  // throws Next's DynamicServerError, which is a control-flow signal telling Next
  // the route must be dynamic — swallowing it in a catch hides that from the
  // framework and silently returns "signed out" at build time instead.
  const requestHeaders = await headers();

  try {
    const session = await getAuth().api.getSession({ headers: requestHeaders });
    if (!session?.user) return null;

    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      isAdmin: isAdminEmail(session.user.email),
    };
  } catch (error) {
    // A database that is down must not take the whole page with it. This only
    // covers the session read; the dynamic-rendering signal above is untouched.
    console.error("[session] could not read session:", error);
    return null;
  }
}
