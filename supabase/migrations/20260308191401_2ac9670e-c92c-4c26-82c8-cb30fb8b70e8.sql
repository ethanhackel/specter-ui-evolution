-- Fix the security definer view issue
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
  WITH (security_invoker = on)
AS
  SELECT id, user_id, username, avatar_url, karma, total_chats, is_guest, created_at, updated_at
  FROM public.profiles;