/*
  # Test Chat Room Creation and Notification System
  
  This file demonstrates the complete workflow for testing:
  1. Accept a connection request
  2. Create chat room
  3. Send notifications to both users
  4. Verify both users can access the chat
*/

-- Step 1: Create a test scenario with users and business
-- (Assuming users already exist in your system)

-- Step 2: Test accepting a connection request
-- This should trigger the UserDashboard.tsx handleRequestAction function

-- Step 3: Verify that when a request is accepted:
-- a) A chat room is created in chat_rooms table
-- b) Both users receive notifications with type 'chat_room_created'
-- c) The accepted_connections_feed view shows the room_id

-- Query to check chat rooms created
SELECT 
  cr.*,
  b.name as business_name,
  owner.email as owner_email,
  member.email as member_email
FROM chat_rooms cr
JOIN businesses b ON b.id = cr.business_id
LEFT JOIN auth.users owner ON owner.id = cr.owner_id
LEFT JOIN auth.users member ON member.id = cr.member_id
ORDER BY cr.created_at DESC;

-- Query to check notifications sent
SELECT 
  n.*,
  u.email as recipient_email
FROM notifications n
LEFT JOIN auth.users u ON u.id = n.user_id
WHERE n.type = 'chat_room_created'
ORDER BY n.created_at DESC;

-- Query to check accepted connections with room_id
SELECT * FROM accepted_connections_feed 
ORDER BY created_at DESC;

-- Test notification click functionality:
-- 1. User should see notification with "Start Chat" button
-- 2. Clicking should navigate to /chat/{room_id}
-- 3. ConnectionFeed should show "Chat available" with green dot
-- 4. Clicking connection should also navigate to /chat/{room_id}

/*
  Expected Workflow:
  
  1. Business owner accepts connection request in UserDashboard
  2. System creates chat room automatically
  3. Both users get notifications:
     - Requester: "Chat Room Created - Your connection with {business} is ready! You can now start a conversation."
     - Business Owner: "New Connection Established - A new connection has been established with {email}. You can now start a conversation."
  4. NotificationCenter shows chat room notifications with "Start Chat" button
  5. ConnectionFeed shows connections with "Chat available" status and links to chat
  6. Both users can click to start chatting
*/
