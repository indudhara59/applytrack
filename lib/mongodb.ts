import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing required environment variable: MONGODB_URI");
}

/**
 * Both the raw MongoClient (used by the Auth.js MongoDB adapter) and the
 * Mongoose connection are cached on `globalThis` so hot reloads in dev and
 * concurrent serverless invocations in production reuse the same
 * connection instead of opening a new one per request.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

/**
 * Returns the cached MongoClient connection. If a previous attempt failed,
 * the cache is cleared so the next call retries a fresh connection instead
 * of staying stuck on the same rejected promise for the rest of a warm
 * serverless container's lifetime.
 */
export function getMongoClient(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri as string);
    global._mongoClientPromise = client.connect().catch((error) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }
  return global._mongoClientPromise;
}

/**
 * Raw MongoClient promise, required by @auth/mongodb-adapter (its API takes
 * a Promise value, not a getter, so this snapshot is taken once at module
 * load — same retry caveat as any single call to getMongoClient()). Use
 * getMongoClient() instead everywhere else, since a fresh call re-checks
 * the cache and can recover from a prior failure.
 */
export const clientPromise = getMongoClient();

/**
 * Cached Mongoose connection helper for use in app data models/routes. Same
 * retry-on-failure behavior as getMongoClient() above.
 */
export async function dbConnect(): Promise<typeof mongoose> {
  if (!global._mongooseConnectionPromise) {
    global._mongooseConnectionPromise = mongoose.connect(uri as string).catch((error) => {
      global._mongooseConnectionPromise = undefined;
      throw error;
    });
  }
  return global._mongooseConnectionPromise;
}

export default dbConnect;
