-- Diagnostic queries to check notifications table structure

-- 1. Check if notifications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'notifications'
);

-- 2. Check what columns exist in notifications table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 3. Check if there are any notification records
SELECT COUNT(*) as notifications_count FROM notifications;
