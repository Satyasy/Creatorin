import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (!dbInstance) {
    // Disable prefetch for transaction poolers / serverless
    const client = postgres(connectionString, { prepare: false });
    dbInstance = drizzle(client, { schema });
  }

  return dbInstance;
}

export const db = getDb();
export * from "./schema";
