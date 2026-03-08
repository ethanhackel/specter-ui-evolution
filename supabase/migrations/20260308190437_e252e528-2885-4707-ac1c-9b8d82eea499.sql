-- 1. Replace find_and_create_match to enforce auth.uid() check and ban check
CREATE OR REPLACE FUNCTION public.find_and_create_match(_user_id uuid, _interests text[])
 RETURNS TABLE(room_id uuid, partner_id uuid, partner_username text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _match_queue_id UUID;
  _match_user_id UUID;
  _room_id UUID;
  _partner_username TEXT;
BEGIN
  -- Caller verification: prevent impersonation
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: _user_id must match auth.uid()';
  END IF;

  -- Server-side ban check
  IF (SELECT is_banned FROM public.profiles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'Account suspended';
  END IF;

  -- Find best match: prefer shared interests, then FIFO
  SELECT mq.id, mq.user_id INTO _match_queue_id, _match_user_id
  FROM public.matchmaking_queue mq
  WHERE mq.status = 'waiting'
    AND mq.user_id != _user_id
  ORDER BY
    COALESCE(array_length(ARRAY(
      SELECT unnest(mq.interests) INTERSECT SELECT unnest(_interests)
    ), 1), 0) DESC,
    mq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF _match_user_id IS NULL THEN
    RETURN;
  END IF;
  
  INSERT INTO public.chat_rooms (user1_id, user2_id)
  VALUES (_match_user_id, _user_id)
  RETURNING id INTO _room_id;
  
  UPDATE public.matchmaking_queue
    SET status = 'matched', matched_room_id = _room_id, updated_at = now()
    WHERE id = _match_queue_id;
  
  SELECT username INTO _partner_username
    FROM public.profiles WHERE user_id = _match_user_id;
  
  UPDATE public.presence
    SET is_in_chat = true, current_room_id = _room_id, last_seen = now()
    WHERE user_id IN (_match_user_id, _user_id);
  
  RETURN QUERY SELECT _room_id, _match_user_id, _partner_username;
END;
$function$;

-- 2. Replace matchmaking_queue INSERT policy to enforce ban check server-side
DROP POLICY IF EXISTS "Users can insert own queue entry" ON public.matchmaking_queue;
CREATE POLICY "Users can insert own queue entry"
  ON public.matchmaking_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT public.is_user_banned(auth.uid())
  );