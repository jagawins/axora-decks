-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid PRIMARY KEY,
  subscribed boolean NOT NULL DEFAULT false,
  tier text NOT NULL DEFAULT 'free',
  subscription_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_fk FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Deny anonymous access to subscriptions"
ON public.subscriptions
FOR SELECT
TO anon
USING (false);