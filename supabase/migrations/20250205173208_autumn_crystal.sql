-- Add connection_request to notification types
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
  'connection_request'
));

-- Create connection requests table
CREATE TABLE connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_connection_requests_business_id ON connection_requests(business_id);
CREATE INDEX idx_connection_requests_requester_id ON connection_requests(requester_id);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

-- Create policies
CREATE POLICY "Users can create connection requests"
  ON connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own requests"
  ON connection_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Create function to handle new connection requests
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS trigger AS $$
DECLARE
  v_owner_id uuid;
  v_business_name text;
  v_requester_email text;
BEGIN
  -- Get business owner ID and name
  SELECT owner_id, name 
  INTO v_owner_id, v_business_name
  FROM businesses 
  WHERE id = NEW.business_id;

  -- Get requester email
  SELECT email 
  INTO v_requester_email
  FROM auth.users 
  WHERE id = NEW.requester_id;

  -- Insert notification for business owner
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_owner_id,
    'connection_request',
    'New Connection Request',
    'Someone wants to connect regarding your business listing.',
    jsonb_build_object(
      'business_id', NEW.business_id,
      'business_name', v_business_name,
      'request_id', NEW.id,
      'requester_email', v_requester_email,
      'message', NEW.message
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new connection requests
CREATE TRIGGER notify_connection_request
  AFTER INSERT ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_connection_request();

-- Create function to request connection
CREATE OR REPLACE FUNCTION request_connection(
  p_business_id uuid,
  p_message text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Insert connection request
  INSERT INTO connection_requests (
    business_id,
    requester_id,
    message
  ) VALUES (
    p_business_id,
    auth.uid(),
    p_message
  )
  RETURNING id INTO v_request_id;
  
  RETURN v_request_id;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON connection_requests TO authenticated;
GRANT EXECUTE ON FUNCTION request_connection TO authenticated;