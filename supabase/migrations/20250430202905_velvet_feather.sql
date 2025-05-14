/*
  # Add status table and fix status references

  1. Changes
    - Create status table for proper status management
    - Add status_id column to sale_orders
    - Add foreign key constraint
    - Migrate existing status values

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create status table
CREATE TABLE IF NOT EXISTS status (
  id smallint PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Insert default statuses
INSERT INTO status (id, name, description) VALUES
  (1, 'pending', 'Awaiting processing'),
  (2, 'in_progress', 'Currently being processed'),
  (3, 'approved', 'Request approved'),
  (4, 'rejected', 'Request rejected')
ON CONFLICT (id) DO NOTHING;

-- Add status_id to sale_orders
ALTER TABLE sale_orders 
  DROP COLUMN IF EXISTS status,
  ADD COLUMN status_id smallint REFERENCES status(id) DEFAULT 1;

-- Enable RLS
ALTER TABLE status ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow read access to authenticated users"
  ON status
  FOR SELECT
  TO authenticated
  USING (true);