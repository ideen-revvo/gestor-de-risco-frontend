/*
  # Create view for order details with invoice information

  1. New View
    - `vw_detalhes_pedidos_faturas`: Order details with invoice information
      - Combines order, invoice and installment information
      - Includes approval status and invoice status
      - Latest due date from installments

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE OR REPLACE VIEW vw_detalhes_pedidos_faturas AS
WITH latest_due_date AS (
  SELECT 
    fat_id,
    MAX(dt_vcto) as last_due_date
  FROM parcelas_fat
  GROUP BY fat_id
)
SELECT DISTINCT ON (pb.pedido_id)
  pb.pedido_id as numero_pedido,
  pb.pedido_data,
  pb.customer_id as cliente_id,
  c.name as cliente_nome,
  pb.pedido_valor,
  pb.aprovado,
  pb.numero_fatura,
  pb.fatura_valor,
  pb.status_fatura,
  ldd.last_due_date as vencimento_final,
  pi.num_parcela,
  pi.parcela_valor,
  pi.dt_vcto as vencimento_parcela,
  pi.status_parcela
FROM pedido_base pb
LEFT JOIN customer c ON c.id = pb.cliente_id
LEFT JOIN latest_due_date ldd ON ldd.fat_id = pb.fatura_id
LEFT JOIN parcelas_info pi ON pi.fat_id = pb.fatura_id
ORDER BY pb.pedido_id, pb.pedido_data DESC;

-- Set security on view
ALTER VIEW vw_detalhes_pedidos_faturas SET (security_invoker = true);

-- Add policy
CREATE POLICY "Allow read access to authenticated users"
  ON vw_detalhes_pedidos_faturas
  FOR SELECT
  TO authenticated
  USING (true);