/*
  # Add RLS policy for admin invites

  1. Changes
    - Add policy to allow admins to invite users
    - Check role_id = 1 in user_profile table
    - Maintain existing security settings

  2. Security
    - Enable RLS
    - Add policy for admin users
*/

-- Create policy to allow admins to invite users
CREATE POLICY "Allow admin users to invite"
  ON auth.users
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );