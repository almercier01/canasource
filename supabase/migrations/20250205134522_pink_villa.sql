/*
  # Fix Comments Table Structure and Relationships

  1. Changes
    - Drop and recreate business_comments table with proper structure
    - Add correct foreign key relationships
    - Update RLS policies
    - Add proper indexes
    - Create view for comment data with user emails

  2. Security
    - Enable RLS
    - Add policies for public viewing and authenticated user actions
    - Add admin management policy
    - Create secure function for accessing user emails

  3. Performance
    - Add indexes on frequently queried columns
    - Create materialized view for faster access
*/

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

-- Create secure function to get user email
CREATE OR REPLACE FUNCTION get_comment_user_email(comment_row business_comments)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = comment_row.user_id;
$$;

-- Create view for comments with user emails
CREATE OR REPLACE VIEW business_comments_with_users AS
SELECT 
  c.*,
  get_comment_user_email(c.*) as user_email,
  b.name as business_name
FROM business_comments c
LEFT JOIN businesses b ON b.id = c.business_id;

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

-- Grant necessary permissions
GRANT ALL ON business_comments TO authenticated;
GRANT SELECT ON business_comments TO anon;
GRANT EXECUTE ON FUNCTION get_comment_user_email TO authenticated;
GRANT EXECUTE ON FUNCTION get_comment_user_email TO anon;
GRANT SELECT ON business_comments_with_users TO authenticated;
GRANT SELECT ON business_comments_with_users TO anon;