import mongoose from "mongoose";

/**
 * Connection to MongoDB Atlas.
 *
 * The cache on globalThis is the important part. Next.js Fast Refresh in dev and
 * every serverless invocation in production would otherwise open a fresh pool,
 * and Atlas will hit its connection limit long before it hits any traffic limit.
 * This is the single most common way a Next + Atlas app falls over.
 */

const MONGODB_URI = process.env.MONGODB_URI;

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { _mongoose?: Cache };
const cached: Cache = (globalForMongoose._mongoose ??= { conn: null, promise: null });

export class MissingDatabaseUrl extends Error {
  constructor() {
    super("MONGODB_URI is not set");
    this.name = "MissingDatabaseUrl";
  }
}

export async function connectToDatabase() {
  if (!MONGODB_URI) throw new MissingDatabaseUrl();
  if (cached.conn) return cached.conn;

  cached.promise ??= mongoose.connect(MONGODB_URI, {
    // Each serverless instance gets its own pool; the default is far too high.
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    // Index building is a deploy-time job, not a request-time one.
    autoIndex: process.env.NODE_ENV !== "production",
  });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Don't cache a rejected promise — the next request should retry.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
