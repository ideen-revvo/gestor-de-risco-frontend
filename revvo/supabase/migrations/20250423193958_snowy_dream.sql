/*
  # Fix billing view and data formatting

  1. Changes
    - Drop and recreate view with proper date formatting
    - Add proper aggregation for monthly totals
    - Fix column types and calculations

  2. Security
    - Maintain existing security settings
*/

-- Drop existing view
DROP VIEW IF EXISTS vw_faturamento_mensal;

-- Create view with proper formatting
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
WITH monthly_data AS (
  SELECT
    date_trunc('month', so.created_at) as month,
    so.company_id,
    so.customer_id,
    COALESCE(SUM(so.total_amt), 0) as total_amount
  FROM sale_orders so
  GROUP BY 1, 2, 3
)
SELECT 
  md.month,
  md.customer_id,
  md.total_amount as value,
  c.corporate_group_id,
  to_char(md.month, 'Mon/YY') as formatted_month
FROM monthly_data md
JOIN company c ON c.id = md.company_id
ORDER BY md.month ASC;

-- Set security on view
ALTER VIEW vw_faturamento_mensal SET (security_invoker = true);

-- Add policy
CREATE POLICY "Allow read access to authenticated users"
  ON vw_faturamento_mensal
  FOR SELECT
  TO authenticated
  USING (true);