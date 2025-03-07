/*
  # Fix imageUrl column name

  1. Changes
    - Rename imageurl column to imageUrl for consistency
    - Add column if it doesn't exist
  
  2. Notes
    - Uses safe DDL operations with existence checks
*/

DO $$ 
BEGIN
  -- First check if the lowercase column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'imageurl'
  ) THEN
    -- Rename it to the correct case
    ALTER TABLE businesses RENAME COLUMN imageurl TO "imageUrl";
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'imageUrl'
  ) THEN
    -- If neither exists, add the column
    ALTER TABLE businesses ADD COLUMN "imageUrl" text;
  END IF;
END $$;