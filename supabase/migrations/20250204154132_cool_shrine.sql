/*
  # Create businesses table

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description_en` (text)
      - `description_fr` (text)
      - `category` (text)
      - `province` (text)
      - `city` (text)
      - `lat` (double precision)
      - `lng` (double precision)
      - `rating` (decimal)
      - `review_count` (integer)
      - `products` (text[])
      - `services` (text[])
      - `website` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `owner_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `businesses` table
    - Add policies for:
      - Public read access
      - Authenticated users can create their own businesses
      - Business owners can update their own businesses
*/

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description_en text NOT NULL,
  description_fr text NOT NULL,
  category text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  rating decimal DEFAULT 0,
  review_count integer DEFAULT 0,
  products text[] DEFAULT '{}',
  services text[] DEFAULT '{}',
  website text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Businesses are viewable by everyone"
  ON businesses
  FOR SELECT
  USING (true);

-- Allow authenticated users to create businesses
CREATE POLICY "Users can create their own businesses"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow business owners to update their businesses
CREATE POLICY "Users can update their own businesses"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);