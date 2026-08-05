import { neon } from '@neondatabase/serverless';

// Neon Serverless SQL Client
const databaseUrl = process.env.NEON_DATABASE_URL || process.env.NEON_DB_URL || '';

export const sql = databaseUrl ? neon(databaseUrl) : null;

export function isDbConnected(): boolean {
  return Boolean(sql);
}
