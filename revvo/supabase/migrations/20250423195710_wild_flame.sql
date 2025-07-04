/*
  # Fix billing view and add status column

  1. Changes
    - Add status column to sale_orders table
    - Update view to include proper formatting and calculations
    - Fix data types and aggregations

  2. Security
    - Maintain existing security settings
*/

-- Add status column to sale_orders if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sale_orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE sale_orders ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- Drop and recreate the view with proper formatting
DROP VIEW IF EXISTS vw_faturamento_mensal;

CREATE VIEW vw_faturamento_mensal AS
WITH monthly_data AS (
  SELECT
    date_trunc('month', so.created_at) as month,
    so.company_id,
    so.customer_id,
    COALESCE(SUM(so.total_amt), 0) as total_amount,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN so.status = 'approved' THEN 1 END) as approved_orders
  FROM sale_orders so
  GROUP BY 1, 2, 3
)
SELECT 
  md.month,
  md.customer_id,
  md.total_amount as value,
  md.total_orders,
  md.approved_orders,
  c.corporate_group_id,
  to_char(md.month, 'Mon/YY') as formatted_month,
  ROUND(COALESCE(md.approved_orders::numeric / NULLIF(md.total_orders, 0) * 100, 0), 2) as approval_rate
FROM monthly_data md
JOIN company c ON c.id = md.company_id
ORDER BY md.month ASC;

-- Set security on view
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