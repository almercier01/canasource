/*
  # Create view to transform existing accepted_connections_feed table
  
  You have an existing accepted_connections_feed table with different columns.
  This creates a view that transforms it to match what ConnectionFeed component expects.
*/

-- First, let's rename the existing table to avoid conflicts
ALTER TABLE accepted_connections_feed RENAME TO accepted_connections_feed_old;

-- Now create a view with the expected structure
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
  NULL as room_id,  -- Placeholder for now
  acf.created_at
FROM accepted_connections_feed_old acf
JOIN businesses b ON b.id = acf.business_id
LEFT JOIN auth.users u ON u.id = acf.connected_user_id;

-- Grant permissions
GRANT SELECT ON accepted_connections_feed TO authenticated;
