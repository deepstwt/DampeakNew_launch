/**
 * Creates the indexes the models declare. Run once per deploy.
 * autoIndex is off in production, so without this the unique constraint on
 * `email` simply does not exist and duplicates get in silently.
 *
 *   npm run db:indexes    (from the repo root)
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const Subscriber = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/**
 * Saved products. The compound unique index is what makes a double-tap a no-op
 * instead of two rows — without it, autoIndex being off in production means the
 * constraint silently does not exist.
 */
const SavedProduct = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    productSlug: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
SavedProduct.index({ userId: 1, productSlug: 1 }, { unique: true });

await mongoose.connect(uri);

for (const [name, schema] of [
  ["Subscriber", Subscriber],
  ["SavedProduct", SavedProduct],
]) {
  const model = mongoose.model(name, schema);
  await model.syncIndexes();
  const names = (await model.listIndexes()).map((i) => i.name).join(", ");
  console.log(`${name}: ${names}`);
}

await mongoose.disconnect();
