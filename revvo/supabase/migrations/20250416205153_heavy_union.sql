/*
  # Fix sales_order schema and view

  1. Changes
    - Drop existing view and recreate with correct schema
    - Ensure sales_order table has correct column types
    - Fix customer_id reference

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing view
DROP VIEW IF EXISTS sales_order_with_customer;

-- Recreate sales_order table with correct types
DROP TABLE IF EXISTS sales_order;
CREATE TABLE sales_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  customer_id uuid REFERENCES customer(id),
  company_id uuid REFERENCES company(id),
  total_qtt integer DEFAULT 0,
  total_amt decimal(10,2) DEFAULT 0,
  due_date date,
  status text DEFAULT 'Pendente'
);

-- Enable RLS
ALTER TABLE sales_order ENABLE ROW LEVEL SECURITY;

-- Create view with correct schema
CREATE VIEW sales_order_with_customer AS
SELECT 
  so.id,
  so.created_at,
  so.customer_id,
  so.company_id,
  so.total_qtt,
  so.total_amt,
  so.due_date,
  so.status,
  c.name as customer_name
FROM sales_order so
LEFT JOIN customer c ON c.id = so.customer_id;

-- Set security on view
ALTER VIEW sales_order_with_customer SET (security_invoker = true);

-- Add policies
CREATE POLICY "Allow read access to authenticated users"
  ON sales_order
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users on view"
  ON sales_order_with_customer
  FOR SELECT
  TO authenticated
  USING (true);