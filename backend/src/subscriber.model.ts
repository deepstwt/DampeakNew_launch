import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * Email list signups.
 *
 * The unique index is what makes a repeat signup a no-op — Mongo enforces
 * nothing by itself, so without it the same address lands in the collection
 * as many times as someone presses the button.
 */
const SubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Where the signup came from, so we can tell the footer from a campaign.
    source: { type: String, default: "footer", trim: true },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type Subscriber = InferSchemaType<typeof SubscriberSchema>;

// Re-registering a model throws on Fast Refresh, so reuse an existing one.
export const SubscriberModel =
  (mongoose.models.Subscriber as mongoose.Model<Subscriber>) ??
  mongoose.model<Subscriber>("Subscriber", SubscriberSchema);
