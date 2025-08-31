// Database connection and configuration
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
export const db = drizzle(client);

export default db;