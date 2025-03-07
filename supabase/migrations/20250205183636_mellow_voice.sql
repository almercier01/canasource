-- Create chat rooms table
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  UNIQUE(business_id, owner_id, member_id)
);

-- Create chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_chat_rooms_business_id ON chat_rooms(business_id);
CREATE INDEX idx_chat_rooms_owner_id ON chat_rooms(owner_id);
CREATE INDEX idx_chat_rooms_member_id ON chat_rooms(member_id);
CREATE INDEX idx_chat_rooms_last_message ON chat_rooms(last_message_at DESC);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Create secure function to get user email
CREATE OR REPLACE FUNCTION get_chat_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

-- Create view for chat rooms with details
CREATE OR REPLACE VIEW chat_rooms_with_details AS
SELECT 
  cr.*,
  b.name as business_name,
  get_chat_user_email(cr.owner_id) as owner_email,
  get_chat_user_email(cr.member_id) as member_email
FROM chat_rooms cr
JOIN businesses b ON b.id = cr.business_id;

-- Create policies
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = member_id);

CREATE POLICY "Users can view messages in their rooms"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = room_id
      AND (owner_id = auth.uid() OR member_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their rooms"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = room_id
      AND (owner_id = auth.uid() OR member_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

-- Function to create or get chat room
CREATE OR REPLACE FUNCTION get_or_create_chat_room(
  p_business_id uuid,
  p_member_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_owner_id uuid;
BEGIN
  -- Get business owner ID
  SELECT owner_id INTO v_owner_id
  FROM businesses
  WHERE id = p_business_id;

  -- Check if room exists
  SELECT id INTO v_room_id
  FROM chat_rooms
  WHERE business_id = p_business_id
    AND owner_id = v_owner_id
    AND member_id = p_member_id;

  -- If room doesn't exist, create it
  IF v_room_id IS NULL THEN
    INSERT INTO chat_rooms (business_id, owner_id, member_id)
    VALUES (p_business_id, v_owner_id, p_member_id)
    RETURNING id INTO v_room_id;
  END IF;

  RETURN v_room_id;
END;
$$;

-- Function to send message
CREATE OR REPLACE FUNCTION send_chat_message(
  p_room_id uuid,
  p_content text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
BEGIN
  -- Insert message
  INSERT INTO chat_messages (room_id, sender_id, content)
  VALUES (p_room_id, auth.uid(), p_content)
  RETURNING id INTO v_message_id;

  -- Update room's last message timestamp
  UPDATE chat_rooms
  SET last_message_at = now(),
      updated_at = now()
  WHERE id = p_room_id;

  RETURN v_message_id;
END;
$$;

-- Add chat_message to notification types
ALTER TABLE notifications 
DROP CONSTRAINT notifications_type_check,
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'listing_approved',
  'listing_rejected',
  'comment_received',
  'report_status',
  'system_announcement',
  'security_alert',
  'connection_request',
  'chat_message'
));

-- Create function to notify new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger AS $$
DECLARE
  v_room record;
  v_recipient_id uuid;
BEGIN
  -- Get room details
  SELECT * INTO v_room
  FROM chat_rooms
  WHERE id = NEW.room_id;

  -- Determine recipient
  IF NEW.sender_id = v_room.owner_id THEN
    v_recipient_id := v_room.member_id;
  ELSE
    v_recipient_id := v_room.owner_id;
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_recipient_id,
    'chat_message',
    'New Message',
    substring(NEW.content from 1 for 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END,
    jsonb_build_object(
      'room_id', NEW.room_id,
      'message_id', NEW.id,
      'business_id', v_room.business_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
CREATE TRIGGER notify_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Grant necessary permissions
GRANT ALL ON chat_rooms TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_chat_room TO authenticated;
GRANT EXECUTE ON FUNCTION send_chat_message TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_user_email TO authenticated;
GRANT SELECT ON chat_rooms_with_details TO authenticated;