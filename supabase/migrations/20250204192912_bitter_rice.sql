/*
  # Create contact messages table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `message` (text, not null)
      - `created_at` (timestamptz, default now())
      - `status` (text, default 'pending')

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for public to create messages
    - Add policy for admin to read messages
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create contact messages
CREATE POLICY "Anyone can create contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admin can read messages
CREATE POLICY "Admin can read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@test.com');