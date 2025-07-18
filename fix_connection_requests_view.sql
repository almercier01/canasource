/*
  # Fix connection_requests_with_details view
  
  The UserDashboard component expects these fields but they were missing from the view:
  - business_city (from businesses.city)
  - province_en (from businesses.province_en) 
  - province_fr (from businesses.province_fr)
  
  This was causing "Inquiry about undefined" to show in the UI.
*/

-- First, create the get_requester_email function if it doesn't exist
CREATE OR REPLACE FUNCTION get_requester_email(request_row connection_requests)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = request_row.requester_id;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_requester_email TO authenticated;

-- Drop the existing view first
DROP VIEW IF EXISTS connection_requests_with_details;

-- Recreate the view with all required fields - ONLY show pending requests
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
WHERE cr.status = 'pending';  -- Only show pending requests

-- Grant permissions
GRANT SELECT ON connection_requests_with_details TO authenticated;
