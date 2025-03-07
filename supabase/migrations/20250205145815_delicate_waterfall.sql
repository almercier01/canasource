/*
  # Add Image URL Column to Businesses Table

  1. Changes
    - Adds imageUrl column to businesses table
    - Makes it nullable to support existing records
  
  2. Notes
    - Uses DO block to safely add column if it doesn't exist
    - No data migration needed as new column is nullable
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'imageurl'
  ) THEN
    ALTER TABLE businesses ADD COLUMN imageUrl text;
  END IF;
END $$;