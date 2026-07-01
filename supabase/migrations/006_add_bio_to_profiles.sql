-- Add a bio column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
