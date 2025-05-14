/*
  # Fix view definition for order details

  1. Changes
    - Drop existing view if it exists
    - Recreate view with correct column types
    - Update foreign key references to match table definitions

  2. Security
    - Enable RLS on view
    - Add policy for authenticated users
*/

-- Drop existing view if it exists
DROP VIEW IF EXISTS vw_order_details;

-- Create view with correct column types
CREATE OR REPLACE VIEW vw_order_details AS
SELECT 
  so.id as order_id,
  so.created_at as order_date,
  so.customer_id,
  c.name as customer_name,
  so.total_amt as order_amount,
  i.id as invoice_id,
  i.number as invoice_number,
  i.total_amount as invoice_amount,
  i.due_date as invoice_due_date,
  i.status as invoice_status,
  COALESCE(i.status = 'em dia', false) as approved
FROM sale_orders so
LEFT JOIN customer c ON c.id = so.customer_id
LEFT JOIN invoice i ON i.sale_order_id = so.id::uuid;

-- Set security on view
ALTER VIEW vw_order_details SET (security_invoker = true);

-- Add policy for authenticated users
CREATE POLICY "Allow read access to authenticated users"
  ON vw_order_details
  FOR SELECT
  TO authenticated
  USING (true);