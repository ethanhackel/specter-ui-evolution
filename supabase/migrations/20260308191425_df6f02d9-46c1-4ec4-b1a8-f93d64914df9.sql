-- Create a safe username lookup function (no ban fields exposed)
CREATE OR REPLACE FUNCTION public.get_username(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT username FROM public.profiles WHERE user_id = _user_id
$$;