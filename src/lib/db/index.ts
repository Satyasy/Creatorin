import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  let connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    return null;
  }

  connectionString = connectionString.replace(/^["']|["']$/g, '');

  if (!dbInstance) {
    const isLocal = connectionString.includes("127.0.0.1") || connectionString.includes("localhost");
    const client = postgres(connectionString, {
      prepare: false,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      connect_timeout: 10,
    });
    dbInstance = drizzle(client, { schema });
  }

  return dbInstance;
}

export const db = getDb();
export * from "./schema";
