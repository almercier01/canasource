/*
  # Fix Comment Relations

  1. Changes
    - Add foreign key references with proper naming
    - Add indexes for performance
*/

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_business_comments_business_id;
DROP INDEX IF EXISTS idx_business_comments_status;
DROP INDEX IF EXISTS idx_business_comments_created_at;

-- Recreate the table with proper references
CREATE TABLE IF NOT EXISTS business_comments_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted'))
);

-- Copy data if the old table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'business_comments') THEN
    INSERT INTO business_comments_new
    SELECT * FROM business_comments;
  END IF;
END $$;

-- Drop old table and rename new one
DROP TABLE IF EXISTS business_comments;
ALTER TABLE business_comments_new RENAME TO business_comments;

-- Enable RLS
ALTER TABLE business_comments ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Public can view active comments"
  ON business_comments
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can create comments"
  ON business_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all comments"
  ON business_comments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@test.com');

-- Create indexes for better performance
CREATE INDEX idx_business_comments_business_id ON business_comments(business_id);
CREATE INDEX idx_business_comments_user_id ON business_comments(user_id);
CREATE INDEX idx_business_comments_status ON business_comments(status);
CREATE INDEX idx_business_comments_created_at ON business_comments(created_at DESC);