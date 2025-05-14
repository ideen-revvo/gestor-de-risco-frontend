/*
  # Create credit limit policies table and view

  1. New Tables
    - `credit_limit_policies`: Credit limit policy records
      - `id` (uuid, primary key)
      - `name` (text)
      - `min_amount` (decimal)
      - `max_amount` (decimal)
      - `approval_roles` (text[])
      - `company_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE credit_limit_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_amount decimal(15,2) NOT NULL,
  max_amount decimal(15,2) NOT NULL,
  approval_roles text[] NOT NULL,
  company_id uuid REFERENCES company(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT min_less_than_max CHECK (min_amount <= max_amount)
);

ALTER TABLE credit_limit_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
  ON credit_limit_policies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert to authenticated users"
  ON credit_limit_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update to authenticated users"
  ON credit_limit_policies
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete to authenticated users"
  ON credit_limit_policies
  FOR DELETE
  TO authenticated
  USING (true);