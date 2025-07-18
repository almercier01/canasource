-- Create complete notifications table if it doesn't exist or is incomplete

-- Drop and recreate the notifications table with all required columns
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN (
    'listing_approved',
    'listing_rejected', 
    'comment_received',
    'report_status',
    'system_announcement',
    'security_alert',
    'connection_request_received',
    'connection_request_accepted',
    'connection_request_declined'
  )),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  emailed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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
  USING (auth.uid() = user_id);

-- Recreate the view
CREATE OR REPLACE VIEW notifications_with_users AS
SELECT 
  n.*,
  u.email as user_email
FROM notifications n
JOIN auth.users u ON u.id = n.user_id;

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT SELECT ON notifications_with_users TO authenticated;
