/*
  # Add address fields and relationships

  1. Changes
    - Add address type table
    - Add address table with all required fields
    - Add foreign key constraints
    - Add indexes for performance

  2. Security
    - Enable RLS on both tables
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

-- Create address table
CREATE TABLE IF NOT EXISTS address (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id integer REFERENCES address_type(id),
  street text,
  num text,
  compl text,
  zcode text,
  county text,
  city text,
  state text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE address_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE address ENABLE ROW LEVEL SECURITY;

-- Add policies for address_type
CREATE POLICY "Allow read access to authenticated users for address types"
  ON address_type
  FOR SELECT
  TO authenticated
  USING (true);

-- Add policies for address
CREATE POLICY "Allow read access to authenticated users for addresses"
  ON address
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_address_type ON address(type_id);
CREATE INDEX IF NOT EXISTS idx_company_address ON company(address_id);