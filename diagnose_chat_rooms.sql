-- Diagnostic queries to check chat_rooms table structure

-- 1. Check if chat_rooms table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'chat_rooms'
);

-- 2. Check what columns exist in chat_rooms table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_rooms'
ORDER BY ordinal_position;

-- 3. Check if there are any chat_rooms records
SELECT COUNT(*) as chat_rooms_count FROM chat_rooms;
