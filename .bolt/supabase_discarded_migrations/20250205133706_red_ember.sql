/*
  # Add Business Comments Table

  1. New Tables
    - business_comments
      - id (uuid, primary key)
      - business_id (uuid, foreign key to businesses)
      - user_id (uuid, foreign key to auth.users)
      - content (text)
      - created_at (timestamp)
      - status (text)

  2. Changes
    - Add table if it doesn't exist
    - Add foreign key constraints
    - Add status check constraint
    - Add performance indexes
*/

DO $$ 
BEGIN
  -- Create the table if it doesn't exist
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

    -- Create indexes for better performance
    CREATE INDEX idx_business_comments_business_id ON business_comments(business_id);
    CREATE INDEX idx_business_comments_user_id ON business_comments(user_id);
    CREATE INDEX idx_business_comments_status ON business_comments(status);
    CREATE INDEX idx_business_comments_created_at ON business_comments(created_at DESC);
  END IF;

  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_comments' AND policyname = 'Public can view active comments'
  ) THEN
    CREATE POLICY "Public can view active comments"
      ON business_comments
      FOR SELECT
      USING (status = 'active');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_comments' AND policyname = 'Authenticated users can create comments'
  ) THEN
    CREATE POLICY "Authenticated users can create comments"
      ON business_comments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_comments' AND policyname = 'Admin can manage all comments'
  ) THEN
    CREATE POLICY "Admin can manage all comments"
      ON business_comments
      FOR ALL
      TO authenticated
      USING (auth.jwt() ->> 'email' = 'admin@test.com');
  END IF;
END $$;