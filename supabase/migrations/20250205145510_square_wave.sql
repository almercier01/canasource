/*
  # Business Reports Schema Update

  1. New Table
    - Creates business_reports table for tracking listing reports
    - Adds status tracking and review process
    - Links reports to businesses and users
  
  2. Security
    - Enables RLS
    - Adds policies for creating and managing reports
    - Sets up secure view for admin dashboard
*/

-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS business_reports CASCADE;

CREATE TABLE business_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN (
    'misleading_info',
    'inappropriate_content',
    'fake_business',
    'offensive_content',
    'spam',
    'wrong_category',
    'closed_business',
    'duplicate_listing',
    'wrong_location',
    'other'
  )),
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE business_reports ENABLE ROW LEVEL SECURITY;

-- Create secure function to get reporter email
CREATE OR REPLACE FUNCTION get_reporter_email(report_row business_reports)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = report_row.reporter_id;
$$;

-- Create view for reports with user emails and business names
CREATE OR REPLACE VIEW business_reports_with_details AS
SELECT 
  r.*,
  get_reporter_email(r.*) as reporter_email,
  b.name as business_name
FROM business_reports r
LEFT JOIN businesses b ON b.id = r.business_id;

-- Create policies
CREATE POLICY "Authenticated users can create reports"
  ON business_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON business_reports
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id OR 
    auth.jwt() ->> 'email' = 'admin@test.com'
  );

CREATE POLICY "Admin can manage reports"
  ON business_reports
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@test.com');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_reports_business_id ON business_reports(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reports_status ON business_reports(status);
CREATE INDEX IF NOT EXISTS idx_business_reports_created_at ON business_reports(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON business_reports TO authenticated;
GRANT EXECUTE ON FUNCTION get_reporter_email TO authenticated;
GRANT SELECT ON business_reports_with_details TO authenticated;