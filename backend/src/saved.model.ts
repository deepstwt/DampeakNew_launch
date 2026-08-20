import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * A product someone has saved.
 *
 * One row per (user, product) rather than an array on the user: an array needs a
 * read-modify-write to add one item, and two taps in quick succession then race
 * each other with one overwriting the other. A row per pair makes saving an
 * insert, and the compound unique index makes a double-tap a no-op instead of a
 * duplicate.
 *
 * `productSlug` is stored rather than a product id because the catalogue lives in
 * code, not in this database. If a product is renamed its slug changes and the
 * stale row simply stops matching anything — which is the correct outcome, and
 * cheaper than a foreign key to a table that does not exist.
 */
const SavedProductSchema = new Schema(
  {
    // Better Auth's user id, as a string — its user collection is not a
    // mongoose model, so this cannot be a real ObjectId ref.
    userId: { type: String, required: true, index: true },
    productSlug: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Saving the same product twice is the same fact, not two facts.
SavedProductSchema.index({ userId: 1, productSlug: 1 }, { unique: true });

export type SavedProduct = InferSchemaType<typeof SavedProductSchema>;

// Re-registering a model throws on Fast Refresh, so reuse an existing one.
export const SavedProductModel =
  (mongoose.models.SavedProduct as mongoose.Model<SavedProduct>) ??
  mongoose.model<SavedProduct>("SavedProduct", SavedProductSchema);
