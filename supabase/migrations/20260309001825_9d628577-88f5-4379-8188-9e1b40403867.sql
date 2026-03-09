
-- ============================================================
-- PART 1: Restrict ALL RLS policies to authenticated role only
-- ============================================================

-- chat_rooms: drop and recreate policies with TO authenticated
DROP POLICY IF EXISTS "Users can view own rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update own rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.chat_rooms;

CREATE POLICY "Users can view own rooms" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

CREATE POLICY "Users can update own rooms" ON public.chat_rooms
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

-- matchmaking_queue
DROP POLICY IF EXISTS "Users can delete own queue entry" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users can insert own queue entry" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users can update own queue entry" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users can view own queue entries" ON public.matchmaking_queue;

CREATE POLICY "Users can view own queue entries" ON public.matchmaking_queue
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue entry" ON public.matchmaking_queue
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) AND (NOT is_user_banned(auth.uid())));

CREATE POLICY "Users can update own queue entry" ON public.matchmaking_queue
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue entry" ON public.matchmaking_queue
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "Users can read messages in their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

CREATE POLICY "Users can read messages in their rooms" ON public.messages
  FOR SELECT TO authenticated
  USING (user_in_room(auth.uid(), room_id));

CREATE POLICY "Users can send messages in their rooms" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = sender_id) AND user_in_room(auth.uid(), room_id));

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- presence
DROP POLICY IF EXISTS "Anyone can read presence" ON public.presence;
DROP POLICY IF EXISTS "Users can delete own presence" ON public.presence;
DROP POLICY IF EXISTS "Users can update own presence" ON public.presence;
DROP POLICY IF EXISTS "Users can upsert own presence" ON public.presence;

CREATE POLICY "Authenticated can read presence" ON public.presence
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can upsert own presence" ON public.presence
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence" ON public.presence
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presence" ON public.presence
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ratings
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can view own ratings" ON public.ratings;

CREATE POLICY "Users can insert own ratings" ON public.ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can view own ratings" ON public.ratings
  FOR SELECT TO authenticated
  USING ((auth.uid() = rater_id) OR (auth.uid() = rated_id));

-- reports
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL FIX: Admins need UPDATE on reports to resolve/dismiss them
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- site_stats: keep public read but restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read stats" ON public.site_stats;

CREATE POLICY "Anyone can read stats" ON public.site_stats
  FOR SELECT TO authenticated
  USING (true);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 2: Message content validation trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_message_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Strip HTML tags to prevent XSS
  NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
  
  -- Enforce message length limit (2000 chars)
  IF length(NEW.content) > 2000 THEN
    NEW.content := substring(NEW.content FROM 1 FOR 2000);
  END IF;
  
  -- Validate sticker keys against allowed list
  IF NEW.is_sticker AND NEW.sticker_key IS NOT NULL THEN
    IF NEW.sticker_key NOT IN ('hello','laugh','love','cool','spooky','angry','cry','shocked','think','thumbsup','sleep','dance') THEN
      RAISE EXCEPTION 'Invalid sticker key';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_message_content ON public.messages;
CREATE TRIGGER validate_message_content
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content();

-- ============================================================
-- PART 3: Report rate-limiting trigger (max 10 per hour)
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_report_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.reports
  WHERE reporter_id = NEW.reporter_id
    AND created_at > now() - interval '1 hour';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 reports per hour';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_report_rate_limit ON public.reports;
CREATE TRIGGER check_report_rate_limit
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.check_report_rate_limit();

-- ============================================================
-- PART 4: Username sanitization in handle_new_user
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _username TEXT;
BEGIN
  _username := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    'Ghost#' || substr(NEW.id::text, 1, 4)
  );
  
  -- Strip HTML tags from username
  _username := regexp_replace(_username, '<[^>]*>', '', 'g');
  
  -- Truncate to 30 chars
  _username := substring(_username FROM 1 FOR 30);
  
  INSERT INTO public.profiles (user_id, username, is_guest)
  VALUES (
    NEW.id,
    _username,
    CASE WHEN NEW.is_anonymous THEN true ELSE false END
  );
  
  INSERT INTO public.presence (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- PART 5: Secure get_email_by_username (restrict to authenticated)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email text;
BEGIN
  -- Only allow authenticated users to look up emails
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT u.email INTO _email
  FROM auth.users u
  INNER JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(p.username) = lower(_username)
  LIMIT 1;
  
  RETURN _email;
END;
$$;

-- ============================================================
-- PART 6: Secure reset_daily_stats and refresh_online_count
-- ============================================================

CREATE OR REPLACE FUNCTION public.refresh_online_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.site_stats
    SET online_count = (
      SELECT COUNT(*) FROM public.presence
      WHERE last_seen > now() - interval '2 minutes'
    ),
    updated_at = now()
    WHERE id = 1;
END;
$$;
