-- Add birthday column to user_profile table
-- Run this migration in your Supabase SQL editor

ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Optional: Migrate existing age data to approximate birthday
-- This sets birthday to January 1st of their birth year based on current age
-- Uncomment if you want to migrate existing data:

-- UPDATE user_profile
-- SET birthday = (CURRENT_DATE - (age * INTERVAL '1 year'))::date
-- WHERE age IS NOT NULL AND birthday IS NULL;
