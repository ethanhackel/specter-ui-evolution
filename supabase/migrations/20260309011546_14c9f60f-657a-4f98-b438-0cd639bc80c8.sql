-- Drop and recreate the function to reject anonymous users
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _is_anonymous boolean;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Reject anonymous users to prevent email harvesting
  SELECT is_anonymous INTO _is_anonymous FROM auth.users WHERE id = auth.uid();
  IF _is_anonymous IS TRUE THEN
    RAISE EXCEPTION 'Anonymous users cannot look up emails';
  END IF;
  
  -- Only return email for exact username match (case-insensitive)
  SELECT u.email INTO _email
  FROM auth.users u
  INNER JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(p.username) = lower(_username)
  LIMIT 1;
  
  RETURN _email;
END;
$$;