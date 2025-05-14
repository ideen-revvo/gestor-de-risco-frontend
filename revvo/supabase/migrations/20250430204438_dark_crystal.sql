/*
  # Fix user invite permissions

  1. Changes
    - Add policy to allow users to create invites
    - Add policy to allow users to accept invites
    - Add policy to allow users to view their own invites
    - Enable RLS on user_invite table

  2. Security
    - Only allow authenticated users to manage invites
    - Restrict invite acceptance to invited users
*/

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to invite" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated users to create invites" ON user_invite;
DROP POLICY IF EXISTS "Allow users to accept invites" ON user_invite;

-- Create policy to allow authenticated users to create invites
CREATE POLICY "Allow authenticated users to create invites"
  ON user_invite
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );

-- Create policy to allow users to view their own invites
CREATE POLICY "Allow users to view their own invites"
  ON user_invite
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 FROM user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );

-- Create policy to allow users to accept their own invites
CREATE POLICY "Allow users to accept their own invites"
  ON user_invite
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- Enable RLS on user_invite if not already enabled
ALTER TABLE user_invite ENABLE ROW LEVEL SECURITY;