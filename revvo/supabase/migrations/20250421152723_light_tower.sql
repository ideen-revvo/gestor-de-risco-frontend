/*
  # Add invoice details and installments

  1. New Tables
    - `invoice`: Invoice records
      - `id` (uuid, primary key)
      - `sale_order_id` (uuid, foreign key)
      - `number` (text)
      - `total_amount` (decimal)
      - `due_date` (date)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `invoice_installment`: Invoice installment records
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key)
      - `number` (text)
      - `amount` (decimal)
      - `due_date` (date)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create invoice table
CREATE TABLE invoice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_order_id uuid REFERENCES sale_orders(id),
  number text NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('em dia', 'em atraso')),
  created_at timestamptz DEFAULT now()
);

-- Create invoice_installment table
CREATE TABLE invoice_installment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoice(id),
  number text NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('em dia', 'em atraso')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_installment ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow read access to authenticated users"
  ON invoice
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users"
  ON invoice_installment
  FOR SELECT
  TO authenticated
  USING (true);

-- Create view for order details
CREATE OR REPLACE VIEW vw_order_details AS
SELECT 
  so.id as order_id,
  so.created_at as order_date,
  so.customer_id,
  c.name as customer_name,
  so.total_amt as order_amount,
  i.id as invoice_id,
  i.number as invoice_number,
  i.total_amount as invoice_amount,
  i.due_date as invoice_due_date,
  i.status as invoice_status,
  COALESCE(i.status = 'em dia', false) as approved
FROM sale_orders so
LEFT JOIN customer c ON c.id = so.customer_id
LEFT JOIN invoice i ON i.sale_order_id = so.id;