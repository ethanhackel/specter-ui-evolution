
-- ================================================
-- SPECTERCHAT COMPLETE DATABASE SCHEMA
-- ================================================

-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Chat room status enum
CREATE TYPE public.room_status AS ENUM ('active', 'ended');

-- 3. Queue status enum  
CREATE TYPE public.queue_status AS ENUM ('waiting', 'matched', 'cancelled');

-- ================================================
-- UTILITY FUNCTION: updated_at trigger
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ================================================
-- PROFILES TABLE
-- ================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  karma INTEGER NOT NULL DEFAULT 0,
  total_chats INTEGER NOT NULL DEFAULT 0,
  is_guest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- USER ROLES TABLE
-- ================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- MATCHMAKING QUEUE TABLE
-- ================================================
CREATE TABLE public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  status queue_status NOT NULL DEFAULT 'waiting',
  matched_room_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue entries"
  ON public.matchmaking_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue entry"
  ON public.matchmaking_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entry"
  ON public.matchmaking_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue entry"
  ON public.matchmaking_queue FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_queue_updated_at
  BEFORE UPDATE ON public.matchmaking_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_queue_status ON public.matchmaking_queue(status) WHERE status = 'waiting';

-- ================================================
-- CHAT ROOMS TABLE
-- ================================================
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status room_status NOT NULL DEFAULT 'active',
  ended_by UUID REFERENCES auth.users(id),
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rooms"
  ON public.chat_rooms FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can create rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own rooms"
  ON public.chat_rooms FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE INDEX idx_rooms_active ON public.chat_rooms(status) WHERE status = 'active';

-- ================================================
-- MESSAGES TABLE
-- ================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  is_sticker BOOLEAN NOT NULL DEFAULT false,
  sticker_key TEXT,
  is_unsent BOOLEAN NOT NULL DEFAULT false,
  reaction TEXT,
  reply_to_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages in rooms they belong to
CREATE OR REPLACE FUNCTION public.user_in_room(_user_id UUID, _room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = _room_id AND (user1_id = _user_id OR user2_id = _user_id)
  )
$$;

CREATE POLICY "Users can read messages in their rooms"
  ON public.messages FOR SELECT
  USING (public.user_in_room(auth.uid(), room_id));

CREATE POLICY "Users can send messages in their rooms"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND public.user_in_room(auth.uid(), room_id));

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE INDEX idx_messages_room ON public.messages(room_id, created_at);

-- ================================================
-- RATINGS TABLE
-- ================================================
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, rater_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can view own ratings"
  ON public.ratings FOR SELECT
  USING (auth.uid() = rater_id OR auth.uid() = rated_id);

-- ================================================
-- REPORTS TABLE
-- ================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT 'inappropriate',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- SITE STATS TABLE (single row, real-time updated)
-- ================================================
CREATE TABLE public.site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  online_count INTEGER NOT NULL DEFAULT 0,
  chats_today INTEGER NOT NULL DEFAULT 0,
  total_chats INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stats"
  ON public.site_stats FOR SELECT USING (true);

-- Insert the initial stats row
INSERT INTO public.site_stats (id, online_count, chats_today, total_chats, total_messages)
VALUES (1, 0, 0, 0, 0);

-- ================================================
-- PRESENCE TABLE (heartbeat-based online tracking)
-- ================================================
CREATE TABLE public.presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_in_chat BOOLEAN NOT NULL DEFAULT false,
  current_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL
);

ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read presence"
  ON public.presence FOR SELECT USING (true);

CREATE POLICY "Users can upsert own presence"
  ON public.presence FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
  ON public.presence FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presence"
  ON public.presence FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- TRIGGER: Auto-create profile on signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Generate username: use metadata if provided, otherwise Ghost#xxxx
  _username := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    'Ghost#' || substr(NEW.id::text, 1, 4)
  );
  
  INSERT INTO public.profiles (user_id, username, is_guest)
  VALUES (
    NEW.id,
    _username,
    CASE WHEN NEW.is_anonymous THEN true ELSE false END
  );
  
  -- Insert presence record
  INSERT INTO public.presence (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- TRIGGER: Update message count on new message
-- ================================================
CREATE OR REPLACE FUNCTION public.increment_message_count()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_rooms
    SET message_count = message_count + 1
    WHERE id = NEW.room_id;
  
  UPDATE public.site_stats
    SET total_messages = total_messages + 1,
        updated_at = now()
    WHERE id = 1;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.increment_message_count();

-- ================================================
-- TRIGGER: Update stats when chat room ends
-- ================================================
CREATE OR REPLACE FUNCTION public.on_room_ended()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status = 'active' THEN
    -- Increment total chats and today counter
    UPDATE public.site_stats
      SET total_chats = total_chats + 1,
          chats_today = chats_today + 1,
          updated_at = now()
      WHERE id = 1;
    
    -- Increment both users' total_chats
    UPDATE public.profiles
      SET total_chats = total_chats + 1
      WHERE user_id IN (NEW.user1_id, NEW.user2_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_chat_room_status_change
  AFTER UPDATE OF status ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION public.on_room_ended();

-- ================================================
-- FUNCTION: Update online count from presence
-- ================================================
CREATE OR REPLACE FUNCTION public.refresh_online_count()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

-- ================================================
-- FUNCTION: Reset daily chats counter
-- ================================================
CREATE OR REPLACE FUNCTION public.reset_daily_stats()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.site_stats SET chats_today = 0, updated_at = now() WHERE id = 1;
END;
$$;

-- ================================================
-- FUNCTION: Find match (called from edge function)
-- ================================================
CREATE OR REPLACE FUNCTION public.find_and_create_match(_user_id UUID, _interests TEXT[])
RETURNS TABLE(room_id UUID, partner_id UUID, partner_username TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _match_queue_id UUID;
  _match_user_id UUID;
  _room_id UUID;
  _partner_username TEXT;
BEGIN
  -- Find best match: prefer shared interests, then FIFO
  SELECT mq.id, mq.user_id INTO _match_queue_id, _match_user_id
  FROM public.matchmaking_queue mq
  WHERE mq.status = 'waiting'
    AND mq.user_id != _user_id
  ORDER BY
    -- Score: count of overlapping interests
    COALESCE(array_length(ARRAY(
      SELECT unnest(mq.interests) INTERSECT SELECT unnest(_interests)
    ), 1), 0) DESC,
    mq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF _match_user_id IS NULL THEN
    -- No match found
    RETURN;
  END IF;
  
  -- Create chat room
  INSERT INTO public.chat_rooms (user1_id, user2_id)
  VALUES (_match_user_id, _user_id)
  RETURNING id INTO _room_id;
  
  -- Update matched queue entry
  UPDATE public.matchmaking_queue
    SET status = 'matched', matched_room_id = _room_id, updated_at = now()
    WHERE id = _match_queue_id;
  
  -- Get partner username
  SELECT username INTO _partner_username
    FROM public.profiles WHERE user_id = _match_user_id;
  
  -- Update presence for both users
  UPDATE public.presence
    SET is_in_chat = true, current_room_id = _room_id, last_seen = now()
    WHERE user_id IN (_match_user_id, _user_id);
  
  RETURN QUERY SELECT _room_id, _match_user_id, _partner_username;
END;
$$;

-- ================================================
-- Enable Realtime on key tables
-- ================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.presence;
