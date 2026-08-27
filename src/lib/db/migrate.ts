import pool from "@/lib/db";

async function migrate() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS bookmarks (
      id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      title        TEXT        NOT NULL,
      description  TEXT,
      url          TEXT,
      code_snippet TEXT,
      language     TEXT,
      tags         TEXT[]      NOT NULL DEFAULT '{}',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log("Migration complete — bookmarks table ready.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
