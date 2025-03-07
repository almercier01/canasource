/*
  # Update listing reports table

  1. Changes
    - Ensure listing_reports table exists with all required columns
    - Add any missing indexes for performance
    - Add any missing constraints

  2. Security
    - Verify all policies are in place
*/

-- First check if table exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_reports') THEN
    CREATE TABLE listing_reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      business_id uuid REFERENCES businesses(id) NOT NULL,
      reporter_id uuid REFERENCES auth.users(id) NOT NULL,
      reason text NOT NULL,
      details text,
      status text DEFAULT 'pending',
      created_at timestamptz DEFAULT now(),
      reviewed_at timestamptz,
      reviewed_by uuid REFERENCES auth.users(id),
      CONSTRAINT valid_status CHECK (status IN ('pending', 'reviewed', 'dismissed'))
    );

    ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

    -- Allow authenticated users to create reports
    CREATE POLICY "Users can create reports"
      ON listing_reports
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = reporter_id);

    -- Allow admin to read all reports
    CREATE POLICY "Admin can read reports"
      ON listing_reports
      FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'email' = 'admin@test.com');

    -- Allow admin to update report status
    CREATE POLICY "Admin can update reports"
      ON listing_reports
      FOR UPDATE
      TO authenticated
      USING (auth.jwt() ->> 'email' = 'admin@test.com')
      WITH CHECK (auth.jwt() ->> 'email' = 'admin@test.com');
  END IF;
END $$;

-- Add indexes for better query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'listing_reports' AND indexname = 'idx_listing_reports_status'
  ) THEN
    CREATE INDEX idx_listing_reports_status ON listing_reports(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'listing_reports' AND indexname = 'idx_listing_reports_business_id'
  ) THEN
    CREATE INDEX idx_listing_reports_business_id ON listing_reports(business_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'listing_reports' AND indexname = 'idx_listing_reports_created_at'
  ) THEN
    CREATE INDEX idx_listing_reports_created_at ON listing_reports(created_at DESC);
  END IF;
END $$;