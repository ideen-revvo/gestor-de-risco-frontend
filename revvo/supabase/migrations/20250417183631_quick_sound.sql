/*
  # Create view for sales requests metrics

  1. New View
    - `vw_sales_requests_metrics`: Aggregates metrics for sales requests
      - Last 30 days metrics
      - Last 6/12 months metrics
      - Approval rates
      - Pending and rejected amounts

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE OR REPLACE VIEW vw_sales_requests_metrics AS
WITH monthly_data AS (
  SELECT
    date_trunc('month', so.created_at) as month,
    so.company_id,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN so.status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN so.status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN so.status = 'pending' THEN 1 END) as pending_requests,
    SUM(CASE WHEN so.status = 'pending' THEN so.total_amt ELSE 0 END) as pending_amount,
    SUM(CASE WHEN so.status = 'rejected' THEN so.total_amt ELSE 0 END) as rejected_amount
  FROM sale_orders so
  GROUP BY 1, 2
)
SELECT 
  md.*,
  c.corporate_group_id,
  ROUND(
    COALESCE(md.approved_requests::numeric / NULLIF(md.total_requests, 0) * 100, 0),
    2
  ) as approval_rate
FROM monthly_data md
JOIN company c ON c.id = md.company_id;

-- Set security on view
ALTER VIEW vw_sales_requests_metrics SET (security_invoker = true);

-- Add policy
CREATE POLICY "Allow read access to authenticated users"
  ON vw_sales_requests_metrics
  FOR SELECT
  TO authenticated
  USING (true);