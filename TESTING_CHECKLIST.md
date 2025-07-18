# Chat Room System Testing Checklist

## Step 1: Reset the Database
1. Run `reset_tables_for_chat_testing.sql` to clear all data
2. Verify the reset worked by checking the counts at the end of the script

## Step 2: Create Test Data
1. Run the queries in `create_test_data_for_chat.sql` to get actual user/business UUIDs
2. Create a test connection request using the template provided
3. Verify the request appears in `connection_requests_with_details` view

## Step 3: Test the Complete Workflow

### 3.1 Initial State Check
- [ ] Log in as business owner
- [ ] Go to UserDashboard
- [ ] Verify you see the pending connection request
- [ ] Check that it shows proper business info (not "undefined")

### 3.2 Accept Connection Request
- [ ] Click "Accept" on the connection request
- [ ] Verify the request disappears from pending requests
- [ ] Check that no errors appear in browser console

### 3.3 Verify Chat Room Creation
- [ ] Run SQL: `SELECT * FROM chat_rooms ORDER BY created_at DESC;`
- [ ] Confirm a new chat room was created
- [ ] Verify it has correct business_id, owner_id, and member_id

### 3.4 Check Notifications (Business Owner)
- [ ] Look at notification center (bell icon)
- [ ] Should see "New Connection Established" notification
- [ ] Should have green MessageSquare icon
- [ ] Should have "Start Chat" button
- [ ] Click the button - should navigate to `/chat/{room_id}`

### 3.5 Check Notifications (Requester)
- [ ] Log out and log in as the requester user
- [ ] Look at notification center
- [ ] Should see "Chat Room Created" notification  
- [ ] Should have green MessageSquare icon
- [ ] Should have "Start Chat" button
- [ ] Click the button - should navigate to `/chat/{room_id}`

### 3.6 Test Connection Feed
- [ ] Go to UserDashboard → Connection Feed tab
- [ ] Should see the accepted connection
- [ ] Should show "Chat available" with green indicator
- [ ] Click on the connection - should navigate to chat room

### 3.7 Verify Database State
- [ ] Run SQL: `SELECT * FROM accepted_connections_feed ORDER BY created_at DESC;`
- [ ] Confirm the connection appears with proper room_id
- [ ] Run SQL: `SELECT * FROM notifications WHERE type = 'chat_room_created' ORDER BY created_at DESC;`
- [ ] Confirm both users received notifications

## Step 4: Edge Case Testing

### 4.1 Duplicate Prevention
- [ ] Try accepting the same request twice (shouldn't be possible)
- [ ] Verify only one chat room exists per business-user pair

### 4.2 Multiple Connections  
- [ ] Create another connection request to the same business from different user
- [ ] Accept it and verify separate chat rooms are created
- [ ] Verify both connections show in ConnectionFeed

### 4.3 Notification Management
- [ ] Mark notifications as read/unread
- [ ] Delete notifications
- [ ] Verify counts update correctly

## Expected Results Summary

✅ **When a connection request is accepted:**
1. Chat room automatically created
2. Both users get notifications with action buttons
3. ConnectionFeed shows "Chat available" status  
4. All navigation links work properly
5. No "undefined" values anywhere

❌ **Red Flags to Watch For:**
- "undefined" appearing anywhere in the UI
- Notifications not appearing for either user
- Chat room not being created
- Navigation buttons not working
- Multiple chat rooms for same business-user pair
- Console errors during the workflow

## SQL Debugging Queries

```sql
-- Check all chat rooms
SELECT cr.*, b.name, owner.email as owner_email, member.email as member_email 
FROM chat_rooms cr 
JOIN businesses b ON b.id = cr.business_id
LEFT JOIN auth.users owner ON owner.id = cr.owner_id  
LEFT JOIN auth.users member ON member.id = cr.member_id
ORDER BY cr.created_at DESC;

-- Check all notifications
SELECT n.*, u.email as recipient_email
FROM notifications n
LEFT JOIN auth.users u ON u.id = n.user_id  
WHERE n.type = 'chat_room_created'
ORDER BY n.created_at DESC;

-- Check connection feed
SELECT * FROM accepted_connections_feed ORDER BY created_at DESC;

-- Check pending requests
SELECT * FROM connection_requests_with_details ORDER BY created_at DESC;
```
