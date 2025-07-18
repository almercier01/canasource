/*
  # Create accepted_connections_feed view
  
  The ConnectionFeed component expects this view to show accepted connection requests
  with business and room information. This was missing from the database.
*/

-- Create the accepted_connections_feed view
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
  r.id as room_id,
  cr.created_at
FROM connection_requests cr
JOIN businesses b ON b.id = cr.business_id
LEFT JOIN chat_rooms r ON r.business_id = cr.business_id AND r.member_id = cr.requester_id
WHERE cr.status = 'accepted';

-- Grant permissions
GRANT SELECT ON accepted_connections_feed TO authenticated;
