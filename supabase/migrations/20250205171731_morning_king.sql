-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN (
    'listing_approved',
    'listing_rejected',
    'comment_received',
    'report_status',
    'system_announcement',
    'security_alert'
  )),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  emailed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id uuid,
  p_notification_ids uuid[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id
    AND id = ANY(p_notification_ids);
END;
$$;

-- Create view for notifications with user details
CREATE OR REPLACE VIEW notifications_with_users AS
SELECT 
  n.*,
  u.email as user_email
FROM notifications n
JOIN auth.users u ON u.id = n.user_id;

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read TO authenticated;
GRANT SELECT ON notifications_with_users TO authenticated;

-- Create trigger function for email notifications
CREATE OR REPLACE FUNCTION notify_email()
RETURNS trigger AS $$
BEGIN
  -- Here you would typically call your email service
  -- For now, just mark as emailed
  NEW.emailed := true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new notifications
CREATE TRIGGER email_notification
  BEFORE INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_email();