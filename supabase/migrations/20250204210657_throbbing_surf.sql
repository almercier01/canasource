/*
  # Add listing reports functionality

  1. New Tables
    - `listing_reports`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `reporter_id` (uuid, references auth.users)
      - `reason` (text)
      - `details` (text)
      - `status` (text) - pending/reviewed/dismissed
      - `created_at` (timestamp)
      - `reviewed_at` (timestamp)
      - `reviewed_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `listing_reports` table
    - Add policies for authenticated users to create reports
    - Add policies for admin to read and update reports
*/

CREATE TABLE IF NOT EXISTS listing_reports (
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