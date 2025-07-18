/*
  # Create Test Data for Chat Room System
  
  This script creates test connection requests so you can immediately test 
  the new chat room and notification system.
  
  Run this AFTER the reset script.
*/

-- First, let's see what users and businesses are available
SELECT 'Users available:' as type, id, email FROM auth.users LIMIT 10
UNION ALL
SELECT 'Businesses available:', b.id::text, b.name FROM businesses b LIMIT 10;

-- Create test connection requests using actual data from your system
-- You'll need to replace the UUIDs below with real ones from your database

/*
-- Example test data - REPLACE THESE UUIDs WITH REAL ONES
INSERT INTO connection_requests (
  requester_id,  -- User who wants to connect
  business_id,   -- Business they want to connect with
  status,
  created_at
) VALUES 
-- Test request 1: Pending request ready to be accepted
(
  'replace-with-actual-user-uuid',     -- Requester
  'replace-with-actual-business-uuid', -- Business
  'pending',
  NOW() - INTERVAL '1 hour'
),
-- Test request 2: Another pending request
(
  'replace-with-another-user-uuid',    -- Different requester
  'replace-with-actual-business-uuid', -- Same business
  'pending', 
  NOW() - INTERVAL '30 minutes'
);
*/

-- To get actual UUIDs for testing, run these queries:

-- Get first user ID (to use as requester)
SELECT 'Copy this user ID for requester_id:' as instruction, id, email 
FROM auth.users 
WHERE email IS NOT NULL 
LIMIT 1;

-- Get second user ID (to use as business owner - make sure they own a business)
SELECT 'Copy this business info:' as instruction, 
       b.id as business_id, 
       b.name as business_name,
       b.owner_id as business_owner_id,
       u.email as owner_email
FROM businesses b
JOIN auth.users u ON u.id = b.owner_id
LIMIT 1;

-- Template for creating test connection request:
-- UPDATE the UUIDs below and run manually:

/*
INSERT INTO connection_requests (
  requester_id,  -- Use the user ID from first query
  business_id,   -- Use the business ID from second query  
  status,
  created_at
) VALUES (
  'YOUR_USER_ID_HERE',
  'YOUR_BUSINESS_ID_HERE',
  'pending',
  NOW()
);
*/

-- After creating the test request, verify it appears in the view:
SELECT 'Test request created:' as info, * FROM connection_requests_with_details;
