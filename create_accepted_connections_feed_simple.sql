/*
  # Create simplified accepted_connections_feed view (without chat_rooms dependency)
  
  This version doesn't include room_id since the chat_rooms table seems to have issues.
  We can add room_id later once the chat_rooms table is properly set up.
*/

-- Create the accepted_connections_feed view (simplified)
CREATE OR REPLACE VIEW accepted_connections_feed AS
SELECT 
  cr.id as connection_id,
  cr.business_id,
  b.name as business_name,
  b.city as business_city,
  b.province_en,
  b.province_fr,
  cr.requester_id,
  get_requester_email(cr.*) as requester_email,
  b.owner_id as business_owner_id,
  NULL as room_id,  -- Placeholder until chat_rooms is fixed
  cr.created_at
FROM connection_requests cr
JOIN businesses b ON b.id = cr.business_id
WHERE cr.status = 'accepted';

-- Grant permissions
GRANT SELECT ON accepted_connections_feed TO authenticated;
