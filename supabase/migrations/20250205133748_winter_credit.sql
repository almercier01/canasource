/*
  # Fix Business Comments Table

  1. Changes
    - Ensure business_comments table exists with proper structure
    - Reset and recreate RLS policies
    - Add necessary indexes
*/

-- First check if table exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_comments') THEN
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_business_comments_business_id ON business_comments(business_id);
    CREATE INDEX IF NOT EXISTS idx_business_comments_user_id ON business_comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_business_comments_status ON business_comments(status);
    CREATE INDEX IF NOT EXISTS idx_business_comments_created_at ON business_comments(created_at DESC);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active comments" ON business_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON business_comments;
DROP POLICY IF EXISTS "Admin can manage all comments" ON business_comments;

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