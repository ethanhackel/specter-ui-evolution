
-- Admin function to delete any user account
CREATE OR REPLACE FUNCTION public.admin_delete_account(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  -- Clean up user data
  DELETE FROM public.matchmaking_queue WHERE user_id = _target_user_id;
  DELETE FROM public.presence WHERE user_id = _target_user_id;
  DELETE FROM public.ratings WHERE rater_id = _target_user_id OR rated_id = _target_user_id;
  DELETE FROM public.reports WHERE reporter_id = _target_user_id;
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  DELETE FROM public.profiles WHERE user_id = _target_user_id;

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = _target_user_id;
END;
$$;

-- Create page_views table for traffic analytics
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  source text,
  user_agent text,
  country text,
  session_id text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Admins can read all page views
CREATE POLICY "Admins can read page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert page views (for tracking)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anonymous insert too for guest tracking
CREATE POLICY "Anon can insert page views"
ON public.page_views
FOR INSERT
TO anon
WITH CHECK (true);

-- Index for analytics queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_source ON public.page_views(source);
CREATE INDEX idx_page_views_path ON public.page_views(path);
