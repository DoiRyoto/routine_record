import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
// Set timezone to JST for all connections
export const client = postgres(connectionString, {
  prepare: false,
  onnotice: () => {}, // Suppress notices
  connection: {
    timezone: 'Asia/Tokyo',
  },
});
export const db = drizzle(client, { schema });
