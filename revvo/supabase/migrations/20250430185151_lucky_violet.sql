/*
  # Fix user invite permissions and policies

  1. Changes
    - Drop existing incorrect policies
    - Create proper RLS policies for user management
    - Add admin role check functions
    - Set up proper invite permissions

  2. Security
    - Ensure only admins can invite users
    - Maintain data integrity
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profile up
    WHERE up.logged_id = auth.uid()
    AND up.role_id = 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Allow admin users to invite" ON auth.users;
DROP POLICY IF EXISTS "Allow admin users to invite" ON auth.users_invite;
DROP POLICY IF EXISTS "Allow admins to manage users" ON public.user_profile;

-- Create comprehensive policy for user management
CREATE POLICY "Allow admins to manage users"
  ON public.user_profile
  FOR ALL
  TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- Enable RLS on user_profile if not already enabled
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;