/*
  # Create view for sale orders

  1. Changes
    - Include status column in view
    - Update view to match table structure
*/

CREATE OR REPLACE VIEW sale_orders_with_customer AS
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