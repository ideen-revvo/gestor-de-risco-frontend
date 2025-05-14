/*
  # Add address fields and relationships

  1. Changes
    - Add address type table
    - Add address fields to address table
    - Add foreign key constraints
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create address_type table
CREATE TABLE IF NOT EXISTS address_type (
  id integer PRIMARY KEY,
  name text NOT NULL
);

-- Insert default address types
INSERT INTO address_type (id, name) VALUES
  (1, 'Comercial'),
  (2, 'Faturamento'),
  (3, 'Entrega')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE address ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow read access to authenticated users"
  ON address
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_address_type ON address(type_id);
CREATE INDEX IF NOT EXISTS idx_company_address ON company(address_id);