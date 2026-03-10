
-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- INF-01: Remove auth.uid() checks from refresh_online_count so cron/service-role can call it
CREATE OR REPLACE FUNCTION public.refresh_online_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.site_stats
    SET online_count = (
      SELECT COUNT(*) FROM public.presence
      WHERE last_seen > now() - interval '2 minutes'
    ),
    updated_at = now()
    WHERE id = 1;
END;
$$;

-- INF-01: Remove auth.uid() check from reset_daily_stats, use has_role OR allow service-role
CREATE OR REPLACE FUNCTION public.reset_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow if called by service role (auth.uid() is null) or by admin
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.site_stats SET chats_today = 0, updated_at = now() WHERE id = 1;
END;
$$;

-- INF-01: Create presence cleanup function (remove stale entries > 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.presence
    SET is_in_chat = false, current_room_id = NULL
    WHERE last_seen < now() - interval '5 minutes'
      AND is_in_chat = true;
      
  -- Clean up very stale presence entries (> 1 hour)
  DELETE FROM public.presence
    WHERE last_seen < now() - interval '1 hour';
END;
$$;

-- SEC-01: Drop the get_email_by_username function (moving to edge function)
DROP FUNCTION IF EXISTS public.get_email_by_username(text);
