/*
  # Fix user invitation system

  1. Changes
    - Create user_invite table to track invitations
    - Add policies for admin users
    - Add helper functions for invitation management

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create user_invite table
CREATE TABLE IF NOT EXISTS user_invite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  company_id bigint NOT NULL REFERENCES company(id),
  role_id integer,
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(email, company_id)
);

-- Enable RLS
ALTER TABLE user_invite ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users
CREATE POLICY "Allow admins to manage invites"
  ON user_invite
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );