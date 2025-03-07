-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS business_comments CASCADE;

CREATE TABLE business_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted'))
);

-- Enable RLS
ALTER TABLE business_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_business_comments_business_id ON business_comments(business_id);
CREATE INDEX idx_business_comments_user_id ON business_comments(user_id);
CREATE INDEX idx_business_comments_status ON business_comments(status);
CREATE INDEX idx_business_comments_created_at ON business_comments(created_at DESC);

-- Create policies
CREATE POLICY "Anyone can view active comments"
  ON business_comments
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can create comments"
  ON business_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON business_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all comments"
  ON business_comments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@test.com');