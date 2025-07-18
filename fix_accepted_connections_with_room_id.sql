/*
  # Fix accepted_connections_feed view to include actual room_id
  
  This updates the view to include the actual chat room ID from the chat_rooms table
  so that the ConnectionFeed component can properly link to chat rooms.
*/

-- Update the accepted_connections_feed view to include room_id from chat_rooms
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

-- Grant permissions
GRANT SELECT ON accepted_connections_feed TO authenticated;
