/*
  # Update user trigger to use company_id from metadata

  1. Changes
    - Update handle_new_user function to use company_id from metadata
    - Remove hardcoded company_id value
    - Maintain existing functionality
    - Add error handling

  2. Security
    - Maintain security definer
    - Keep existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if user was created through signup (has company_name in metadata)
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    -- Create user profile for signup
    INSERT INTO public.user_profile (
      "UUID",
      email,
      name,
      role_id,
      company_id,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      1,  -- Default role_id for company creator
      (NEW.raw_user_meta_data->>'company_id')::bigint,  -- Use company_id from metadata
      NOW()
    );
  ELSE
    -- User created through invitation
    INSERT INTO public.user_profile (
      "UUID",
      email,
      name,
      company_id,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_user_meta_data->>'company_id')::bigint,  -- Use company_id from metadata
      NOW()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE LOG 'Error detail: %', SQLSTATE;
    RAISE LOG 'User data: %', NEW.raw_user_meta_data;
    RAISE;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();