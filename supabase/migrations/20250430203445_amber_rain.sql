/*
  # Fix user profile creation trigger

  1. Changes
    - Update handle_new_user function to use logged_id instead of UUID
    - Handle both signup and invite flows correctly
    - Add proper error handling
    - Maintain existing functionality

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
DECLARE
  invite_record RECORD;
BEGIN
  -- Check if user was created through signup (has company_name in metadata)
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    -- Create user profile for signup
    INSERT INTO public.user_profile (
      logged_id,
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
      (NEW.raw_user_meta_data->>'company_id')::bigint,
      NOW()
    );
  ELSE
    -- User created through invitation
    SELECT * INTO invite_record
    FROM user_invite
    WHERE email = NEW.email
    AND status_id = 1; -- Only pending invites

    IF FOUND THEN
      -- Create user profile from invite
      INSERT INTO public.user_profile (
        logged_id,
        email,
        name,
        company_id,
        role_id,
        created_at
      )
      VALUES (
        NEW.id,
        invite_record.email,
        invite_record.name,
        invite_record.company_id,
        COALESCE(invite_record.role_id, 2), -- Default to role 2 if not specified
        NOW()
      );

      -- Update invite status to accepted
      UPDATE user_invite
      SET status_id = 3, -- Approved
          accepted_at = now()
      WHERE id = invite_record.id;
    END IF;
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