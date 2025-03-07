/*
  # Add email column to businesses table

  1. Changes
    - Add `email` column to `businesses` table for contact information
    - Column is optional to allow flexibility in contact methods

  2. Notes
    - Uses DO block for safe column addition
    - Maintains existing data integrity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'email'
  ) THEN
    ALTER TABLE businesses ADD COLUMN email text;
  END IF;
END $$;