-- Add multiple media support to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[];