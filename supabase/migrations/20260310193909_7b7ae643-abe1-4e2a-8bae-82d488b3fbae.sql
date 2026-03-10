
-- ============================================================
-- Full audit fixes migration
-- ============================================================

-- BUG-03: Partial unique index on waiting queue
CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_user_waiting
  ON public.matchmaking_queue (user_id)
  WHERE status = 'waiting';

-- BUG-01 + BUG-02: Fix find_and_create_match
CREATE OR REPLACE FUNCTION public.find_and_create_match(_user_id uuid, _interests text[])
 RETURNS TABLE(room_id uuid, partner_id uuid, partner_username text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _match_queue_id UUID;
  _match_user_id UUID;
  _room_id UUID;
  _partner_username TEXT;
BEGIN
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: _user_id must match auth.uid()';
  END IF;

  IF (SELECT is_banned FROM public.profiles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'Account suspended';
  END IF;

  -- BUG-02: Active room check
  IF EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE (user1_id = _user_id OR user2_id = _user_id) AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Already in an active room';
  END IF;

  SELECT mq.id, mq.user_id INTO _match_queue_id, _match_user_id
  FROM public.matchmaking_queue mq
  WHERE mq.status = 'waiting' AND mq.user_id != _user_id
  ORDER BY
    COALESCE(array_length(ARRAY(
      SELECT unnest(mq.interests) INTERSECT SELECT unnest(_interests)
    ), 1), 0) DESC,
    mq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF _match_user_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.chat_rooms (user1_id, user2_id)
  VALUES (_match_user_id, _user_id) RETURNING id INTO _room_id;

  UPDATE public.matchmaking_queue
    SET status = 'matched', matched_room_id = _room_id, updated_at = now()
    WHERE id = _match_queue_id;

  -- BUG-01: Update caller's queue entry too
  UPDATE public.matchmaking_queue
    SET status = 'matched', matched_room_id = _room_id, updated_at = now()
    WHERE user_id = _user_id AND status = 'waiting';

  SELECT username INTO _partner_username FROM public.profiles WHERE user_id = _match_user_id;

  UPDATE public.presence
    SET is_in_chat = true, current_room_id = _room_id, last_seen = now()
    WHERE user_id IN (_match_user_id, _user_id);

  RETURN QUERY SELECT _room_id, _match_user_id, _partner_username;
END;
$$;

-- SEC-02: Message rate limiting trigger
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > now() - interval '5 seconds';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 5 messages per 5 seconds';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_rate_limit ON public.messages;
CREATE TRIGGER trg_message_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_rate_limit();

-- SEC-03: Fix validate_message_content with SECURITY DEFINER + ban check
CREATE OR REPLACE FUNCTION public.validate_message_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF (SELECT is_banned FROM public.profiles WHERE user_id = NEW.sender_id) THEN
    RAISE EXCEPTION 'Banned users cannot send messages';
  END IF;

  NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');

  IF length(NEW.content) > 2000 THEN
    NEW.content := substring(NEW.content FROM 1 FOR 2000);
  END IF;

  IF NEW.is_sticker AND NEW.sticker_key IS NOT NULL THEN
    IF NEW.sticker_key NOT IN ('hello','laugh','love','cool','spooky','angry','cry','shocked','think','thumbsup','sleep','dance') THEN
      RAISE EXCEPTION 'Invalid sticker key';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_message_content ON public.messages;
CREATE TRIGGER trg_validate_message_content
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content();

-- SEC-04: Anon read on site_stats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_stats' AND policyname = 'Anon can read stats'
  ) THEN
    CREATE POLICY "Anon can read stats" ON public.site_stats FOR SELECT TO anon USING (true);
  END IF;
END;
$$;

-- SEC-05: Ghost username collision handler (8 chars)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _username TEXT;
  _attempt INT := 0;
BEGIN
  _username := COALESCE(NEW.raw_user_meta_data ->> 'username', NULL);

  IF _username IS NULL THEN
    LOOP
      _username := 'Ghost#' || substr(md5(NEW.id::text || _attempt::text), 1, 8);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = _username);
      _attempt := _attempt + 1;
      IF _attempt > 10 THEN
        _username := 'Ghost#' || substr(NEW.id::text, 1, 12);
        EXIT;
      END IF;
    END LOOP;
  ELSE
    _username := regexp_replace(_username, '<[^>]*>', '', 'g');
    _username := substring(_username FROM 1 FOR 30);
  END IF;

  INSERT INTO public.profiles (user_id, username, is_guest)
  VALUES (NEW.id, _username, CASE WHEN NEW.is_anonymous THEN true ELSE false END);

  INSERT INTO public.presence (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- DATA-01: Decrement counters on unsent
CREATE OR REPLACE FUNCTION public.decrement_on_unsent()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_unsent AND NOT OLD.is_unsent THEN
    UPDATE public.chat_rooms SET message_count = GREATEST(message_count - 1, 0) WHERE id = NEW.room_id;
    UPDATE public.site_stats SET total_messages = GREATEST(total_messages - 1, 0), updated_at = now() WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_on_unsent ON public.messages;
CREATE TRIGGER trg_decrement_on_unsent
  AFTER UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_on_unsent();

-- DATA-02: Queue cleanup when room ends
CREATE OR REPLACE FUNCTION public.on_room_ended()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status = 'active' THEN
    UPDATE public.site_stats SET total_chats = total_chats + 1, chats_today = chats_today + 1, updated_at = now() WHERE id = 1;
    UPDATE public.profiles SET total_chats = total_chats + 1 WHERE user_id IN (NEW.user1_id, NEW.user2_id);
    DELETE FROM public.matchmaking_queue WHERE user_id IN (NEW.user1_id, NEW.user2_id) AND status = 'waiting';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_room_ended ON public.chat_rooms;
CREATE TRIGGER trg_on_room_ended
  AFTER UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.on_room_ended();

-- DATA-03: Ratings UPDATE policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can update own ratings'
  ) THEN
    CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = rater_id);
  END IF;
END;
$$;

-- BUG-05: Allow null sender for deleted users + fix delete functions
ALTER TABLE public.messages ALTER COLUMN sender_id DROP NOT NULL;

DO $$
DECLARE
  _fk_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO _fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'messages' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'sender_id';
  IF _fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.messages DROP CONSTRAINT %I', _fk_name);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_account(_target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;
  UPDATE public.messages SET sender_id = NULL WHERE sender_id = _target_user_id;
  DELETE FROM public.matchmaking_queue WHERE user_id = _target_user_id;
  DELETE FROM public.presence WHERE user_id = _target_user_id;
  DELETE FROM public.ratings WHERE rater_id = _target_user_id OR rated_id = _target_user_id;
  DELETE FROM public.reports WHERE reporter_id = _target_user_id;
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  DELETE FROM public.profiles WHERE user_id = _target_user_id;
  DELETE FROM auth.users WHERE id = _target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_own_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.messages SET sender_id = NULL WHERE sender_id = _user_id;
  DELETE FROM public.matchmaking_queue WHERE user_id = _user_id;
  DELETE FROM public.presence WHERE user_id = _user_id;
  DELETE FROM public.ratings WHERE rater_id = _user_id;
  DELETE FROM public.reports WHERE reporter_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM public.profiles WHERE user_id = _user_id;
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- PERF-01/02: Missing indexes
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON public.presence (last_seen);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_users ON public.chat_rooms (user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_status_users ON public.chat_rooms (status, user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages (sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_created ON public.reports (reporter_id, created_at);

-- RT-02: Fix REPLICA IDENTITY
ALTER TABLE public.messages REPLICA IDENTITY DEFAULT;

-- Re-attach increment_message_count trigger if missing
DROP TRIGGER IF EXISTS trg_increment_message_count ON public.messages;
CREATE TRIGGER trg_increment_message_count
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_message_count();
