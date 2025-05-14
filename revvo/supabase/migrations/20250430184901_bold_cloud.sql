/*
  # Fix user invite permissions

  1. Changes
    - Drop incorrect policy that references non-existent table
    - Add policy to allow admins to manage users
    - Add policy for user invites

  2. Security
    - Ensure only admins can invite users
    - Maintain existing RLS policies
*/

-- Drop incorrect policy if it exists
DROP POLICY IF EXISTS "Allow admin users to invite" ON auth.users_invite;

-- Create policy on user_profile table for managing users
CREATE POLICY "Allow admins to manage users"
  ON public.user_profile
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );