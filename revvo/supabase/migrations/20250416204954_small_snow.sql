/*
  # Add customer name to sales_order view

  1. Changes
    - Create a view that joins sales_order with customer to get the customer name
    - Add policies for the view

  2. Security
    - Enable RLS on the view
    - Add policy for authenticated users
*/

CREATE VIEW sales_order_with_customer AS
SELECT 
  so.*,
  c.name as customer_name
FROM sales_order so
LEFT JOIN customer c ON c.id = so.customer_id;

ALTER VIEW sales_order_with_customer SET (security_invoker = true);

CREATE POLICY "Allow read access to authenticated users"
  ON sales_order_with_customer
  FOR SELECT
  TO authenticated
  USING (true);