
-- Create a security definer function to allow room participants to react to any message in their room
CREATE OR REPLACE FUNCTION public.react_to_message(_message_id uuid, _reaction text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _room_id uuid;
BEGIN
  -- Get the room_id of the message
  SELECT room_id INTO _room_id FROM public.messages WHERE id = _message_id;
  
  IF _room_id IS NULL THEN
    RAISE EXCEPTION 'Message not found';
  END IF;
  
  -- Verify the caller is in the room
  IF NOT public.user_in_room(auth.uid(), _room_id) THEN
    RAISE EXCEPTION 'Not authorized: you are not in this room';
  END IF;
  
  -- Update the reaction
  UPDATE public.messages SET reaction = NULLIF(_reaction, '') WHERE id = _message_id;
END;
$$;
