CREATE OR REPLACE FUNCTION public.reset_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.site_stats SET chats_today = 0, updated_at = now() WHERE id = 1;
END;
$$;