/*
  # Remove address_type table and references

  1. Changes
    - Drop foreign key constraint from address table
    - Drop address_type table
    - Drop type_id column from address table
    - Update existing policies
*/

-- Drop foreign key constraint
ALTER TABLE address
DROP CONSTRAINT IF EXISTS address_type_id_fkey;

-- Drop type_id column from address
ALTER TABLE address
DROP COLUMN IF EXISTS type_id;

-- Drop address_type table
DROP TABLE IF EXISTS address_type;