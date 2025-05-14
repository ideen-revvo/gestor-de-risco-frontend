/*
  # Update view to use customer_id

  1. Changes
    - Update vw_faturamento_mensal view to use customer_id instead of cliente_id in faturas table
    - Maintain existing functionality but with corrected column name

  2. Security
    - Maintain existing security settings
*/

-- Drop and recreate the view with updated column reference
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
WITH monthly_data AS (
  SELECT
    date_trunc('month', f.dt_emissao) as month,
    f.company_id,
    COALESCE(SUM(f.valor_orig), 0) as total_amount,
    COUNT(*) as total_orders
  FROM faturas f
  GROUP BY 1, 2
)
SELECT 
  md.month,
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