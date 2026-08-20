/**
 * Public surface of the backend package.
 *
 * The front end imports from "@oscar/backend" and nothing else — never from a
 * file inside src/. Keeping one entry point is what makes it possible to lift
 * this package out into a standalone API service later without touching the UI.
 */
export { connectToDatabase, MissingDatabaseUrl } from "./db";
export { SubscriberModel, type Subscriber } from "./subscriber.model";
export { subscribe, type SubscribeResult, type SubscribeInput } from "./subscribe.service";
export { getAuth, isAuthConfigured, isAdminEmail } from "./auth";
export { SavedProductModel, type SavedProduct } from "./saved.model";
export { toggleSaved, listSaved, type SavedResult } from "./saved.service";
