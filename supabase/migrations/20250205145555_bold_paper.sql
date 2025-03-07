/*
  # Storage Setup for Business Images

  1. Storage Configuration
    - Creates a public bucket for business images
    - Sets up security policies for image management
  
  2. Security
    - Enables public read access
    - Restricts write access to authenticated users
    - Allows business owners to manage their images
*/

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'business-images' );

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-images'
);

CREATE POLICY "Business owners can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Business owners can delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);