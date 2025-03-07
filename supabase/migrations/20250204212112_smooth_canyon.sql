/*
  # Fix listing reports table

  1. Changes
    - Consolidate all listing_reports table changes into a single migration
    - Ensure proper table structure and constraints
    - Add all necessary indexes
    - Set up proper RLS policies

  2. Security
    - Enable RLS
    - Add policies for authenticated users to create reports
    - Add policies for admin to manage reports
*/

-- First, drop the table if it exists to start fresh
DROP TABLE IF EXISTS listing_reports;

-- Create the table with all required fields
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

-- Enable RLS
ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can create reports"
  ON listing_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON listing_reports
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id OR 
    auth.jwt() ->> 'email' = 'admin@test.com'
  );

CREATE POLICY "Admin can update reports"
  ON listing_reports
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@test.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@test.com');

-- Add indexes for better performance
CREATE INDEX idx_listing_reports_status ON listing_reports(status);
CREATE INDEX idx_listing_reports_business_id ON listing_reports(business_id);
CREATE INDEX idx_listing_reports_reporter_id ON listing_reports(reporter_id);
CREATE INDEX idx_listing_reports_created_at ON listing_reports(created_at DESC);