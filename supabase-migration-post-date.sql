-- Run in Supabase SQL Editor

ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_date DATE DEFAULT CURRENT_DATE;

-- Backfill existing posts from their creation timestamp
UPDATE posts SET post_date = created_at::date WHERE post_date IS NULL;
