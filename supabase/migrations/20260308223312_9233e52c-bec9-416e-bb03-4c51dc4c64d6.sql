
-- 1. Add unique constraint on profiles.username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username));

-- 2. Create function to get email by username for login
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email FROM auth.users u
  INNER JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(p.username) = lower(_username)
  LIMIT 1
$$;
