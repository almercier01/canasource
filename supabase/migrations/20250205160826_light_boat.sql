/*
  # Clear all business data

  1. Changes
    - Safely delete all data from business-related tables
    - Preserve table structures and relationships
    - Reset sequences
*/

-- Delete data in the correct order to respect foreign key constraints
DELETE FROM business_images;
DELETE FROM business_comments;
DELETE FROM business_reports;
DELETE FROM businesses;

-- Reset sequences if any tables use them
ALTER SEQUENCE IF EXISTS business_images_id_seq RESTART;
ALTER SEQUENCE IF EXISTS business_comments_id_seq RESTART;
ALTER SEQUENCE IF EXISTS business_reports_id_seq RESTART;
ALTER SEQUENCE IF EXISTS businesses_id_seq RESTART;