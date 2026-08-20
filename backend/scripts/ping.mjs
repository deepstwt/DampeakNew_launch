/**
 * Verifies MONGODB_URI actually connects, before anything depends on it.
 *
 *   npm run db:ping    (from the repo root)
 *
 * Worth having as its own command: a wrong connection string fails at request
 * time as a generic 500 inside a server action, which is a slow way to find out
 * you pasted the password placeholder or forgot to allowlist your IP.
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("✗ MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

if (uri.includes("USER:PASSWORD") || uri.includes("xxxxx")) {
  console.error("✗ MONGODB_URI still contains the example placeholders.");
  process.exit(1);
}

// Never print the password, whatever happens below.
const redacted = uri.replace(/\/\/[^@]*@/, "//***:***@");

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const { databases } = await db.admin().listDatabases();
  const collections = await db.listCollections().toArray();

  console.log(`✓ Connected to ${redacted}`);
  console.log(`  database:    ${db.databaseName}`);
  console.log(`  collections: ${collections.map((c) => c.name).join(", ") || "(none yet)"}`);
  console.log(`  visible dbs: ${databases.length}`);
  await mongoose.disconnect();
} catch (error) {
  console.error(`✗ Could not connect to ${redacted}`);
  console.error(`  ${error instanceof Error ? error.message : error}`);
  console.error("\n  Common causes:");
  console.error("   · your IP is not in Atlas → Network Access");
  console.error("   · the database user has no access to this database");
  console.error("   · the database name is missing before the \"?\" in the URI");
  process.exit(1);
}
