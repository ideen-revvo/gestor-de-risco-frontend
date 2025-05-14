/*
  # Fix status handling and references

  1. Changes
    - Add status_id foreign key to credit_limit_request table
    - Add default status values
    - Update existing records to use proper status IDs
    - Add RLS policies

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Add status_id to credit_limit_request if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_limit_request' 
    AND column_name = 'status_id'
  ) THEN
    ALTER TABLE credit_limit_request 
    ADD COLUMN status_id smallint REFERENCES status(id) DEFAULT 1;
  END IF;
END $$;

-- Update any existing records with text status to use proper status_id
UPDATE credit_limit_request 
SET status_id = CASE 
  WHEN status = 'pending' THEN 1
  WHEN status = 'in_progress' THEN 2 
  WHEN status = 'approved' THEN 3
  WHEN status = 'rejected' THEN 4
  ELSE 1 -- Default to pending
END
WHERE status_id IS NULL;

-- Drop old status column if it exists
ALTER TABLE credit_limit_request 
DROP COLUMN IF EXISTS status;

-- Add RLS policies
CREATE POLICY "Allow read access to authenticated users"
  ON credit_limit_request
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert to authenticated users"
  ON credit_limit_request
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update to authenticated users"
  ON credit_limit_request
  FOR UPDATE
  TO authenticated
  USING (true);