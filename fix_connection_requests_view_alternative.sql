/*
  # Alternative fix for connection_requests_with_details view (without function)
  
  This version directly joins with auth.users table instead of using a function.
  Use this if the function approach doesn't work in your environment.
*/

-- Drop the existing view first
DROP VIEW IF EXISTS connection_requests_with_details;

-- Recreate the view with direct join to auth.users
CREATE OR REPLACE VIEW connection_requests_with_details AS
SELECT 
  cr.*,
  b.name as business_name,
  b.city as business_city,
  b.province_en,
  b.province_fr, 
  b.owner_id as business_owner_id,
  u.email as requester_email
FROM connection_requests cr
JOIN businesses b ON b.id = cr.business_id
LEFT JOIN auth.users u ON u.id = cr.requester_id;

-- Grant permissions
GRANT SELECT ON connection_requests_with_details TO authenticated;
