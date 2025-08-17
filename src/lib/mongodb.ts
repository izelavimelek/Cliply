import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = MongoClient.connect(uri, options);
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = MongoClient.connect(uri, options);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getMongoClient() {
  return await clientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || 'cliply');
}

// Database collections
export const Collections = {
  PROFILES: 'profiles',
  BRANDS: 'brands',
  CAMPAIGNS: 'campaigns',
  SUBMISSIONS: 'submissions',
  SNAPSHOTS: 'snapshots',
  PAYOUTS: 'payouts',
  WEBHOOKS: 'webhooks',
  AUDIT_LOGS: 'audit_logs',
} as const;
