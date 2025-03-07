/*
  # Add Comments System

  1. New Tables
    - `business_comments`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `created_at` (timestamp)
      - `status` (text) - 'active', 'hidden', or 'deleted'

  2. Security
    - Enable RLS on `business_comments` table
    - Add policies for:
      - Public can read active comments
      - Authenticated users can create comments
      - Admin can manage all comments
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS business_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted'))
);

-- Enable RLS
ALTER TABLE business_comments ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Indexes for better performance
CREATE INDEX idx_business_comments_business_id ON business_comments(business_id);
CREATE INDEX idx_business_comments_status ON business_comments(status);
CREATE INDEX idx_business_comments_created_at ON business_comments(created_at DESC);