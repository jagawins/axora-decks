

# Persist Live Polls to Database

## Problem
Polls created in the Live Poll Creator are stored in local React state (`useState`). When the user navigates away and comes back, all polls are gone. There's no history, no results persistence.

## Solution
Persist polls to a new database table so they survive navigation, and load them on mount.

## Steps

### 1. Create `live_polls` database table
New migration with columns:
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users, not null)
- `type` (text — multiple-choice, yes-no, rating, qa, wordcloud, survey)
- `question` (text, not null)
- `options` (jsonb, nullable — array of strings for multiple-choice)
- `code` (text, unique, not null — the 6-char event code)
- `results` (jsonb, default '{}' — vote tallies)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())

RLS policies: authenticated users can CRUD their own polls (where `user_id = auth.uid()`). Deny anonymous SELECT.

### 2. Update `LivePollCreator.tsx`
- On mount: fetch polls from database (`SELECT * FROM live_polls WHERE user_id = auth.uid() ORDER BY created_at DESC`)
- On create: `INSERT` into `live_polls` instead of just pushing to local state
- On delete: `DELETE` from `live_polls`
- Results display: read from the `results` column
- Keep local state as a cache, synced with DB

### 3. Update `LivePollParticipant.tsx` (`/live/:code`)
- On mount: fetch poll by code from database (`SELECT * FROM live_polls WHERE code = :code`)
- On vote: update the `results` jsonb column (increment the chosen option's count)
- Need a permissive RLS policy allowing anonymous users to SELECT active polls by code and UPDATE results

### 4. Add anonymous voting RLS
- `SELECT` for anon: `is_active = true` (so participants can load the poll)
- `UPDATE` for anon on `results` column only — use a database function `increment_poll_vote(poll_code text, choice text)` as a security definer function to safely increment without exposing full update access

## Technical Details
- The `increment_poll_vote` function handles atomic JSON increment safely
- No need for realtime initially; poll results refresh on page load
- Existing mock data in `PollCard` will be replaced with actual DB data

