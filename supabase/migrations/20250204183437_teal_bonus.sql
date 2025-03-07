/*
  # Add address column to businesses table

  1. Changes
    - Add `address` column to `businesses` table for storing street addresses
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'address'
  ) THEN
    ALTER TABLE businesses ADD COLUMN address text;
  END IF;
END $$;