-- Migration 002: User-owned bookmarks
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).
--
-- Prerequisites: Migration 001 must have been applied (bookmarks table exists).
-- This migration is idempotent — safe to run more than once.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add user_id column referencing auth.users
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE bookmarks
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Back-fill note: any existing rows will have user_id = NULL.
-- If you have existing data you want to keep, assign them to a specific user:
--   UPDATE bookmarks SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- Then make the column NOT NULL:
--   ALTER TABLE bookmarks ALTER COLUMN user_id SET NOT NULL;
-- For a clean slate you can simply truncate:
--   TRUNCATE TABLE bookmarks;
--   ALTER TABLE bookmarks ALTER COLUMN user_id SET NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Enable Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Force RLS even for the table owner (best practice — prevents accidental
-- data leakage when using the service-role key in future admin tooling).
ALTER TABLE bookmarks FORCE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS policies — users can only access their own rows
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop policies first so this script is re-runnable without conflicts.
DROP POLICY IF EXISTS "Users can select own bookmarks"  ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks"  ON bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks"  ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks"  ON bookmarks;

-- SELECT: only rows belonging to the authenticated user.
CREATE POLICY "Users can select own bookmarks"
  ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: the new row's user_id must match the authenticated user.
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: can only modify their own rows.
CREATE POLICY "Users can update own bookmarks"
  ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: can only remove their own rows.
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);
