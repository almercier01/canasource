/*
  # Add Listing Reports Table

  1. New Tables
    - listing_reports
      - id (uuid, primary key)
      - business_id (uuid, foreign key to businesses)
      - reporter_id (uuid, foreign key to auth.users)
      - reason (text)
      - details (text)
      - status (text)
      - created_at (timestamp)
      - reviewed_at (timestamp)
      - reviewed_by (uuid, foreign key to auth.users)

  2. Changes
    - Add table if it doesn't exist
    - Add foreign key constraints
    - Add status check constraint
*/

-- Create the table if it doesn't exist
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

    -- Add indexes for better performance
    CREATE INDEX idx_listing_reports_status ON listing_reports(status);
    CREATE INDEX idx_listing_reports_business_id ON listing_reports(business_id);
    CREATE INDEX idx_listing_reports_reporter_id ON listing_reports(reporter_id);
    CREATE INDEX idx_listing_reports_created_at ON listing_reports(created_at DESC);
  END IF;
END $$;