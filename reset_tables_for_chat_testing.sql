/*
  # Reset Tables for Chat Room Testing
  
  This script resets all pertinent tables so we can test the new chat room 
  and notification system with a clean slate.
  
  Tables to reset:
  - connection_requests (keep structure, clear data)
  - chat_rooms (clear all chat rooms)
  - chat_messages (clear all messages)
  - notifications (clear all notifications)
  
  Views to recreate:
  - connection_requests_with_details
  - accepted_connections_feed
*/

-- Step 1: Clear all chat-related data
TRUNCATE TABLE chat_messages CASCADE;
TRUNCATE TABLE chat_rooms CASCADE;

-- Step 2: Clear notifications
TRUNCATE TABLE notifications CASCADE;

-- Step 3: Clear connection data (but keep businesses and users)
TRUNCATE TABLE connection_requests CASCADE;

-- Step 4: Create accepted_connections_feed_old table if it doesn't exist
-- This table is used by UserDashboard to track accepted connections
CREATE TABLE IF NOT EXISTS accepted_connections_feed_old (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,  -- business owner
  connected_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,  -- requester
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, user_id, connected_user_id)
);

-- Clear the table
TRUNCATE TABLE accepted_connections_feed_old CASCADE;

-- Enable RLS
ALTER TABLE accepted_connections_feed_old ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON accepted_connections_feed_old TO authenticated;

-- Step 5: Recreate the connection_requests_with_details view (from your current file)
DROP VIEW IF EXISTS connection_requests_with_details;

CREATE OR REPLACE FUNCTION get_requester_email(request_row connection_requests)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = request_row.requester_id;
$$;

GRANT EXECUTE ON FUNCTION get_requester_email TO authenticated;

CREATE OR REPLACE VIEW connection_requests_with_details AS
SELECT 
  cr.*,
  b.name as business_name,
  b.city as business_city,
  b.province_en,
  b.province_fr, 
  b.owner_id as business_owner_id,
  get_requester_email(cr.*) as requester_email
FROM connection_requests cr
JOIN businesses b ON b.id = cr.business_id
WHERE cr.status = 'pending';

GRANT SELECT ON connection_requests_with_details TO authenticated;

-- Step 6: Update accepted_connections_feed view to include room_id
DROP VIEW IF EXISTS accepted_connections_feed;

CREATE OR REPLACE VIEW accepted_connections_feed AS
SELECT 
  acf.id as connection_id,
  acf.business_id,
  b.name as business_name,
  b.city as business_city,
  b.province_en,
  b.province_fr,
  acf.connected_user_id as requester_id,
  u.email as requester_email,
  acf.user_id as business_owner_id,
  cr.id as room_id,  -- Get actual room ID from chat_rooms
  acf.created_at
FROM accepted_connections_feed_old acf
JOIN businesses b ON b.id = acf.business_id
LEFT JOIN auth.users u ON u.id = acf.connected_user_id
LEFT JOIN chat_rooms cr ON cr.business_id = acf.business_id 
  AND cr.member_id = acf.connected_user_id
  AND cr.owner_id = acf.user_id;

GRANT SELECT ON accepted_connections_feed TO authenticated;

-- Step 7: Create some test data for immediate testing
-- (Optional - uncomment if you want some test connection requests)

/*
-- Example: Create a test connection request
-- Replace these UUIDs with actual user/business IDs from your system

INSERT INTO connection_requests (
  requester_id, 
  business_id, 
  status, 
  created_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),  -- First user as requester
  (SELECT id FROM businesses LIMIT 1),  -- First business
  'pending',
  NOW()
);
*/

-- Step 8: Verify the reset worked
SELECT 'Connection Requests Count: ' || COUNT(*)::text as verification_results FROM connection_requests
UNION ALL
SELECT 'Chat Rooms Count: ' || COUNT(*)::text FROM chat_rooms
UNION ALL
SELECT 'Chat Messages Count: ' || COUNT(*)::text FROM chat_messages
UNION ALL
SELECT 'Notifications Count: ' || COUNT(*)::text FROM notifications
UNION ALL
SELECT 'Accepted Connections Count: ' || COUNT(*)::text FROM accepted_connections_feed_old;

-- Show available users and businesses for testing (run these separately)
-- SELECT 'Available Users:' as type, email FROM auth.users WHERE email IS NOT NULL LIMIT 5;
-- SELECT 'Available Businesses:' as type, name FROM businesses LIMIT 5;
