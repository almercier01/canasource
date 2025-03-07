-- Create function to handle connection request status changes
CREATE OR REPLACE FUNCTION handle_connection_request_status_change()
RETURNS trigger AS $$
DECLARE
  v_room_id uuid;
BEGIN
  -- If request is accepted, create a chat room
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
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
        'room_id', v_room_id,
        'business_id', NEW.business_id,
        'business_name', b.name
      )
    FROM businesses b
    WHERE b.id = NEW.business_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for connection request status changes
CREATE TRIGGER handle_connection_request_status_change
  AFTER UPDATE ON connection_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_connection_request_status_change();