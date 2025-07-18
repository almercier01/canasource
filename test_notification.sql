-- Test notification insert for your current table structure
-- This should work with your existing notifications table

INSERT INTO notifications (user_id, type, title, message, data, read, created_at)
VALUES (
  '72384627-63ef-4f3c-9a6e-d8c28a19e2d0',  -- Your user ID from the logs
  'connection_request_received',
  'New Connection Request',
  'Someone wants to connect with your business',
  '{"business_name": "MapleTech Solutions"}',
  false,
  now()
);

-- You can also check what notifications exist
SELECT * FROM notifications WHERE user_id = '72384627-63ef-4f3c-9a6e-d8c28a19e2d0';

-- Check if the notifications_with_users view works
SELECT * FROM notifications_with_users WHERE user_id = '72384627-63ef-4f3c-9a6e-d8c28a19e2d0';
