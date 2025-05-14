/*
  # Fix admin invite policy

  1. Changes
    - Drop incorrect policy on auth.users
    - Create policy on auth.users_invite
    - Add proper check for admin role

  2. Security
    - Only allow admins (role_id = 1) to invite users
*/

-- Drop incorrect policy if it exists
DROP POLICY IF EXISTS "Allow admin users to invite" ON auth.users;

-- Create policy on auth.users_invite instead
CREATE POLICY "Allow admin users to invite"
  ON auth.users_invite
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );