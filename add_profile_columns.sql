-- DDL to expand the profiles table to support dynamic council profiles
-- Execute these commands inside your Supabase Dashboard SQL Editor (https://supabase.com)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year text;

-- Add a comment on these columns for future reference
COMMENT ON COLUMN profiles.name IS 'Council member full name';
COMMENT ON COLUMN profiles.avatar_url IS 'Council member public profile photo URL';
COMMENT ON COLUMN profiles.phone IS 'Council member public phone number';
COMMENT ON COLUMN profiles.year IS 'Council member course & year (e.g. B.Pharm III Year)';
