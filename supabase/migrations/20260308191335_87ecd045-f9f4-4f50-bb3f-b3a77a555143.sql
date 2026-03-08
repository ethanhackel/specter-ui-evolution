-- 1. Create a public view excluding sensitive ban fields
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, user_id, username, avatar_url, karma, total_chats, is_guest, created_at, updated_at
  FROM public.profiles;

-- 2. Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 3. Users can view their own profile (includes ban fields)
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Admins can view all profiles (includes ban fields for admin panel)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));