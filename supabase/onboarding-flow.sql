-- Add a flag to the profiles table to track user onboarding completion.
-- This will default to FALSE for all new users.
ALTER TABLE public.profiles
ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- We can also set it to FALSE for all existing users who haven't been onboarded yet.
UPDATE public.profiles
SET has_completed_onboarding = FALSE
WHERE has_completed_onboarding IS NULL;
