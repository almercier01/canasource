-- Check the current structure of the businesses table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
ORDER BY ordinal_position;
