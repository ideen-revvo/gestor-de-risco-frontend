/*
  # Add customer name to sales_order view

  1. New Tables
    - Create sales_order table if it doesn't exist
    - Create customer table if it doesn't exist

  2. View Changes
    - Create a view that joins sales_order with customer to get the customer name
    - Add policies for the view

  3. Security
    - Enable RLS on the tables and view
    - Add policies for authenticated users
*/

-- Create sales_order table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  customer_id uuid REFERENCES customer(id),
  company_id uuid NOT NULL,
  total_qtt integer DEFAULT 0,
  total_amt decimal(10,2) DEFAULT 0,
  due_date date,
  status text DEFAULT 'Pendente'
);

-- Create customer table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid NOT NULL
);

-- Enable RLS on tables
ALTER TABLE sales_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

-- Create the view
CREATE OR REPLACE VIEW sales_order_with_customer AS
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
CREATE POLICY "Allow read access to authenticated users on sales_order"
  ON sales_order
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users on customer"
  ON customer
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users on view"
  ON sales_order_with_customer
  FOR SELECT
  TO authenticated
  USING (true);