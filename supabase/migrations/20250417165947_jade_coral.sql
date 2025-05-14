/*
  # Remove status column from sale_orders table

  1. Changes
    - Drop existing view
    - Drop status column from sale_orders table
    - Recreate view without status column
    - Add security policies

  2. Security
    - Maintain RLS on table
    - Add policies for authenticated users
*/

-- Drop existing view
DROP VIEW IF EXISTS sale_orders_with_customer;

-- Remove status column
ALTER TABLE sale_orders DROP COLUMN IF EXISTS status;

-- Recreate view without status column
CREATE OR REPLACE VIEW sale_orders_with_customer AS
SELECT 
  so.id,
  so.created_at,
  so.customer_id,
  so.company_id,
  so.total_qtt,
  so.total_amt,
  so.due_date,
  c.name as customer_name
FROM sale_orders so
LEFT JOIN customer c ON c.id = so.customer_id;

-- Set security on view
ALTER VIEW sale_orders_with_customer SET (security_invoker = true);

-- Add policy
CREATE POLICY "Allow read access to authenticated users"
  ON sale_orders_with_customer
  FOR SELECT
  TO authenticated
  USING (true);