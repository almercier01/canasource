/*
  # Make coordinates optional in businesses table

  1. Changes
    - Make lat and lng columns nullable in businesses table
    - This allows businesses to be registered without coordinates

  2. Rationale
    - Some businesses may not need or want to specify exact coordinates
    - Coordinates can be added later if needed
*/

ALTER TABLE businesses 
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lng DROP NOT NULL;