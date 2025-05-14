/*
  # Fix user invite policy

  1. Changes
    - Drop incorrect policy that references non-existent table
    - Create RLS policy on user_profile table to control who can manage users
    - Add policy to allow admins to manage users

  2. Security
    - Only allow role_id = 1 (admin) to manage users
*/

-- Drop incorrect policy if it exists
DROP POLICY IF EXISTS "Allow admin users to invite" ON auth.users_invite;

-- Create policy on user_profile table instead
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
  );