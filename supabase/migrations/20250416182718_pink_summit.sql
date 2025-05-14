/*
  # Create tables for customer management

  1. New Tables
    - `corporate_group`: Groups of companies
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `company`: Individual companies
      - `id` (uuid, primary key)
      - `name` (text)
      - `corporate_group_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `customer`: Customer records
      - `id` (uuid, primary key)
      - `name` (text)
      - `company_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create corporate_group table
CREATE TABLE IF NOT EXISTS corporate_group (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE corporate_group ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users"
  ON corporate_group
  FOR SELECT
  TO authenticated
  USING (true);

-- Create company table
CREATE TABLE IF NOT EXISTS company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  corporate_group_id uuid REFERENCES corporate_group(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE company ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users"
  ON company
  FOR SELECT
  TO authenticated
  USING (true);

-- Create customer table
CREATE TABLE IF NOT EXISTS customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES company(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users"
  ON customer
  FOR SELECT
  TO authenticated
  USING (true);