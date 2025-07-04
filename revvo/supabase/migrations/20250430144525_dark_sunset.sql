/*
  # Add new fields to company table

  1. Changes
    - Add address, phone and email columns to company table
    - Make fields optional to maintain compatibility
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to company table
ALTER TABLE company 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_doc_num ON company(doc_num);
CREATE INDEX IF NOT EXISTS idx_company_email ON company(email);