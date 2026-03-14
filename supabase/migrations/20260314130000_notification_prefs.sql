-- Add notification preferences column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"deckShared": true, "comments": true, "weeklyDigest": false, "productUpdates": true, "tipsAndTricks": false}'::jsonb;
