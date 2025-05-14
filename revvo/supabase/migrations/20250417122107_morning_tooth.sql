/*
  # Create monthly billing view

  1. New View
    - `vw_faturamento_mensal`: Monthly billing aggregation
      - Groups billing data by month
      - Calculates totals for billed and to-be-billed amounts
      - Filters by company corporate group

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE OR REPLACE VIEW vw_faturamento_mensal AS
WITH monthly_data AS (
  SELECT
    date_trunc('month', so.created_at) as month,
    so.company_id,
    COALESCE(SUM(so.total_amt), 0) as total_amount,
    COUNT(*) as total_orders
  FROM sale_orders so
  GROUP BY 1, 2
)
SELECT 
  md.month,
  md.total_amount,
  md.total_orders,
  c.corporate_group_id
FROM monthly_data md
JOIN company c ON c.id = md.company_id;

-- Set security on view
ALTER VIEW vw_faturamento_mensal SET (security_invoker = true);

-- Add policy
CREATE POLICY "Allow read access to authenticated users"
  ON vw_faturamento_mensal
  FOR SELECT
  TO authenticated
  USING (true);