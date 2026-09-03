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

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri as string);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

/** Raw MongoClient promise, required by @auth/mongodb-adapter. */
export const clientPromise = getClientPromise();

/** Cached Mongoose connection helper for use in app data models/routes. */
export async function dbConnect(): Promise<typeof mongoose> {
  if (!global._mongooseConnectionPromise) {
    global._mongooseConnectionPromise = mongoose.connect(uri as string);
  }
  return global._mongooseConnectionPromise;
}

export default dbConnect;
