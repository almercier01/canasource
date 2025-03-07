/*
  # Business Images Management

  1. New Tables
    - `business_images`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `url` (text, the image URL)
      - `status` (text, approval status)
      - `created_at` (timestamp)
      - `approved_at` (timestamp)
      - `approved_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `business_images` table
    - Add policies for image management
*/

CREATE TABLE business_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_business_images_business_id ON business_images(business_id);
CREATE INDEX idx_business_images_status ON business_images(status);
CREATE INDEX idx_business_images_created_at ON business_images(created_at DESC);

-- Create secure view for images with business details
CREATE OR REPLACE VIEW business_images_with_details AS
SELECT 
  i.*,
  b.name as business_name,
  b.owner_id as business_owner_id
FROM business_images i
LEFT JOIN businesses b ON b.id = i.business_id;

-- Create policies
CREATE POLICY "Anyone can view approved images"
  ON business_images
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Business owners can view their pending images"
  ON business_images
  FOR SELECT
  USING (
    status = 'pending' AND 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can submit images"
  ON business_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all images"
  ON business_images
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@test.com');

-- Grant necessary permissions
GRANT ALL ON business_images TO authenticated;
GRANT SELECT ON business_images TO anon;
GRANT SELECT ON business_images_with_details TO authenticated;