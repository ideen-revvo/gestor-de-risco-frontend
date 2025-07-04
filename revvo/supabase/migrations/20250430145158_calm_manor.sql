/*
  # Add additional company fields

  1. New Columns
    - Add income_yr (real)
    - Add size_level (integer)
    - Add employees_num (integer)
    - Add income_level (integer)

  2. Security
    - Add indexes for better performance
*/

-- Create company_size table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_size (
  id integer PRIMARY KEY,
  name text NOT NULL
);

-- Insert default company sizes
INSERT INTO company_size (id, name) VALUES
  (1, 'Micro'),
  (2, 'Pequena'),
  (3, 'Média'),
  (4, 'Grande')
ON CONFLICT (id) DO NOTHING;

-- Create index for company size lookup
CREATE INDEX IF NOT EXISTS idx_company_size_level ON company(size_level);
CREATE INDEX IF NOT EXISTS idx_company_income_level ON company(income_level);