/*
  # Update Businesses Table for Optional Fields

  1. Changes
    - Make website, phone, services, products fields nullable
    - Add default empty array for products and services
    - Add default NULL for website and phone
  
  2. Security
    - No security changes required
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Update website to allow NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'website'
  ) THEN
    ALTER TABLE businesses ALTER COLUMN website DROP NOT NULL;
  END IF;

  -- Update phone to allow NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'phone'
  ) THEN
    ALTER TABLE businesses ALTER COLUMN phone DROP NOT NULL;
  END IF;

  -- Update products to allow NULL and set default empty array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'products'
  ) THEN
    ALTER TABLE businesses 
      ALTER COLUMN products DROP NOT NULL,
      ALTER COLUMN products SET DEFAULT '{}';
  END IF;

  -- Update services to allow NULL and set default empty array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'services'
  ) THEN
    ALTER TABLE businesses 
      ALTER COLUMN services DROP NOT NULL,
      ALTER COLUMN services SET DEFAULT '{}';
  END IF;

  -- Update email to allow NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'email'
  ) THEN
    ALTER TABLE businesses ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;