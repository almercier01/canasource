-- Drop and recreate the handle_connection_request_status_change function with duplicate check
CREATE OR REPLACE FUNCTION handle_connection_request_status_change()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_room_id uuid;
  v_existing_room_id uuid;
BEGIN
  -- If request is accepted, create a chat room
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Check if a chat room already exists
    SELECT id INTO v_existing_room_id
    FROM chat_rooms
    WHERE business_id = NEW.business_id
      AND (
        (owner_id = (SELECT owner_id FROM businesses WHERE id = NEW.business_id) AND member_id = NEW.requester_id)
        OR
        (member_id = (SELECT owner_id FROM businesses WHERE id = NEW.business_id) AND owner_id = NEW.requester_id)
      );

    -- Only create a new room if one doesn't exist
    IF v_existing_room_id IS NULL THEN
      -- Create chat room
      INSERT INTO chat_rooms (business_id, owner_id, member_id)
      SELECT 
        NEW.business_id,
        b.owner_id,
        NEW.requester_id
      FROM businesses b
      WHERE b.id = NEW.business_id
      RETURNING id INTO v_room_id;

      -- Notify both parties
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
      )
      SELECT 
        unnest(ARRAY[b.owner_id, NEW.requester_id]),
        'chat_message',
        'Chat Room Created',
        'You can now start chatting',
        jsonb_build_object(
          'room_id', COALESCE(v_room_id, v_existing_room_id),
          'business_id', NEW.business_id,
          'business_name', b.name
        )
      FROM businesses b
      WHERE b.id = NEW.business_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;