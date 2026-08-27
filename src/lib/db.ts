import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

// Re-use the pool across hot-reloads in development
const pool: Pool = global.__pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export default pool;
