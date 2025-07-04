/*
  # Update monthly billing view with customer filtering

  1. Changes
    - Add customer_id to the view for filtering
    - Maintain existing grouping by month and company
    - Keep corporate_group_id for group-level aggregation
    
  2. Security
    - Maintain existing security settings
    - Keep RLS policies
*/

-- Drop and recreate the view with customer_id
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
WITH monthly_data AS (
  SELECT
    date_trunc('month', so.created_at) as month,
    so.company_id,
    so.customer_id,
    COALESCE(SUM(so.total_amt), 0) as total_amount,
    COUNT(*) as total_orders
  FROM sale_orders so
  GROUP BY 1, 2, 3
)
SELECT 
  md.month,
  md.customer_id,
  md.total_amount,
  md.total_orders,
  c.corporate_group_id
FROM monthly_data md
JOIN company c ON c.id = md.company_id;

-- Maintain security settings
ALTER VIEW vw_faturamento_mensal SET (security_invoker = true);

-- Ensure policy exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'vw_faturamento_mensal' 
    AND policyname = 'Allow read access to authenticated users'
  ) THEN
    CREATE POLICY "Allow read access to authenticated users"
      ON vw_faturamento_mensal
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;