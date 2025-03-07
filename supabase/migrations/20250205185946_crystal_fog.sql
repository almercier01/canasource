-- Add policy for creating chat rooms
CREATE POLICY "System can create chat rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy for updating chat rooms
CREATE POLICY "Users can update their chat rooms"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = member_id
  )
  WITH CHECK (
    auth.uid() = owner_id OR 
    auth.uid() = member_id
  );

-- Add policy for deleting chat rooms
CREATE POLICY "Users can delete their chat rooms"
  ON chat_rooms
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = member_id
  );

-- Ensure the trigger function has proper permissions
GRANT ALL ON chat_rooms TO authenticated;
GRANT ALL ON chat_messages TO authenticated;

-- Recreate the handle_connection_request_status_change function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_connection_request_status_change()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
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
$$;